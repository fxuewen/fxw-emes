import pageTpl from './page.html';
import template from './template';
import TreeGridUtil from '../../../utils/tree-grid-util';
import TableUtil from '../../../utils/table-util';
import i18n from '../../../i18n/i18n';
import UploadUtil from '../../../utils/upload-util';


const page = {
    pageDom: null,
    tree: null,
    dataTable: null,

    load: function (target, TabControlUtil) {
        const tabBox = $(i18n.$html(pageTpl));
        tabBox.appendTo($('#sys-main-page-tabs'));
        tabBox.attr('box', target.id);
        page.pageDom = tabBox;
        page.tree = new TreeGridUtil($('.emes-page-tree', page.pageDom), page.treeSetting);
        page.dataTable = new TableUtil('emes-page-table-bom-manage', '/mes/bom/report/all');

        // 新加页面事件处理
        $('>div[box=' + target.id + ']', TabControlUtil.boxs).initUI();
        // 添加对应选项卡
        TabControlUtil.open({
            id: target.id,
            text: target.innerText,
            close: true
        });

        // 树结构初始化
        $.ajax({
            type: 'GET',
            url: 'mes/bom/tree/list',
            dataType: 'json',
            success: function (res) {
                // 创建树形表格
                page.tree.initTree(res.data);
                const optionTemplate = Handlebars.compile(template.selectTpl);
                $('select[name=productName]', page.pageDom).html(optionTemplate(res.data));
            }
        });

        const uploader = new UploadUtil({
            server: '/mes/bom/inventory/insert',
            success: (file, res) => {
                TabControlUtil.remove(target.id);
                page.load(target, TabControlUtil);
            }
        });

        // 导入(文件)按钮
        $('.emes-btn-order-group .emes-btn-group-import', page.pageDom).bind('click', () => {
            uploader.showUploadModal();
        });

        // 导出
        $('.emes-btn-order-group .emes-btn-group-export', page.pageDom).bind('click', function () {
            page.fileExport();
        });

        // 获取选择框内容
        $.ajax({
            type: 'GET',
            url: 'mes/bom/material/list',
            dataType: 'json',
            success: function (res) {
                page.searchData = res.data;
                const optionTemplate = Handlebars.compile(template.optionTpl);
                $('select[name=type]', page.pageDom).html(optionTemplate(res.data));
                // bootstrap-select表格refresh
                $('.selectpicker', page.pageDom).selectpicker('refresh');
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });

        // 查询
        $('.search-query', page.pageDom).bind('click', function () {
            page.searchNodesByParamFuzzy();
        });

        // 模糊查询
        $('input[name=productName]', this.pageDom).initFuzzySearch({
            type: 37
        });
        $('input[name=type]', this.pageDom).initFuzzySearch({
            type: 38
        });
    },

    // 树形结构回调事件
    treeSetting: {
        callback: {
            onClick: function (event, treeId, treeNode) {
                page.clickItem(treeNode.bomId);
            }
        },
        data: {
            key: {
                name: 'productName',
            },
            simpleData: {
                enable: true,
                idKey: 'bomId',
                pIdKey: 'parentId',
            }
        }
    },

    // 树形菜单点击
    clickItem: function (id) {
        // 树形结构中点击为精确选择,点击后清空搜索框内容
        $('.search-btn-group .search-reset', page.pageDom).click();

        // 获取表单数据
        const pageParam = {
            page: 1,
            pageSize: 10,
            id: id
        };

        $.ajax({
            type: 'GET',
            url: '/mes/bom/report/all',
            dataType: 'json',
            data: $.param(pageParam),
            success: function (res) {
                page.dataTable.dataGrid(res.data);
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    // 模糊查询节点
    searchNodesByParamFuzzy: function () {
        // 获取模糊匹配内容
        const treeObj = page.tree.ztree;
        const productName = $('.emes-search-form input[name=productName]', page.pageDom)[0].value;
        const type = $('.emes-search-form select[name=type]', page.pageDom).selectpicker('val');

        // 内容为空时显示所有
        if (!productName && !type) {
            return;
        }

        const selNodes = treeObj.getNodesByFilter(node => {
            let flag = true;
            // 过滤产品名
            if (productName && node.productName.indexOf(productName) < 0) {
                flag = false;
            }

            // 过滤客户名
            if (type && type != node.source) {
                flag = false;
            }
            return flag;
        });

        if (selNodes.length === 0) {
            alert('无匹配项');
            return;
        }

        // 收缩所有节点
        treeObj.expandAll(false);
        // 取消所有节点选中
        const nodes = treeObj.getNodes();
        nodes.forEach(node => {
            treeObj.selectNode(node, false);
        });

        // 处理选中节点
        selNodes.forEach(selNode => {
            // 展开选中节点
            treeObj.expandNode(selNode, true, true, true);
            const parentNode = selNode.getParentNode();
            if (parentNode) {
                treeObj.expandNode(parentNode, true, true, true);
            }
        });

        // 选中节点
        treeObj.selectNode(selNodes[0], true);

        // 更新产品列表
        page.clickItem(selNodes[0].bomId);
    },
    // 刷新模态框
    refreshModal: function (modal, data) {
        const modalContent = Handlebars.compile(modal);
        // Handllebars填充模板数据
        if (data == null || data == 'undefined') {
            $('#modalContent').html(modalContent());
        } else {
            $('#modalContent').html(modalContent(data.data));
        }
    },

    fileExport: function () {
        window.location.href = 'mes/bom/export';
    }
};

export default page;
