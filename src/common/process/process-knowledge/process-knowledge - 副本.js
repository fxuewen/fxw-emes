import './page.css';
import pageTpl from './page.html';
import modalTpl from './modal.html';
import tableModalTpl from './modal-add.html';
import TableUtil from '../../../utils/table-util';
import BasePage from '../../base-page';

class Page extends BasePage {
    constructor() {
        super(pageTpl);
        this.pageDom = null;
        this.dataTable = null;
    }

    load(target) {
        if (!this.tabOption && target) {
            this.tabOption = {
                id: target.id,
                text: target.innerText,
                close: true
            };
        }
        super.load();

        this.dataTable = new TableUtil(
            'emes-page-table-process-knowledge',
            '/mes/process/nowledge/report/all',
            this.tableSetting
        );

        $('input[name=name]').initFuzzySearch();

        // 表结构初始化
        this.refreshTable();

        // 添加
        $('.btn-group-add', this.pageDom).bind('click', () => {
            $('#modalContent').html(tableModalTpl);
            $('#sys-main-mode-tabs').modal('show');
            $('#modalContent .emes-modal-table').initTableOperation({
                colModel: [{
                    name: 'name',
                    label: '名称'
                }, {
                    name: 'code',
                    label: '编码'
                }, {
                    name: 'codeId',
                    label: '',
                    hidden: true,
                }, {
                    name: 'telephone',
                    label: '电话'
                }, {
                    name: 'address',
                    label: '地址'
                }, ],
                custom: {
                    editCallback: (rowData, tr) => {
                        const codeEle = $('input[name=code]', $(tr)).initFuzzySearch({
                            type: 103,
                            selectbox: true,
                            nameKey: 'code',
                            idKey: 'id',
                            // 选择事件
                            selectCallback: (data) => {
                                console.log(data);
                            }
                        });
                    }
                }
            });
        });
    }

    // 刷新数据表格(查询或更新)
    refreshTable() {
        $.ajax({
            type: 'GET',
            url: '/mes/process/nowledge/report/all',
            dataType: 'json',
            data: {
                page: 1,
                pageSize: 10
            },
            success: (res) => {
                this.dataTable.dataGrid(res.data);
            }
        });
    }

    // 树形菜单点击
    clickItem() {
        this.refreshTable();
    }

    // 添加
    add() {

    }

    // 刷新模态框
    refreshModal(data) {
        const modalContent = Handlebars.compile(modalTpl);
        // Handllebars填充模板数据
        if (data == null || data == 'undefined') {
            $('#modalContent').html(modalContent());
        } else {
            $('#modalContent').html(modalContent(data.data));
        }
    }
}

export default Page;
