import './page.css';
import pageTpl from './page.html';
import modalTpl from './modal.html';
import template from './template';
import TableUtil from '../../../utils/table-util';
import i18n from '../../../i18n/i18n';
import DialogUtil from '../../../utils/dialog-util';

const page = {
    pageDom: null,
    dataTable: new TableUtil('emes-page-table-line', 'mes/line/report/query'),
    optionTpl: '{{#each data}}<option value="{{id}}">{{code}}</option>{{/each}}',
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

        // 生成数据表格
        this.refreshTable();

        // 查询
        $('.search-btn-group .search-query', page.pageDom).bind('click', function () {
            page.refreshTable();
        });


        // 添加
        $('.btn-group-add', page.pageDom).bind('click', function () {
            $('.emes-modal-title label').html('添加线体信息');
            page.refreshModal();
            page.initInfo();
            $('.em-user-set').css('display', 'block');
            $('#sys-main-mode-tabs').modal('show');
            $('#sys-main-mode-tabs').initUI();
            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    page.add();
                }
            });

            $('input[select-name=areaCode]', '.emes-modal-content').initFuzzySearch({
                type: 101,
                selectbox: true,
                nameKey: 'code',
                idKey: 'id',
                // 选择事件
                selectCallback: (data) => {
                    $('input[name=areaId]','.emes-modal-content').val(data.id);
                    $('input[name=areaName]','.emes-modal-content').val(data.name);
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
            const rowId = selIds[0];
            const rowData = page.dataTable.getRowData(rowId);
            rowData.id = rowId;
            if (selIds.length === 0) {
                DialogUtil.showDialog({
                    message: '请选择修改行!',
                    type: 'alert',
                    delay: 5
                });
                return;
            } else if (selIds.length > 1) {
                // 将保存按钮的事件处理改为修改
                DialogUtil.showDialog({
                    message: '只可修改一条记录!',
                    type: 'alert',
                    delay: 5
                });
                return;
            }
            $('.emes-modal-title label').html('修改线体信息');

            page.refreshModal(rowData);
            $('#sys-main-mode-tabs').modal('show');
            $('#sys-main-mode-tabs').initUI();


            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    page.modify();
                }

            });

            // 补充数据
            page.initInfo(rowData);
            $('input[name=areaName]','.emes-modal-content').val(rowData.areaName);


            // 添加模态框显示样式大小
            $('#sys-main-mode-tabs').modal('show');
            const fuzzySearch = $('input[select-name=areaCode]', '.emes-modal-content').initFuzzySearch({
                type: 101,
                selectbox: true,
                nameKey: 'code',
                idKey: 'id',
                // 选择事件
                selectCallback: (data) => {
                    $('input[name=areaId]','.emes-modal-content').val(data.id);
                    $('input[name=areaName]','.emes-modal-content').val(data.name);
                }
            });
            fuzzySearch.setValue(rowData.areaCode);
        });
        // 模糊查询
        $('input[name=name]', this.pageDom).initFuzzySearch({
            type: 24
        });
        $('input[name=code]', this.pageDom).initFuzzySearch({
            type: 25
        });
    },

    // 刷新数据表格(查询或更新)
    refreshTable: function () {
        const formParam = $('.emes-search-form', page.pageDom).serialize();
        const data = {
            page: 1,
            pageSize: 10
        };
        $.ajax({
            url: '/mes/line/report/query',
            type: 'get',
            dataType: 'json',
            data: $.param(data) + `&${formParam}`,
            success: function (res) {
                page.dataTable.dataGrid(res.data);
            },
            error: function () {
                alert('查询失败');
            }
        });
    },

    // 刷新模态框
    refreshModal: function (data) {
        const modalContent = Handlebars.compile(modalTpl);
        // Handllebars填充模板数据
        if (data == null || data == 'undefined') {
            $('#modalContent').html(modalContent({}));
        } else {
            $('#modalContent').html(modalContent(data));
        }
    },

    // 添加设备信息
    add: function () {
        $.ajax({
            url: 'mes/line/add',
            type: 'post',
            dataType: 'json',
            data: $('.form-horizontal').serialize(),
            success: function (res) {
                if (res.success) {
                    $('#sys-main-mode-tabs').modal('hide');
                    DialogUtil.showDialog({
                        message: '新增成功!',
                        type: 'alert',
                        delay: 5
                    });
                } else {
                    DialogUtil.showDialog({
                        message: res.msg,
                        type: 'alert',
                        delay: 5
                    });
                }
                page.refreshTable();
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    // 修改
    modify: function () {
        $.ajax({
            url: '/mes/line/update',
            type: 'post',
            dataType: 'json',
            data: $('.form-horizontal').serialize(),
            success: function (res) {
                if (res.success) {
                    DialogUtil.showDialog({
                        message: '修改成功!',
                        type: 'alert',
                        delay: 5
                    });
                    $('#sys-main-mode-tabs').modal('hide');
                } else {
                    DialogUtil.showDialog({
                        message: res.msg,
                        type: 'alert',
                        delay: 5
                    });
                }
                page.refreshTable();
            },
            error: function () {
                alert('修改失败');
            }
        });
    },

    // 删除
    del: function () {
        const ids = page.dataTable.getSelIds();
        if (ids.length == 0) {
            DialogUtil.showDialog({
                message: '请选择要删除的数据!',
                type: 'alert',
                delay: 5
            });
        } else {
            DialogUtil.showDialog({
                message: i18n.$t('emes.confirmDelete'),
                type: 'confirm',
                callback: () => {
                    $.ajax({
                        url: '/mes/line/delete',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            'ids': ids
                        },
                        success: function (data) {
                            if (data.success) {
                                page.dataTable.delRowData(ids);
                                page.refreshTable();
                                DialogUtil.showDialog({
                                    message: '删除成功!',
                                    type: 'alert',
                                    delay: 5
                                });
                            }
                        },
                        error: function () {
                            DialogUtil.showDialog({
                                message: '删除失败!',
                                type: 'alert',
                                delay: 5
                            });
                        }
                    });
                }
            });

        }
    },

    /**
     * 补充模态框中下拉框数据
     */
    initInfo: function (rowData) {
        const contentModal = $('.emes-modal-content');
        // 填充模态框内容
        $.ajax({
            url: '/mes/area/report/all',
            type: 'get',
            dataType: 'json',
            success: function (res) {
                const temp = Handlebars.compile(template.optionTpl);
                $('select[item=\'areaCode\']', contentModal).html(temp(res.data));
                $('.selectpicker', contentModal).selectpicker('refresh');
                $('select[item=\'areaCode\']', contentModal).on('change', function () {
                    page.areaCodeSelect(this);
                });
                if (!rowData) {
                    return;
                }
                const data = res.data;
                data.forEach(element => {
                    if (element.code === rowData.areaCode) {
                        $('select[item=\'areaCode\']', contentModal).selectpicker('val', element.id);
                    }
                });
            },
            error: function () {
                alert('查询失败');
            }
        });
    },

    // 选择负责人编号联动出负责人名称
    areaCodeSelect: function (dom) {
        const contentModal = $('.emes-modal-content');
        $('input[name="areaCode"]', contentModal).val($(dom).find('option:selected').text());
        $.ajax({
            url: 'mes/area/code/info',
            type: 'get',
            dataType: 'json',
            data: {
                'areaCode': `${$(dom).find('option:selected').text()}`
            },
            success: function (data) {

                if (data.data) {
                    $('input[name="areaName"]', contentModal).val(data.data.name);
                    $('input[name="areaId"]', contentModal).val(data.data.id);
                } else {
                    $('input[name="areaName"]', contentModal).val('');
                }
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },


};


export default page;
