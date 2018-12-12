import './page.css';
import i18n from '../../../i18n/i18n';
import pageTpl from './page.html';
import modalTpl from './modal.html';
import TableUtil from '../../../utils/table-util';
import template from './template';
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
        page.dataTable = new TableUtil('emes-page-table-procedure', 'mes/procedure/report/query',page.tableOptions);
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
            $('.emes-modal-title label').html('添加工序信息');
            page.refreshModal();
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
                    message: '请选择修改行',
                    type: 'alert',
                    delay: 5
                });
                return;
            } else if (selIds.length > 1) {
                // 将保存按钮的事件处理改为修改
                DialogUtil.showDialog({
                    message: '只可修改一条记录',
                    type: 'alert',
                    delay: 5
                });
                return;
            }
            $('.emes-modal-title label').html('修改工序信息');

            page.refreshModal(rowData);
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
        });

        // 模糊查询
        $('input[name=name]', this.pageDom).initFuzzySearch({
            type: 26
        });
        $('input[name=code]', this.pageDom).initFuzzySearch({
            type: 27
        });

        // 工序类型
        $.ajax({
            url: '/mes/procedure/globalDefine/query',
            type: 'get',
            dataType: 'json',
            success: function (res) {
                $('.emes-search-form select[name=type]', page.pageDom).append('<option value="">==请选择==</option>');
                if(res != null && res != ''){
                    const rtn = res.data;
                    rtn.forEach(element => {
                        $('.emes-search-form select[name=type]', page.pageDom).append('<option value="'+element.value+'">'+element.desc+'</option>');
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
            url: '/mes/procedure/report/query',
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
        $.ajax({
            url: '/mes/procedure//globalDefine/query',
            type: 'get',
            dataType: 'json',
            success: function (res) {
                const contentModal = $('#sys-main-mode-tabs');
                const temp = Handlebars.compile(template.optionProcessTypeTpl);
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

    // 添加工序信息
    add: function () {
        $.ajax({
            url: 'mes/procedure/add',
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
            url: '/mes/procedure/update',
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
                        url: '/mes/procedure/delete',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            'ids': ids
                        },
                        success: function (res) {
                            if (res.success) {
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
};


export default page;
