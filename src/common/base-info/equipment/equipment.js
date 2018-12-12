import './page.css';
import pageTpl from './page.html';
import modalTpl from './modal.html';
import template from './template';
import TableUtil from '../../../utils/table-util';
import i18n from '../../../i18n/i18n';
import DialogUtil from '../../../utils/dialog-util';


const page = {
    pageDom: null,
    dataTable: null,
    optionTpl: '{{#each data}}<option value="{{id}}">{{code}}</option>{{/each}}',
    tableOptions : {
        custom: {
            formatter: {
                // 设备类型
                type: (colValue) => {
                    if (colValue === 1) {
                        return '冲压';
                    }else if (colValue === 2) {
                        return '注塑';
                    }else if(colValue === 3) {
                        return '焊接';
                    }else{
                        return ' ';
                    }
                },
            },
            unformat: {
                type: (cellValue) => {
                    switch (cellValue) {
                    case '冲压':
                        return 1;
                    case '注塑':
                        return 2;
                    case '焊接':
                        return 3;
                    default:
                        return ' ';
                    }
                }
            },
        }
    },
    load: function (target, TabControlUtil) {
        const tabBox = $(i18n.$html(pageTpl));
        tabBox.appendTo($('#sys-main-page-tabs'));
        tabBox.attr('box', target.id);
        page.pageDom = tabBox;
        page.dataTable = new TableUtil('emes-page-table-equipment', 'mes/equipment/report/query',page.tableOptions);
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
            $('.emes-modal-title label').html('添加设备信息');
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
            const contentModal = $('.emes-modal-content');
            $('input[select-name=lineId]', contentModal).initFuzzySearch({
                type: 48,
                selectbox: true,
                nameKey: 'lname',
                idKey: 'lid',
                // 选择事件
                selectCallback: (data) => {

                    $('input[name=areaId]','.emes-modal-content').val(data.aid);
                    $('input[name=areaName]','.emes-modal-content').val(data.aname);
                    $('input[name=areaCode]','.emes-modal-content').val(data.acode);
                    $('input[select-name=lineId]','.emes-modal-content').val(data.lname);
                }
            });

            $('input[select-name=supplierId]', contentModal).initFuzzySearch({
                type: 100,
                selectbox: true,
                nameKey: 'name',
                idKey: 'id',
                // 选择事件
                selectCallback: (data) => {
                    $('input[name=supplierName]',contentModal).val(data.name);
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
            $('.emes-modal-title label').html('修改设备信息');
            page.refreshModal(rowData);
            // 补充数据
            page.initInfo(rowData);
            $('input[name=areaName]','.emes-modal-content').val(rowData.areaName);
            $('input[select-name=lineId]','.emes-modal-content').val(rowData.lineName);
            $('input[name=areaCode]','.emes-modal-content').val(rowData.areaCode);
            // 设置线体id
            page.setLineId(rowData.id);

            // 添加模态框显示样式大小
            $('#sys-main-mode-tabs').modal('show');
            $('#sys-main-mode-tabs').initUI();
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    page.modify();
                }
            });
            const contentModal = $('.emes-modal-content');
            $('input[select-name=lineId]', contentModal).initFuzzySearch({
                type: 48,
                selectbox: true,
                nameKey: 'lname',
                idKey: 'lid',
                // 选择事件
                selectCallback: (data) => {
                    $('input[name=areaId]','.emes-modal-content').val(data.aid);
                    $('input[name=areaName]','.emes-modal-content').val(data.aname);
                    $('input[name=areaCode]','.emes-modal-content').val(data.acode);
                    $('input[select-name=lineId]','.emes-modal-content').val(data.lname);
                }
            });
            const fuzzySearch = $('input[select-name=supplierId]', contentModal).initFuzzySearch({
                type: 100,
                selectbox: true,
                nameKey: 'name',
                idKey: 'id',
                // 选择事件
                selectCallback: (data) => {
                    $('input[name=supplierName]',contentModal).val(data.name);
                }
            });
            fuzzySearch.setValue(rowData.supplierName);
        });

        // 模糊查询
        $('input[name=name]', this.pageDom).initFuzzySearch({
            type: 18
        });
        $('input[name=code]', this.pageDom).initFuzzySearch({
            type: 19
        });


        // 设备类型
        $.ajax({
            url: '/mes/equipment//globalDefine/query',
            type: 'get',
            dataType: 'json',
            success: function (res) {
                $('.emes-search-form select[name=type]', this.pageDom).append('<option value="">==请选择==</option>');
                if(res != null && res != ''){
                    const rtn = res.data;
                    rtn.forEach(element => {
                        $('.emes-search-form select[name=type]', this.pageDom).append('<option value="'+element.value+'">'+element.desc+'</option>');
                    });
                }
            },
            error: function () {
                alert('查询失败');
            }
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
            url: '/mes/equipment/report/query',
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
        const contentModal = $('#sys-main-mode-tabs');
        // Handllebars填充模板数据
        if (data == null || data == 'undefined') {
            $('#modalContent').html(modalContent({}));
        } else {
            $('#modalContent').html(modalContent(data));
        }
        $.ajax({
            url: '/mes/equipment//globalDefine/query',
            type: 'get',
            dataType: 'json',
            success: function (res) {
                const temp = Handlebars.compile(template.optionEquipmentTypeTpl);
                $('select[item=\'type\']', contentModal).html(temp(res.data));
                $('.selectpicker', contentModal).selectpicker('refresh');
                if(data){
                    $('select[item=\'type\']', $('#modalContent')).selectpicker('val', data.type);
                }
            },
            error: function () {
                alert('查询失败');
            }
        });




    },
    setLineId:function(id){
        $.ajax({
            url: '/mes/equipment/getEquipmentByKeyId',
            type: 'get',
            dataType: 'json',
            data:{'id':id},
            success: function (res) {
                $('input[name=lineId]','.emes-modal-content').val(res.data.lineId);
            },
            error: function () {
                alert('查询失败');
            }
        });
    },

    // 添加设备信息
    add: function () {
        $.ajax({
            url: 'mes/equipment/add',
            type: 'post',
            dataType: 'json',
            data: $('.form-horizontal').serialize(),
            success: function (res) {
                if (res.success) {
                    DialogUtil.showDialog({
                        message: '新增成功!',
                        type: 'alert',
                        delay: 5
                    });
                    $('#sys-main-mode-tabs').modal('hide');
                } else {
                    alert(res.msg);
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
            url: '/mes/equipment/update',
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
                    alert(res.msg);
                }
                page.refreshTable();
            },
            error: function () {
                DialogUtil.showDialog({
                    message: '修改失败!',
                    type: 'alert',
                    delay: 5
                });
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
                        url: '/mes/equipment/delete',
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
     * @param {Object} record
     */
    initInfo: function (rowData) {
        const contentModal = $('.emes-modal-content');
        // 填充模态框内容
        $.ajax({
            url: '/mes/line/report/all',
            type: 'get',
            dataType: 'json',
            success: function (res) {
                const temp = Handlebars.compile(template.optionEquipmentTpl);
                $('select[item=\'lineName\']', contentModal).html(temp(res.data));
                $('.selectpicker', contentModal).selectpicker('refresh');
                $('select[item=\'lineName\']', contentModal).on('change', function () {
                    page.lineNameSelect(this);
                });
                if (rowData) {
                    const data = res.data;
                    data.forEach(element => {
                        if (element.name === rowData.lineName) {
                            $('select[item=\'lineName\']', contentModal).selectpicker('val', element.id);
                        }
                    });
                }
            },
            error: function () {
                alert('查询失败');
            }
        });

        $.ajax({
            url: '/mes/supplier/report/all',
            type: 'get',
            dataType: 'json',
            success: function (res) {
                const temp = Handlebars.compile(template.optionEquipmentTpl);
                $('select[item=\'supplierName\']', contentModal).html(temp(res.data.list));
                $('.selectpicker', contentModal).selectpicker('refresh');
                const data = res.data.list;
                if (rowData) {
                    data.forEach(element => {
                        if (element.name === rowData.supplierName) {
                            $('select[item=\'supplierName\']', contentModal).selectpicker('val', element.id);
                        }
                    });
                }
            },
            error: function () {
                alert('查询失败');
            }
        });

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
                if (rowData) {
                    const data = res.data;
                    data.forEach(element => {
                        if (element.code === rowData.areaCode) {
                            $('select[item=\'areaCode\']', contentModal).selectpicker('val', element.id);
                        }
                    });
                }
            },
            error: function () {
                alert('查询失败');
            }
        });
    },

    // 选择区域编号联动出区域名称
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
    lineNameSelect: function (dom) {
        const contentModal = $('.emes-modal-content');
        $('input[name="lineName"]', contentModal).val($(dom).find('option:selected').text());
        $.ajax({
            url: 'mes/area/lineName/info',
            type: 'get',
            dataType: 'json',
            data: {
                'lineName': `${$(dom).find('option:selected').text()}`
            },
            success: function (data) {
                if (data.data) {
                    $('select[item=\'areaCode\']', contentModal).selectpicker('val', data.data.id);
                    $('input[name="areaName"]', contentModal).val(data.data.name);
                    $('input[name="areaId"]', contentModal).val(data.data.id);
                } else {
                    $('select[item=\'areaCode\']', contentModal).selectpicker('val', '');
                    $('input[name="areaName"]', contentModal).val('');
                    $('input[name="areaId"]', contentModal).val('');
                }
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    }
};
export default page;
