import tableTpl from './table.html';
import './table-operation.css';

class TableOperation {
    constructor(container, options) {
        this.container = container;
        this.options = options || {};
        this.tableOptions = {
            datatype: 'local',
            colModel: [],
            data: [],
            viewrecords: true,
            autowidth: true,
            height: 'auto',
            cellEdit: true,
            align: 'left',
            custom: {
                editCallback(rowData, tr) {
                    console.log('edit callback');
                },
                saveCallback(rowData, tr) {
                    console.log('save callback');
                }
            }
        };
        Object.assign(this.tableOptions, options);
        this.tableContainer = null;
    }

    init() {
        // 添加操作按钮
        this.tableOptions.colModel.push({
            name: 'tableOperation',
            label: '<span class="fa fa-plus emes-table-tr-plus"></span>',
            formatter: (cellvalue, options) => {
                return `<button class="btn-default emes-table-tr-operation btn-save" rowid="${options.rowId}">` +
                    '<span class="fa fa-save"></span></button>' +
                    `<button class="btn-default emes-table-tr-operation btn-edit" rowid="${options.rowId}">` +
                    '<span class="fa fa-edit"></span></button>' +
                    `<button class="btn-default emes-table-tr-operation btn-delete" rowid="${options.rowId}">` +
                    '<span class="fa fa-remove"></span></button>';
            }
        });
        // 将列设置为可编辑状态
        this.tableOptions.colModel.forEach((col) => {
            if (col.name !== 'tableOperation' && !col.edittype) {
                col.editable = true;
            }
        });
        $(this.container).html(tableTpl);

        // 生成表单
        this.tableContainer = $('#emes-table-add-modify');
        this.tableContainer.jqGrid(Object.assign(
            this.tableOptions,
            this.getBindEvent()
        ));
        // 默认添加一个空白行
        this.addRow();
    }

    getBindEvent() {
        return {
            // 表格数据加载完成
            gridComplete: () => {
                // 隐藏滚动条
                this.tableContainer.closest('.ui-jqgrid-bdiv').css({
                    'overflow-y': 'hidden',
                    'overflow-x': 'hidden'
                });
                this.tableContainer.closest('.ui-jqgrid-view').css({
                    'overflow-y': 'hidden',
                    'overflow-x': 'hidden'
                });
                this.bindCustomEvent();
            }
        };
    }

    // 绑定添加按钮事件
    bindCustomEvent() {
        // 添加
        $('.emes-table-tr-plus').unbind('click').bind('click', (e) => {
            this.addRow();
        });
        // 编辑
        $('.emes-table-tr-operation.btn-edit', this.tableContainer).unbind('click').bind('click', (e) => {
            const rowid = e.currentTarget.getAttribute('rowid');
            const rowData = this.tableContainer.jqGrid('getRowData', rowid);
            this.tableContainer.jqGrid('editRow', rowid, {
                keys: false,
                focusField: 1,
                oneditfunc: (rowid) => {
                    const tr = e.currentTarget.parentNode.parentNode;
                    $(tr).initUI();
                    delete rowData.tableOperation;
                    this.tableOptions.custom.editCallback && this.tableOptions.custom.editCallback(rowData, tr);
                }
            });
        });
        // 保存
        $('.emes-table-tr-operation.btn-save', this.tableContainer).unbind('click').bind('click', (e) => {
            const rowid = e.currentTarget.getAttribute('rowid');
            this.tableContainer.jqGrid('saveRow', rowid, false, 'clientArray');
            const rowData = this.tableContainer.jqGrid('getRowData', rowid);
            delete rowData.tableOperation;
            const tr = e.currentTarget.parentNode.parentNode;
            this.tableOptions.custom.saveCallback && this.tableOptions.custom.saveCallback(rowData, tr);
        });
        // 删除
        $('.emes-table-tr-operation.btn-delete', this.tableContainer).unbind('click').bind('click', (e) => {
            const rowid = e.currentTarget.getAttribute('rowid');
            this.tableContainer.jqGrid('delRowData', rowid);
        });
    }

    // 添加空白行
    addRow(options) {
        const parameters = {
            initdata: {}, // json键值对对象，键名称和colModel配置的name一致。设置单元格初始化值
            useDefValues: true,
            useFormatter: true,
            position: 'last',
            addRowParams: {
                extraparam: {}
            }
        };
        this.tableContainer.jqGrid('addRow', Object.assign(parameters, options));

        const trs = $('#emes-table-add-modify>tbody>tr:gt(0)');
        const ids = this.tableContainer.jqGrid('getDataIDs');
        if (ids.length > 0) {
            const rowData = this.tableContainer.jqGrid('getRowData', ids[ids.length - 1]);
            this.tableContainer.jqGrid('editRow', ids[ids.length - 1], {
                keys: false,
                focusField: 1,
                oneditfunc: (rowid) => {
                    const tr = trs[trs.length - 1];
                    $(tr).initUI();
                    delete rowData.tableOperation;
                    this.tableOptions.custom.editCallback &&
                        this.tableOptions.custom.editCallback(rowData, tr);
                }
            });
        }

    }
}

export default TableOperation;
