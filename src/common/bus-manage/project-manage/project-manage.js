import './page.css';
import pageTpl from './page.html';
import TableUtil from '../../../utils/table-util';
import modalTpl from './modal.html';
import modifyModalTpl from './modal-modify.html';
import template from './template';
import i18n from '../../../i18n/i18n';
import DialogUtil from '../../../utils/dialog-util';

const page = {
    pageDom: null,
    dataTable: null,
    tableOptions: {
        custom: {
            formatter: {
                type: (cellvalue) => {
                    if (cellvalue == 0) {
                        return '新项目';
                    } else {
                        return '变更';
                    }
                },
            },
           /* unformat: {
                type: (cellvalue) => {
                    if (cellvalue == '新项目') {
                        return 0;
                    } else {
                        return 1;
                    }
                },
            }*/
        }
    },
    load: function (target, TabControlUtil) {
        const tabBox = $(i18n.$html(pageTpl));
        tabBox.appendTo($('#sys-main-page-tabs'));
        tabBox.attr('box', target.id);
        page.pageDom = tabBox;

        // 新加页面事件处理
        $('>div[box=' + target.id + ']', TabControlUtil.boxs).initUI();
        // 添加对应选项卡
        TabControlUtil.open({
            id: target.id,
            text: target.innerText,
            close: true
        });
        // 模糊查询
        $('input[name=productName]', this.pageDom).initFuzzySearch({
            type: 45
        });
        $('input[name=projectName]', this.pageDom).initFuzzySearch({
            type: 35
        });
        $('input[name=code]', this.pageDom).initFuzzySearch({
            type: 33
        });
        $('input[name=projectDirectorName]', this.pageDom).initFuzzySearch({
            type: 36
        });
        // 数据表格
        page.dataTable = new TableUtil(
            'emes-page-table-project-manage',
            '/mes/project/manage/report/all',
            page.tableOptions
        );


        // 获取选择框内容
        $.ajax({
            type: 'GET',
            url: 'mes/project/search/data',
            dataType: 'json',
            success: function (res) {
                const optionTemplate = Handlebars.compile(template.optionTpl);
                $('select[name=id]', page.pageDom).html(optionTemplate(res.data.projectInfos));
                $('select[name=type]', page.pageDom).html(optionTemplate(res.data.projectType));
                $('select[name=directorId]', page.pageDom).html(optionTemplate(res.data.employee));
                $('select[name=productId]', page.pageDom).html(optionTemplate(res.data.products));
                const optionsTemplate = Handlebars.compile(template.optionsTpl);
                $('select[name=orderId]', page.pageDom).html(optionsTemplate(res.data.order));
                // bootstrap-select表格refresh
                $('.selectpicker', page.pageDom).selectpicker('refresh');
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });

        // 生成数据表格
        this.refreshTable();

        // 查询
        $('.search-btn-group .search-query', page.pageDom).bind('click', function () {
            page.refreshTable();
        });

        // 添加
        $('.btn-group-add', page.pageDom).bind('click', function () {
            $('.emes-modal-title label').html('添加项目管理');
            $('.emes-modal-title .emes-modal-uploadphoto').html('');
            const modalContent = Handlebars.compile(i18n.$html(modalTpl));
            $('#modalContent').html(modalContent());

            $('#sys-main-mode-tabs').modal('show');
            $('#sys-main-mode-tabs').initUI();
            // 填充模态框内容
            $.ajax({
                type: 'GET',
                url: 'mes/project/project/type',
                dataType: 'json',
                success: function (res) {
                    const projectTypeModal = $('.emes-modal-content-project');
                    const optionTemplate = Handlebars.compile(template.selectTpl);
                    $('optgroup[item=projectTypes]', projectTypeModal).html(optionTemplate(res.data));
                    $('.selectpicker', projectTypeModal).selectpicker('refresh');
                    // 刷新新增form内容
                    page.refreshAddContentForm();
                    $('.selectpicker', projectTypeModal).on('hidden.bs.select', () => {
                        page.updateForm();
                    });
                }
            });
            var flag=false;
            $('input[name=name]', '#sys-main-mode-tabs').unbind('blur').bind('blur', () => {
                const projectName=$('input[name=name]', '#sys-main-mode-tabs').val();
                $.ajax({
                    url: '/mes/project/name/repetition',
                    type: 'get',
                    dataType: 'json',
                    data: {
                        "name":projectName
                    },
                    success: (res) => {
                        if (res.success) {
                            const size=res.data;
                            if(size>0){
                                DialogUtil.showDialog({
                                    message: '项目名称不能重复！',
                                    type: 'alert'
                                });
                            }else {
                                flag=true;
                            }
                        }else {
                            alert(res.msg);
                        }
                    },
                    error: (res) => {
                        console.error(res.responseText);
                    }
                });
            });
            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs .emes-modal-content-form')[1].getAttribute('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag && flag) {
                    page.add();
                }
            });
        });

        // 刪除
        $('.btn-group-delete', page.pageDom).bind('click', function () {
            page.del();
        });

        // 修改
        $('.btn-group-modify', page.pageDom).bind('click', function () {
            const selIds = page.dataTable.getSelIds();
            if (selIds.length === 0) {
                DialogUtil.showDialog({
                    message: '请选择修改行!',
                    type: 'alert'
                });
                return;
            } else if (selIds.length > 1) {
                DialogUtil.showDialog({
                    message: '只可修改一条记录!',
                    type: 'alert'
                });
                return;
            }

            const rowId = selIds[0];
            const rowData = page.dataTable.getRowData(rowId);

            // 填充模态框内容
            $.ajax({
                type: 'GET',
                url: '/mes/project/project/details',
                dataType: 'json',
                data: {
                    id: rowId
                },
                success: function (res) {
                    // 显示模态框
                    $('.emes-modal-title label').html('修改项目管理');
                    $('.emes-modal-title .emes-modal-uploadphoto').html('');
                    const modalContent = Handlebars.compile(i18n.$html(modifyModalTpl));
                    $('#modalContent').html(modalContent());
                    $('#sys-main-mode-tabs').initUI();
                    $('#sys-main-mode-tabs').modal('show');

                    // 填充选择框内容
                    const data = res.data;
                    const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');

                    // 填充数据
                    $('input[item=quantity]', contentForm)[0].value = data.order.length;
                    $('input[name=id]', contentForm)[0].value = rowId;
                    $('input[name=code]', contentForm)[0].value = rowData.code;
                    $('input[select-name=orderId]', contentForm)[0].value=rowData.orderCode;
                    $('input[item=deliveryDate]', contentForm)[0].value = rowData.deliveryDate;
                    $('input[item=planDates]', contentForm)[0].value = rowData.planDate;
                    $('input[name=name]', contentForm)[0].value = rowData.name;
                    $('input[item=type]', contentForm).val(rowData.type);
                    $('input[item=productName]', contentForm)[0].value = rowData.productName;
                    $('input[item=clientName]', contentForm)[0].value = rowData.clientName;
                    $('input[select-name=directorId]', contentForm)[0].value=rowData.directorName;

                     const orderIds=$('input[select-name=orderId]', contentForm).initFuzzySearch({
                        type: 52,
                        selectbox: true,
                        nameKey: 'code',
                        idKey: 'orderId',
                        selectCallback: (data) => {
                            $('input[item=quantity]', contentForm).val(data.quantity);
                            $('input[item=productName]', contentForm).val(data.productName);
                            $('input[item=clientName]', contentForm).val(data.clientName);
                            $('input[item=deliveryDate]', contentForm).val(data.deliveryDate);
                        }
                    });
                    orderIds.setValue(rowData.orderCode);
                    $('input[select-name=directorId]', contentForm).initFuzzySearch({
                        type: 49,
                        params:{'extraParame':'biz_project_director_depart'},
                        selectbox: true,
                        nameKey: 'name',
                        idKey: 'id',
                        selectCallback: (data) => {
                            console.log(data);
                        }
                    });
                }
            });
            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    page.modify();
                }
            });
        });
    },

    // 刷新数据表格(查询或更新)
    refreshTable: function () {
        // 获取表单数据
        const dataArr = $('.emes-search-form', page.pageDom).serializeArray();
        const data = {
            page: 1,
            pageSize: 10
        };
        Object.keys(dataArr).forEach((key) => {
            const name = dataArr[key].name;
            const value = dataArr[key].value;
            data[name] = value;
        });

        $.ajax({
            url: '/mes/project/manage/report/all',
            type: 'get',
            dataType: 'json',
            data: data,
            success: function (res) {
                page.dataTable.dataGrid(res.data);
            },
            error: function () {
                DialogUtil.showDialog({
                    message: '查询失败!',
                    type: 'alert'
                });
            }
        });
    },
    updateForm: function () {
        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        const projectTypeModal = $('.emes-modal-content-project');
        const projectType = $('.selectpicker', projectTypeModal).selectpicker('val');
        $.ajax({
            type: 'GET',
            url: '/mes/project/data-for-add',
            dataType: 'json',
            data: {
                status: projectType
            },
            success: function (res) {
                const data = res.data;
                if (data.code) {
                   var  projectType=data.projectTypes;
                    $('input[name=code]', contentForm)[0].value = data.code;
                    $('input[name=code]', contentForm)[0].setAttribute('readonly', true);
                    const optionTemplate = Handlebars.compile(template.selectTpl);
                    $('select[name=type]', contentForm).html(optionTemplate([{
                        id: projectType.id,
                        name: projectType.value
                    }]));
                    $('.selectpicker', contentForm).selectpicker('refresh');
                }
            }
        });

    },
    // 更新添加表单的内容
    refreshAddContentForm: function () {
        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        contentForm.removeClass('hidden');
        const projectTypeModal = $('.emes-modal-content-project');
        const projectType = $('.selectpicker', projectTypeModal).selectpicker('val');
        $('input[select-name=orderId]', contentForm).initFuzzySearch({
            type: 52,
            selectbox: true,
            nameKey: 'code',
            idKey: 'orderId',
            selectCallback: (data) => {
                $('input[item=quantity]', contentForm).val(data.quantity);
                $('input[item=productName]', contentForm).val(data.productName);
                $('input[item=clientName]', contentForm).val(data.clientName);
                $('input[item=deliveryDate]', contentForm).val(data.deliveryDate);
            }
        });
        $('input[select-name=directorId]', contentForm).initFuzzySearch({
            type: 49,
            params:{'extraParame':'biz_project_director_depart'},
            selectbox: true,
            nameKey: 'name',
            idKey: 'id',
            selectCallback: (data) => {
                console.log(data);
            }
        });
        // 填充模态框内容
        $.ajax({
            type: 'GET',
            url: '/mes/project/data-for-add',
            dataType: 'json',
            data: {
                status: projectType
            },
            success: function (res) {
                const data = res.data;
                const projectType = data.projectTypes;
                const codeTemplate = Handlebars.compile(template.codeTpl);

                $('select[name=orderId]', contentForm).html(codeTemplate(data.order));
                const optionTemplate = Handlebars.compile(template.selectTpl);
                $('select[name=directorId]', contentForm).html(optionTemplate(data.employee));

                $('select[name=type]', contentForm).html(optionTemplate([{
                    id: projectType.id,
                    name: projectType.value
                }]));
                $('.selectpicker', contentForm).selectpicker('refresh');
                if (data.code) {
                    $('input[name=code]', contentForm)[0].value = data.code;
                    $('input[name=code]', contentForm)[0].setAttribute('readonly', true);
                }

                // 刷新和订单相关信息
                const refreshOrder = function () {
                    data.order.forEach((order) => {
                        const selOrderId = $('select[name=orderId]', contentForm).selectpicker('val');
                        if (order.id == selOrderId) {
                            $('input[item=productName]', contentForm)[0].value = order.productName;
                            $('input[item=clientName]', contentForm)[0].value = order.clientName;
                            $('input[item=deliveryDate]', contentForm)[0].value = order.deliveryDate;
                        }
                    });
                };

                refreshOrder();

                $('select[name=orderId]', contentForm).on('hidden.bs.select', () => {
                    refreshOrder();
                });
            }
        });
    },

    // 向后台添加
    add: function () {
        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        const formParam = contentForm.serialize();
        const planDates = $('input[item=planDates]', contentForm)[0].value;
        $.ajax({
            url: '/mes/project/insert',
            type: 'post',
            dataType: 'json',
            data: formParam + `&planDates=${planDates}`,
            success: function (data) {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '添加成功!',
                        type: 'alert'
                    });
                    $('#sys-main-mode-tabs').modal('hide');
                    page.refreshTable();
                }
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    // 修改
    modify: function () {
        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        const formParam = contentForm.serialize();
        const planDates = $('input[item=planDates]', contentForm)[0].value;
        $.ajax({
            url: '/mes/project/insert',
            type: 'post',
            dataType: 'json',
            data: formParam + `&planDates=${planDates}`,
            success: function (data) {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '修改成功!',
                        type: 'alert'
                    });
                    $('#sys-main-mode-tabs').modal('hide');
                    // TODO 使用单条数据更新
                    page.refreshTable();
                }
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    // 刪除
    del: function () {
        const ids = page.dataTable.getSelIds();

        if (ids.length == 0) {
            DialogUtil.showDialog({
                message: '请选择要删除的数据!',
                type: 'alert'
            });
        } else {
            DialogUtil.showDialog({
                message: i18n.$t('emes.confirmDelete'),
                type: 'confirm',
                callback: () => {
                    $.ajax({
                        url: '/mes/project/delete',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            listId: ids.toString()
                        },
                        success: function (data) {
                            if (data.success) {
                                DialogUtil.showDialog({
                                    message: '删除成功!',
                                    type: 'alert',
                                    callback: (status) => {
                                        console.log(123);
                                    }
                                });
                                page.refreshTable();
                            }
                        },
                        error: function (res) {
                            console.error(res.responseText);
                        }
                    });
                }
            });
        }
    }
};

export default page;
