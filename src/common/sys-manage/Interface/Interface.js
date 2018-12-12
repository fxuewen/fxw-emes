import './page.css';
import pageTpl from './page.html';
import theadTpl from './thead.html';
import TreeGridUtil from '../../../utils/tree-grid-util';
import i18n from '../../../i18n/i18n';

const page = {
    pageDom: null,
    tree: null,

    load: function (target, TabControlUtil) {
        const tabBox = $(i18n.$html(pageTpl));
        tabBox.appendTo($('#sys-main-page-tabs'));
        tabBox.attr('box', target.id);
        page.pageDom = tabBox;

        page.tree = new TreeGridUtil($('.emes-page-tree', page.pageDom), page.treeSetting);

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
            url: '/mes/dock/interface/info',
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
            onClick: (event, treeId, treeNode) => {
                const treeObj = page.tree.ztree;
                if (treeNode.children) {
                    treeObj.expandNode(treeNode);
                }

                const parentNode = treeNode.getParentNode() || {};
                page.clickItem(treeNode.name, parentNode.name);
            }
        }
    },

    // 树形菜单点击
    clickItem: function (name, text) {
        $.ajax({
            url: '/mes/dock/detailed/info',
            type: 'GET',
            data: {
                name: name,
                text: text,
            },
            dataType: 'json',
            success: function (res) {
                const da = page.getInterfaceData(res.data);
                const contentTemplate = Handlebars.compile(i18n.$html(theadTpl));
                $('.emes-right-div', page.pageDom).html(contentTemplate(da));
                $('#interfaceName', page.pageDom).val(res.data.object.name);
                // 执行
                $('#executing', page.pageDom).bind('click', function () {
                    const jobName = $('#interfaceName').val();
                    page.clickButton(jobName);
                });
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    // 刷新数据表格(查询或更新)
    refreshTable: function (tableData) {
        if (tableData) {
            page.initTree(tableData);
        } else {
            $.ajax({
                type: 'GET',
                url: '/mes/dock/interface/info',
                dataType: 'json',
                success: function (res) {
                    // 创建树形表格
                    page.initTree(res.data);
                }
            });
        }
    },

    clickButton: function (jobName) {
        $.ajax({
            url: '/dock/execute',
            type: 'post',
            data: {
                'name': jobName,
            },
            dataType: 'json',
            success: function (data) {
                $('#contents', page.pageDom).html(JSON.stringify(data));
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    getInterfaceData: function (data) {
        const result = [];
        for (let i = 0; i < data.list.length; i++) {
            const key = data.list[i];
            let value = data.object[key];
            if (typeof (value) == 'object') {
                let info = '';
                Object.keys(value).forEach(function (key) {
                    info = info + key + ':' + value[key] + ',' + '\n';
                });
                value = info.toString();
            }
            result.push({key, value});
        }

        return result;
    }

};

export default page;
