import './page.css';
import pageTpl from './page.html';
import modalTpl from './modal.html';
import TableUtil from '../../../utils/table-util';
import i18n from '../../../i18n/i18n';
import DialogUtil from '../../../utils/dialog-util';

const page = {
    pageDom: null,
    dataTable: new TableUtil('emes-page-table-job', '/mes/job/report/all'),

    load: function (target, TabControlUtil) {
        const tabBox = $(i18n.$html(pageTpl));
        tabBox.appendTo($('#sys-main-page-tabs'));
        tabBox.attr('box', target.id);
        page.pageDom = tabBox;
        // 添加对应选项卡
        TabControlUtil.open({
            id: target.id,
            text: target.innerText,
            close: true
        });
        // 新加页面事件处理
        $('>div[box=' + target.id + ']', TabControlUtil.boxs).initUI();


        // 模糊查询
        $('input[name=nameI18n]', this.pageDom).initFuzzySearch({
            type: 4
        });
        $('input[name=desc]', this.pageDom).initFuzzySearch({
            type: 5
        });
        $('input[name=level]', this.pageDom).initFuzzySearch({
            type: 6
        });


        // 生成数据表格
        page.refreshTable();

        // 查询
        $('.search-btn-group .search-query', page.pageDom).bind('click', function () {
            page.refreshTable();
        });

        // 添加
        $('.btn-group-add', page.pageDom).bind('click', function () {
            $('.emes-modal-title label').html('添加职务');
            // 去掉上传头像功能
            $('.emes-modal-title .emes-modal-uploadphoto').html('');
            page.refreshModal();
            $('#sys-main-mode-tabs').modal('show');
            $('#sys-main-mode-tabs').initUI();
            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save')[0].onclick = function () {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    page.add();
                }
            };
        });

        // 修改
        $('.btn-group-modify', page.pageDom).bind('click', function () {
            const selIds = page.dataTable.getSelIds();
            if (selIds.length === 0) {
                DialogUtil.showDialog({
                    message: '请选择修改行',
                    type: 'alert',
                    delay: 5
                });
                return;
            } else if (selIds.length > 1) {
                DialogUtil.showDialog({
                    message: '只可修改一条记录',
                    type: 'alert',
                    delay: 5
                });
                return;
            }
            const id = selIds[0];
            $.ajax({
                url: '/mes/job/detail',
                type: 'get',
                dataType: 'json',
                data: {
                    'id': id
                },
                success: function (data) {
                    $('.emes-modal-title label').html('修改职务信息');
                    page.refreshModal(data);
                    $('#sys-main-mode-tabs').modal('show');
                    $('#sys-main-mode-tabs').initUI();
                },
                error: function (res) {
                    console.error(res.responseText);
                }
            });

            // 将保存按钮的事件处理改为修改
            $('.emes-modal-save')[0].onclick = function () {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    page.modify();
                }
            };
        });

        // 刪除
        $('.btn-group-delete', page.pageDom).bind('click', function () {
            page.del();
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
            url: '/mes/job/report/all',
            type: 'get',
            dataType: 'json',
            data: $.param(data) + `&${formParam}`,
            success: function (res) {
                page.dataTable.dataGrid(res.data);
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },


    // 刷新模态框
    refreshModal: function (data) {
        const modalContent = Handlebars.compile(i18n.$html(modalTpl));
        // Handllebars填充模板数据
        if (data == null || data == 'undefined') {
            $('#modalContent').html(modalContent());
        } else {
            $('#modalContent').html(modalContent(data.data));
        }
    },

    // 向后台添加
    add: function () {
        $.ajax({
            url: '/mes/job/insert',
            type: 'post',
            dataType: 'json',
            data: $('#jobForm').serialize(),
            success: function (data) {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '新增成功',
                        type: 'alert',
                        delay: 5
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

    // 刪除
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
                        url: '/mes/job/delete',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            'ids': ids
                        },
                        success: function (data) {
                            if (!data.success) {
                                DialogUtil.showDialog({
                                    message: data.msg,
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
                }
            });
        }
    },

    // 修改
    modify: function () {
        $.ajax({
            url: '/mes/job/update',
            type: 'post',
            dataType: 'json',
            data: $('#jobForm').serialize(),
            success: function (data) {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '修改成功',
                        type: 'alert',
                        delay: 5
                    });

                    $('#sys-main-mode-tabs').modal('hide');
                    page.refreshTable();
                }
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    }
};

export default page;
