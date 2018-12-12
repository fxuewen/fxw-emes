import './page.css';
import pageTpl from './page.html';
import modalTpl from './modal.html';
import i18n from '../../../i18n/i18n';
import TableUtil from '../../../utils/table-util';
import ValidatorUtil from '../../../utils/validator-util';
import DialogUtil from '../../../utils/dialog-util';

const page = {
    pageDom: null,
    dataTable: new TableUtil('emes-page-table-area', 'mes/area/report/query'),
    optionTpl: '{{#each data}}<option value="{{id}}">{{code}}</option>{{/each}}',
    fData: null,
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

        // 模糊查询
        $('input[name=name]', this.pageDom).initFuzzySearch({
            type: 20
        });
        $('input[name=color]', this.pageDom).initFuzzySearch({
            type: 21
        });
        $('input[name=code]', this.pageDom).initFuzzySearch({
            type: 22
        });

        // 添加
        $('.btn-group-add', page.pageDom).bind('click', function () {
            $('.emes-modal-title label').html('添加区域信息');
            // 添加模态框样式大小
            page.refreshModal();

            $('input[select-name=factoryId]', $('#sys-main-mode-tabs')).initFuzzySearch({
                type: 42,
                selectbox: true,
                nameKey: 'code',
                idKey: 'id',
                // 选择事件
                selectCallback: (data) => {
                    $('input[name="factoryName"]', $('#sys-main-mode-tabs')).val(data.name);
                }
            });
            $('.em-user-set').css('display', 'block');
            $('#sys-main-mode-tabs').modal('show');
            $('#sys-main-mode-tabs').initUI();
            const validatorUtil = new ValidatorUtil('em-submit-form', false);
            validatorUtil.initValidator();
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
            const rowId = page.dataTable.getSelIds()[0];
            const rowData = page.dataTable.getRowData(rowId);
            rowData.id = rowId;
            if (page.dataTable.getSelIds().length === 0) {
                DialogUtil.showDialog({
                    message: '请选择修改行!',
                    type: 'alert',
                    delay: 5
                });
                return;
            } else if (page.dataTable.getSelIds().length > 1) {
                DialogUtil.showDialog({
                    message: '只可修改一条记录!',
                    type: 'alert',
                    delay: 5
                });
                return;
            }
            $('.emes-modal-title label').html('修改区域信息');
            page.refreshModal(rowData);
            $('#sys-main-mode-tabs').modal('show');
            $('#sys-main-mode-tabs').initUI();
            const validatorUtil = new ValidatorUtil('em-submit-form', false);
            validatorUtil.initValidator();
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
        const formParam = $('.emes-search-form', page.pageDom).serialize();
        const data = {
            page: 1,
            pageSize: 10
        };
        $.ajax({
            url: '/mes/area/report/query',
            type: 'get',
            dataType: 'json',
            data: $.param(data) + `&${formParam}`,
            success: function (res) {
                page.dataTable.dataGrid(res.data);
            },
            error: function () {
                DialogUtil.showDialog({
                    message: '查询失败!',
                    type: 'alert',
                    delay: 5
                });
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
            $('input[select-name="factoryId"]', $('.emes-modal-content')).val(data.factoryCode);
            //$('input[name="factoryName"]', $('#sys-main-mode-tabs')).val(data.factoryName);
            $('input[select-name=factoryId]', $('#sys-main-mode-tabs')).initFuzzySearch({
                type: 42,
                selectbox: true,
                nameKey: 'code',
                idKey: 'id',
                // 选择事件
                selectCallback: (res) => {
                    $('input[name="factoryName"]', $('#sys-main-mode-tabs')).val(res.name);
                }
            });
        }
    },

    // 添加区域信息
    add: function () {
        $.ajax({
            url: 'mes/area/add',
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
                    DialogUtil.showDialog({
                        message: res.msg,
                        type: 'alert',
                        delay: 5
                    });
                }
                page.refreshTable();
            },
            error: function (res) {
                DialogUtil.showDialog({
                    message: res.responseText,
                    type: 'alert',
                    delay: 5
                });
            }
        });
    },

    // 修改
    modify: function () {
        $.ajax({
            url: '/mes/area/update',
            type: 'post',
            dataType: 'json',
            data: $('.form-horizontal').serialize(),
            success: function (res) {
                if (res.success) {
                    DialogUtil.showDialog({
                        message: '修改成功',
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
                    message: '修改失败',
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
                message: '请选择要删除的数据',
                type: 'alert',
                delay: 5
            });
        } else {
            DialogUtil.showDialog({
                message: i18n.$t('emes.confirmDelete'),
                type: 'confirm',
                callback: () => {
                    $.ajax({
                        url: '/mes/area/delete',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            'ids': ids
                        },
                        success: function (res) {
                            if (res.success) {
                                page.dataTable.delRowData(ids);
                                page.refreshTable();
                            }
                        },
                        error: function () {
                            DialogUtil.showDialog({
                                message: '删除失败',
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
