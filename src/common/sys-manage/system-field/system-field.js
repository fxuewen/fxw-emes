import './page.css';
import pageTpl from './page.html';
import tbodyTpl from './tbody.html';
import TreeGridUtil from '../../../utils/tree-grid-util';
import i18n from '../../../i18n/i18n';

const page = {
    pageDom: null,
    tree: null,
    treeData: null,

    load: function (target, TabControlUtil) {
        const tabBox = $(i18n.$html(pageTpl));
        tabBox.appendTo($('#sys-main-page-tabs'));
        tabBox.attr('box', target.id);
        page.pageDom = tabBox;

        // 更新page的标题

        page.tree = new TreeGridUtil($('.emes-page-tree', page.pageDom), page.treeSetting);

        // 新加页面事件处理
        $('>div[box=' + target.id + ']', TabControlUtil.boxs).initUI();
        // 添加对应选项卡
        TabControlUtil.open({
            id: target.id,
            text: target.innerText,
            close: true
        });
        // 查询
        $('.search-query', page.pageDom).bind('click', function () {
            page.searchNodesByParamFuzzy();
        });

        // 重置
        $('.search-reset', page.pageDom).unbind('click').bind('click', function () {
            $('.emes-search-form input[name=name]', page.pageDom).val('');
            page.searchNodesByParamFuzzy();
        });

        $.ajax({
            type: 'GET',
            url: '/privilege/systemfield/report',
            dataType: 'json',
            success: function (res) {
                // 创建树形表格
                page.tree.initTree(res.data);
            }
        });
    },

    // 树形结构回调事件
    treeSetting: {
        callback: {
            onClick: function (event, treeId, treeNode) {
                page.queryFieldInfo(treeNode.reportId);
            }
        },
        data: {
            key: {
                name: 'nameI18n',
            },
            simpleData: {
                idKey: 'reportId',
                pIdKey: '',
            }
        },
        view: {
            showIcon: false,
            showLine: false
        }
    },

    // 模糊查询节点
    searchNodesByParamFuzzy: function () {
        // 获取模糊匹配内容
        const treeObj = page.tree.ztree;
        const nodes = treeObj.getNodes();
        const key = 'nameI18n';
        let value = $('.emes-search-form input[name=name]', page.pageDom).val();
        value = $.trim(value);
        // 内容为空时显示所有
        if (!value) {
            treeObj.showNodes(nodes);
            // 展示nodes[0]的内容
            page.tree.selectNode(nodes[0]);
            return;
        }

        const results = treeObj.getNodesByParamFuzzy(key, value, null);
        // 隐藏所有
        treeObj.hideNodes(nodes);
        // 显示搜索结果
        treeObj.showNodes(results);

        // 展示results[0]的内容
        if (results.length === 0) {
            $('.tbody-body table', page.pageDom).html('');
        } else {
            page.tree.selectNode(results[0]);
        }
    },

    // 查询字段详细信息
    queryFieldInfo: function (reportId) {
        $.ajax({
            type: 'GET',
            url: '/privilege/systemfield/detail',
            dataType: 'json',
            data: {
                'reportId': reportId
            },
            success: function (res) {
                const tbodyTemplate = Handlebars.compile(tbodyTpl);
                $('.tbody-body table', page.pageDom).html(tbodyTemplate(res));
                page.bindTableEvent();
                $('.emes-helpers-checkbox').unbind('click').bind('click', function () {
                    const visible = $(this).val();
                    if (visible == 1) {
                        $(this).val('0');
                    } else {
                        $(this).val('1');
                    }
                });
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    // 保存
    updateAll: function () {
        const ids = $('.emes-app-id', page.pageDom);
        const aliasNames = $('.emes-app-aliasName', page.pageDom);
        const widths = $('.emes-app-width', page.pageDom);
        const order = $('.emes-app-order', page.pageDom);
        const visible = $('.emes-app-visible', page.pageDom);
        const data = [];
        for (let i = 0; i < ids.length; i++) {
            data.push({
                id: ids.eq(i).val(),
                aliasName: aliasNames.eq(i).val(),
                width: widths.eq(i).val(),
                order: order.eq(i).val(),
                visible: visible.eq(i).val()
            });
        }
        $.ajax({
            url: '/privilege/systemfield/update',
            type: 'POST',
            dataType: 'json',
            data: {
                'paramData': JSON.stringify(data)
            },
            success: function (data) {
                if (data.success) {
                    alert('修改成功');
                } else {
                    alert('部门信息修改失败');
                }
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    // 表格事件绑定
    bindTableEvent: function () {
        $('.btn-group-save', page.pageDom).unbind('click').bind('click', function () {
            page.updateAll();
        });
    }
};

export default page;
