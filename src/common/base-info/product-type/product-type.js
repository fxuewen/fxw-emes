import './page.css';
import productTypeTpl from './page.html';
import infoTpl from './info.html';
import TreeGridUtil from '../../../utils/tree-grid-util';
import i18n from '../../../i18n/i18n';
import DialogUtil from '../../../utils/dialog-util';

const page = {
    pageDom: null,
    tree: null,

    load: function (target, TabControlUtil) {
        const tabBox = $(i18n.$html(productTypeTpl));
        tabBox.appendTo($('#sys-main-page-tabs'));
        tabBox.attr('box', target.id);
        page.pageDom = tabBox;

        page.tree = new TreeGridUtil($('#emes-page-tree-product-type', page.pageDom), page.treeSetting);

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
            url: '/mes/product/all',
            dataType: 'json',
            success: function (res) {
                page.refreshTable();
                // 创建树形表格
                page.tree.initTree(res.data);
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
                url: '/mes/product/all',
                dataType: 'json',
                success: function (res) {
                    if (res.data.length == 0) {
                        $('.emes-right-div', page.pageDom).val('');
                        const contentTemplate = Handlebars.compile(i18n.$html(infoTpl));
                        $('.emes-right-div', page.pageDom).html(contentTemplate({}));
                        $('.emes-page').initUI();
                        $('.emes-app-add', page.pageDom).bind('click', function () {
                            $('.emes-page').find('form').trigger('validate');
                            const submitdisableFlag = $('.emes-page').find('form').attr('submitdisable') === 'false' ? false : true;
                            if (!submitdisableFlag) {
                                page.add();
                            }
                        });
                    }
                    // 创建树形表格
                    page.tree.initTree(res.data);


                }
            });
        }
    },


    // 树形结构回调事件
    treeSetting: {
        callback: {
            onClick: function (event, treeId, treeNode) {
                page.clickItem(treeNode.id);
            }
        },
        data: {
            simpleData: {
                enable: true,
                idKey: 'id',
                pIdKey: 'categoryId',
            }
        },
    },

    // 树形菜单点击
    clickItem: function (id) {
        $.ajax({
            url: 'mes/product/detail.do',
            type: 'GET',
            data: { 'id': id },
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
                    $('.emes-page').find('form').trigger('validate');
                    const submitdisableFlag = $('.emes-page').find('form').attr('submitdisable') === 'false' ? false : true;
                    if (!submitdisableFlag) {
                        page.add();
                    }
                });
                $('.emes-app-delete', page.pageDom).bind('click', function () {
                    page.delete(id);
                });
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    // 修改
    save: function () {
        $.ajax({
            url: '/mes/product/update',
            type: 'post',
            dataType: 'json',
            data: $('#emes-submit-form-product-type').serialize(),
            success: function (data) {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '修改成功',
                        type: 'alert'
                    });
                    page.refreshTable();
                } else {
                    DialogUtil.showDialog({
                        message: '产品类型信息修改失败',
                        type: 'alert'
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
            url: '/mes/product/insert',
            type: 'post',
            dataType: 'json',
            data: $('#emes-submit-form-product-type').serialize(),
            success: function (data) {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '新增成功',
                        type: 'alert'
                    });
                    page.refreshTable();
                } else {
                    DialogUtil.showDialog({
                        message: '产品类型信息新增失败',
                        type: 'alert'
                    });
                }
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },
    //删除
    delete: function (id) {
        DialogUtil.showDialog({
            message: i18n.$t('emes.confirmDelete'),
            type: 'confirm',
            callback: () => {
                $.ajax({
                    url: '/mes/product/delete',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        'id': id
                    },
                    success: function (data) {
                        if (data.success) {
                            DialogUtil.showDialog({
                                message: '删除成功',
                                type: 'alert'
                            });
                            page.refreshTable();
                        } else {
                            DialogUtil.showDialog({
                                message: '不能删除父菜单',
                                type: 'alert'
                            });
                        }
                    },
                    error: function (res) {
                        console.error(res.responseText);
                    }
                });
            }
        });
    }

};

export default page;
