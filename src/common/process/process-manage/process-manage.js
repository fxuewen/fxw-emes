import './page.css';
import pageTpl from './page.html';
import modalTpl from './modal.html';
import TableUtil from '../../../utils/table-util';
import TreeGridUtil from '../../../utils/tree-grid-util';
import template from './template';
import i18n from '../../../i18n/i18n';

const page = {
    pageDom: null,
    dataTable: null,
    tree: null,
    searchData: null,

    load: function (target, TabControlUtil) {
        const tabBox = $(i18n.$html(pageTpl));
        tabBox.appendTo($('#sys-main-page-tabs'));
        tabBox.attr('box', target.id);
        page.pageDom = tabBox;
        page.dataTable = new TableUtil('emes-page-table-product-manage', '/mes/product/report/query');
        // 新加页面事件处理
        $('>div[box=' + target.id + ']', TabControlUtil.boxs).initUI();

        // 添加对应选项卡
        TabControlUtil.open({
            id: target.id,
            text: target.innerText,
            close: true
        });

        // 获取选择框内容
        $.ajax({
            type: 'GET',
            url: 'mes/process/search/data',
            dataType: 'json',
            success: function (res) {
                page.searchData = res.data;
                const optionTemplate = Handlebars.compile(template.optionTpl);
                $('select[name=productName]', page.pageDom).html(optionTemplate(res.data.productList));
                $('select[name=procedureName]', page.pageDom).html(optionTemplate(res.data.procedureList));
                $('select[name=processName]', page.pageDom).html(optionTemplate(res.data.processList));
                // bootstrap-select表格refresh
                $('.selectpicker', page.pageDom).selectpicker('refresh');
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });

        // 查询
        $('.search-query', page.pageDom).bind('click', function () {
            page.refreshTable();
        });

        // 添加
        $('.btn-group-add', page.pageDom).bind('click', function () {
            $('.emes-modal-title label').html('添加工艺卡管理');
            $('.emes-modal-title .emes-modal-uploadphoto').html('');
            page.refreshModal();
            $('#sys-main-mode-tabs').initUI();
            $('#sys-main-mode-tabs').modal('show');
            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    page.add();
                }
            });
        });

        // 修改
        $('.btn-group-modify', page.pageDom).bind('click', function () {
            const selIds = page.dataTable.getSelIds();
            if (selIds.length === 0) {
                alert('请选择修改行');
                return;
            } else if (selIds.length > 1) {
                alert('只可修改一条记录');
                return;
            }

            const rowId = selIds[0];
            const rowData = page.dataTable.getRowData(rowId);

            $('.emes-modal-title label').html('修改工艺卡管理');
            $('.emes-modal-title .emes-modal-uploadphoto').html('');
            page.refreshModal(rowData);
            $('#sys-main-mode-tabs').modal('show');
            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save')[0].onclick = function () {
                page.modify();
            };
        });
    },

    // 添加
    add: function () {
        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        $.ajax({
            url: '/mes/product/add',
            type: 'post',
            dataType: 'json',
            data: contentForm.serialize(),
            success: function (data) {
                if (data.success) {
                    alert('新增工艺信息成功');
                    $('#sys-main-mode-tabs').modal('hide');
                }
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    // 修改
    modify: function () {

    },

    // 刷新数据表格(查询或更新)
    refreshTable: function () {
        const formParam = $('.emes-search-form', page.pageDom).serialize();
        const data = {page: 1, pageSize: 10};
        $.ajax({
            url: '/mes/process/report/all',
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
        const modalContent = Handlebars.compile(i18n.$html(modalTpl));
        // Handllebars填充模板数据
        if (data == null || data == 'undefined') {
            $('#modalContent').html(modalContent({}));
        } else {
            $('#modalContent').html(modalContent(data));
        }

        // 更新产品,客户,区域的选择内容
        if (!page.searchData) {
            return;
        }
        const modalDom = $('#sys-main-mode-tabs');
        const optionTemplate = Handlebars.compile(template.optionTpl);
        $('select[name=productName]', modalDom).html(optionTemplate(page.searchData.productList));
        const selectTemplate = Handlebars.compile(template.selectTpl);
        // bootstrap-select表格refresh
        $('.selectpicker', modalDom).selectpicker('refresh');

    },

};

export default page;
