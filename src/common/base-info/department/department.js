import './page.css';
import pageTpl from './page.html';
import infoTpl from './info.html';
import TreeGridUtil from '../../../utils/tree-grid-util';
import i18n from '../../../i18n/i18n';
import DialogUtil from '../../../utils/dialog-util';

const page = {
    pageDom: null,
    tree: null,

    load: function (target, TabControlUtil) {
        const tabBox = $(i18n.$html(pageTpl));
        tabBox.appendTo($('#sys-main-page-tabs'));
        tabBox.attr('box', target.id);
        page.pageDom = tabBox;

        page.tree = new TreeGridUtil($('#emes-page-tree-department', page.pageDom), page.treeSetting);

        // 新加页面事件处理
        $('>div[box=' + target.id + ']', TabControlUtil.boxs).initUI();
        // 添加对应选项卡
        TabControlUtil.open({
            id: target.id,
            text: target.innerText,
            close: true
        });

        $.ajax({
            type: 'GET',
            url: '/mes/department/all',
            dataType: 'json',
            success: function (res) {
                page.refreshTable();
                // 创建树形表格
                page.tree.initTree(res.data);
            }
        });
    },

    // 树形结构回调事件
    treeSetting: {
        callback: {
            onClick: (event, treeId, treeNode) => {
                page.clickItem(treeNode.id);
            },
            rightMenuAdd: (treeId, treeNode) => {
                console.log('rightMenuAdd');
                console.log(treeId);
                console.log(treeNode);
            },
            rightMenuDel: (treeId, treeNode) => {
                console.log('rightMenuDel');
                console.log(treeId);
                console.log(treeNode);
            }
        }
    },

    // 树形菜单点击
    clickItem: function (id) {
        $.ajax({
            url: 'mes/department/detail.do',
            type: 'GET',
            data: {
                'id': id
            },
            dataType: 'json',
            success: function (data) {
                const contentTemplate = Handlebars.compile(i18n.$html(infoTpl));
                $('.emes-right-div', page.pageDom).html(contentTemplate(data.data));
                $('.emes-page').initUI();
                $('.emes-app-save', page.pageDom).bind('click', function () {
                    page.pageDom.find('form').trigger('validate');
                    const submitdisableFlag = page.pageDom.find('form').attr('submitdisable') === 'false' ? false : true;
                    if (!submitdisableFlag) {
                        page.save();
                    }
                });
                $('.emes-app-add', page.pageDom).bind('click', function () {
                    page.pageDom.find('form').trigger('validate');
                    const submitdisableFlag = page.pageDom.find('form').attr('submitdisable') === 'false' ? false : true;
                    if (!submitdisableFlag) {
                        page.add();
                    }
                });
                $('.emes-app-delete', page.pageDom).bind('click', function () {
                    page.delete(id);
                });
                // 补充基础信息中的选项内容
                page.initInfo(data.data);
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    // 刷新数据表格(查询或更新)
    refreshTable: function (tableData) {
        if (tableData) {
            page.tree.initTree(tableData);
        } else {
            $.ajax({
                type: 'GET',
                url: '/mes/department/all',
                dataType: 'json',
                success: function (res) {
                    if (res.data.length == 0) {
                        page.initInfo(res.data);
                        const contentTemplate = Handlebars.compile(i18n.$html(infoTpl));
                        $('.emes-right-div', page.pageDom).html(contentTemplate({}));
                        $('.emes-page').initUI();
                        $('.emes-app-add', page.pageDom).bind('click', function () {
                            page.pageDom.find('form').trigger('validate');
                            const submitdisableFlag = page.pageDom.find('form').attr('submitdisable') === 'false' ? false : true;
                            if (!submitdisableFlag) {
                                page.add();
                            }
                        });
                    }
                    // 创建树形表格
                    page.tree.initTree(res.data);
                    // $('.emes-right-div', page.pageDom).html('');
                }
            });
        }
    },

    // 保存
    save: function () {
        $.ajax({
            url: '/mes/department/update',
            type: 'post',
            dataType: 'json',
            data: $('#emes-submit-form-department').serialize(),
            success: function (data) {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '修改成功',
                        type: 'alert',
                        delay: 5
                    });
                    page.refreshTable();
                } else {
                    DialogUtil.showDialog({
                        message: '部门信息修改失败',
                        type: 'alert',
                        delay: 5
                    });
                }
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    // 添加
    add: function () {
        $.ajax({
            url: '/mes/department/insert',
            type: 'post',
            dataType: 'json',
            data: $('#emes-submit-form-department').serialize(),
            success: function (data) {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '新增成功',
                        type: 'alert',
                        delay: 5
                    });
                    page.refreshTable();
                } else {
                    DialogUtil.showDialog({
                        message: '部门信息新增失败',
                        type: 'alert',
                        delay: 5
                    });
                }
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    // 删除
    delete: function (id) {
        DialogUtil.showDialog({
            message: i18n.$t('emes.confirmDelete'),
            type: 'confirm',
            callback: () => {
                $.ajax({
                    url: '/mes/department/delete',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        'id': id
                    },
                    success: function (data) {
                        if (data.success) {
                            DialogUtil.showDialog({
                                message: '删除成功',
                                type: 'alert',
                                delay: 5
                            });
                            page.refreshTable();
                        } else {
                            DialogUtil.showDialog({
                                message: '不能删除父菜单',
                                type: 'alert',
                                delay: 5
                            });
                        }
                    },
                    error: function (res) {
                        console.error(res.responseText);
                    }
                });
            }
        });
    },

    // 补充基础信息中的选项内容
    initInfo: function (record) {
        // 填充雇员名称
        $.ajax({
            url: '/mes/department/employee/list',
            type: 'get',
            dataType: 'json',
            success: function (data) {
                $('.emes-app-director option').not(':first').remove();
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].id == record.directorId) {
                        $('.emes-app-director').append(`<option selected="selected"
							value="${data.data[i].id}">${data.data[i].name}</option>`);
                    } else {
                        $('.emes-app-director').append(`<option
							value="${data.data[i].id}">${data.data[i].name}</option>`);
                    }
                }
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });



        // 填充部门名称
        $.ajax({
            url: '/mes/department/all',
            type: 'get',
            dataType: 'json',
            success: function (data) {
                $('.emes-app-costdepart option').not(':first').remove();
                $('.emes-app-send-depart option').not(':first').remove();
                for (let i = 0; i < data.data.length; i++) {
                    $('.emes-app-costdepart').append(`<option
						value="${data.data[i].id}">${data.data[i].name}</option>`);
                    $('.emes-app-send-depart').append(`<option
						value="${data.data[i].id}">${data.data[i].name}</option>`);
                }
                $('.emes-app-costdepart').find('option[value=' + record.costDepart + ']').attr('selected', true);
                $('.emes-app-send-depart').find('option[value=' + record.sendDepart + ']').attr('selected', true);
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    }
};

export default page;
