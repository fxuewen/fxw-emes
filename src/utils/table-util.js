import paginationTpl from '../template/pagination.html';

class TableUtil {

    constructor(tableId, url, options) {
        this.tableId = tableId;
        this.url = url;
        this.options = options || {
            custom: {}
        };
        this.tableContainer = null;
        this.pagerDom = null;
        this.tableOptions = {
            datatype: 'local',
            data: [],
            colModel: [],
            viewrecords: true,
            autowidth: true,
            height: 'auto',
            cellEdit: true,
            multiselect: true,
            cmTemplate: {
                editable: true,
                sortable: false,
                width: 80
            },
            scroll: 1,
            custom: {}
        };
        this.pagerData = {};
    }

    /**
     * 生成jqGrid数据表格
     * data 后台返回json数据
     * tableId 表格id
     * pagerId 分页id
     * options 自定义表格options
     */
    load(data) {
        this.tableContainer = $(`#${this.tableId}`);
        this.pagerDom = $('.emes-table-pagination', $(this.tableContainer[0].parentNode));
        this.pagerData = this.getPagerData(data);

        const tableOptions = {
            data: data.list,
            colModel: this.getColModel(data.colVisible, data.colWidth, data.colOrder, data.colAlias),
            page: data.pageNum,
            lastPage: data.lastPage
        };

        // 生成表格
        this.jqGrid = this.tableContainer.jqGrid(Object.assign(
            this.tableOptions,
            tableOptions,
            this.options,
            this.getBindEvent()
        ));
    }

    dataGrid(data) {
        if (!data) {
            return;
        }

        if ($(`#${this.tableId}`)[0].children.length === 0) {
            this.load(data);
            return;
        }

        // 清空表格
        this.tableContainer.jqGrid('clearGridData');

        // 重新加载数据
        this.tableContainer.jqGrid('setGridParam', {
            datatype: 'local',
            data: data.list
        }).trigger('reloadGrid');

        // 刷新分页
        this.pagerData = this.getPagerData(data);
        this.refreshPagination();
    }

    // 表格绑定事件
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
                // 是否单选
                if (this.options.custom && this.options.custom.singleSelect) {
                    $(`#cb_${this.tableId}`).hide();
                }
                // 生成自定义分页
                this.refreshPagination();

                if (this.options.custom.merges) {
                    this.merger(this.options.custom.merges);
                }

                if (this.options.gridComplete && typeof this.options.gridComplete === 'function') {
                    this.options.gridComplete();
                    // this.tableContainer.jqGrid('setGroupHeaders', {
                    //     useColSpanStyle: true, // 没有表头的列是否与表头所在行的空单元格合并
                    //     groupHeaders: [ // {},{}...
                    //         {
                    //             startColumnName: 'name', // 合并列的起始位置 colModel中的name
                    //             numberOfColumns: 2, // 合并列数 包含起始列
                    //             titleText: '合并表头一' // 表头
                    //         }, {
                    //             startColumnName: 'sex',
                    //             numberOfColumns: 3,
                    //             titleText: '合并表头二'
                    //         }
                    //     ]
                    // });
                }
            },
            // 全选按钮
            onSelectAll: (aRowids, status) => {
                if (this.options.onSelectRow && typeof this.options.onSelectRow === 'function') {
                    this.options.onSelectRow(aRowids, status);
                }
            },

            // 选中行
            onSelectRow: (rowid, status) => {
                if (this.options.onSelectRow && typeof this.options.onSelectRow === 'function') {
                    this.options.onSelectRow(rowid, status);
                }
            },

            beforeSelectRow: (rowid, e) => {
                // 是否单选
                if (this.options.custom && this.options.custom.singleSelect) {
                    this.tableContainer.jqGrid('resetSelection');
                }

                if (this.options.beforeSelectRow && typeof this.options.beforeSelectRow === 'function') {
                    this.options.beforeSelectRow(rowid, e);
                }
            }
        };
    }

    // 获取选中行id数组
    getSelIds() {
        return this.tableContainer.jqGrid('getGridParam', 'selarrrow');
    }

    /**
     * 插入一新行
     * rowid为新行的ID
     * data(数组)为新行数据,{name1:value1,name2: value2…},name为colModel指定的名称
     * position为新行插入的位置(first为表头，last为表尾，srcrowid指定偏移位置)
     */
    addRowData(rowid, data, position, srcrowid) {
        this.tableContainer.jqGrid('addRowData', data, position, srcrowid);
    }

    // 删除表格行
    delRowData(rowids) {
        rowids.forEach((rowid) => {
            this.tableContainer.jqGrid('delRowData', rowid);
        });
    }

    /**
     * 更新rowid指定行的数据(使用数组)
     * Data数组的格式为: {name1:value1,name2: value2…},name为colModel中描述的名称，value为新值
     * cssprop若为字符串,将使用addClass为行添加类;若为数组对象,则直接加入CSS中.
     * 将data设置为false的情况下，可设置属性和类名
     */
    setRowData(rowid, data, cssprop) {
        this.tableContainer.jqGrid('setRowData', rowid, data, cssprop);
    }

    // 获取行数据
    getRowData(rowid) {
        return this.tableContainer.jqGrid('getRowData', rowid);
    }

    /**
     * 表格数据改造(表头)
     * @param {Object} colVisible 显示字段(可配置)
     * @param {Object} colWidth  每列显示的宽度
     * @param {Object} colOrder  每列显示的顺序
     * @param {Object} colAlias  每列显示的中文
     */
    getColModel(colVisible, colWidth, colOrder, colAlias) {
        const data = [];
        for (let i = 0; i < colAlias.length; i++) {
            const col = {
                label: colAlias[i],
                name: colOrder[i],
                width: colWidth[i],
                align: 'left',
                hidden: true,
                formatter: (value) => {
                    if (value == undefined) {
                        return '';
                    }

                    return value;
                },
                unformat: (value) => {
                    return value;
                }
            };

            // 列显示格式化
            if (this.options.custom.formatter && this.options.custom.formatter[col.name]) {
                col.formatter = this.options.custom.formatter[col.name];
            }

            // 反格式化
            if (this.options.custom.unformat && this.options.custom.unformat[col.name]) {
                col.unformat = this.options.custom.unformat[col.name];
            }

            for (let j = 0; j < colVisible.length; j++) {
                if (colOrder[i] == colVisible[j]) {
                    col.hidden = false;
                    break;
                }
            }

            data.push(col);
        }

        return data;
    }

    // 刷新分页
    refreshPagination() {
        if (!this.pagerDom) {
            return;
        }

        const template = Handlebars.compile(paginationTpl);
        this.pagerDom.html(template(this.pagerData));
        const pagerCallback = this.options.custom && this.options.custom.pagerCallback;
        // 上一页
        $('.emes-pagination-pre', this.pagerDom).bind('click', (e) => {
            const target = e.currentTarget;
            if ($(target).hasClass('disabled')) {
                return;
            }

            const currentPage = parseInt(target.getAttribute('current-page'), 10);
            const pageSize = parseInt(target.parentNode.getAttribute('page-size'), 10);
            const page = currentPage - 1;
            // 有自定义分页回调时使用回调
            if (pagerCallback && typeof (pagerCallback) === 'function') {
                pagerCallback(page, pageSize);
                return;
            }

            $.ajax({
                url: this.url,
                type: 'get',
                dataType: 'json',
                data: {
                    page: currentPage - 1,
                    pageSize: pageSize
                },
                success: (res) => {
                    this.dataGrid(res.data);
                },
                error: function (res) {
                    console.log(res.responseText);
                }
            });
        });

        // 指定页
        $('.emes-pagination-page', this.pagerDom).bind('click', (e) => {
            const target = e.currentTarget;
            const currentPage = parseInt(target.getAttribute('current-page'), 10);
            const pageSize = parseInt(target.parentNode.getAttribute('page-size'), 10);
            $('.emes-pagination-page', this.pagerDom).removeClass('active');

            const page = currentPage;
            // 有自定义分页回调时使用回调
            if (pagerCallback && typeof (pagerCallback) === 'function') {
                pagerCallback(page, pageSize);
                return;
            }

            $.ajax({
                url: this.url,
                type: 'get',
                dataType: 'json',
                data: {
                    page: currentPage,
                    pageSize: pageSize
                },
                success: (res) => {
                    $(target).addClass('active');
                    this.dataGrid(res.data);
                },
                error: function (res) {
                    console.log(res.responseText);
                }
            });
        });

        // 下一页
        $('.emes-pagination-next', this.pagerDom).bind('click', (e) => {
            const target = e.currentTarget;
            if ($(target).hasClass('disabled')) {
                return;
            }

            const currentPage = parseInt(target.getAttribute('current-page'), 10);
            const pageSize = parseInt(target.parentNode.getAttribute('page-size'), 10);
            const page = currentPage + 1;
            // 有自定义分页回调时使用回调
            if (pagerCallback && typeof (pagerCallback) === 'function') {
                pagerCallback(page, pageSize);
                return;
            }

            $.ajax({
                url: this.url,
                type: 'get',
                dataType: 'json',
                data: {
                    page: currentPage + 1,
                    pageSize: pageSize
                },
                success: (res) => {
                    this.dataGrid(res.data);
                },
                error: function (res) {
                    console.log(res.responseText);
                }
            });
        });
    }

    // 获取分页数据
    getPagerData(data) {
        const firstPage = data.firstPage || 1;
        const lastPage = data.lastPage || 1;
        const pages = data.pages || 1;
        const pageArr = [];
        for (let i = firstPage; i <= lastPage; i++) {
            const isCurrent = i === data.pageNum;
            pageArr.push({
                num: i,
                isCurrent: isCurrent
            });
        }

        return {
            firstPage: firstPage,
            lastPage: lastPage,
            pages: pages,
            pageArr: pageArr,
            isFirstPage: data.isFirstPage,
            isLastPage: data.isLastPage,
            hasNextPage: data.hasNextPage,
            hasPreviousPage: data.hasPreviousPage,
            pageSize: data.pageSize,
            total: data.total,
            startRow: data.startRow,
            endRow: data.endRow,
            pageNum: data.pageNum
        };
    }

    // 公共调用方法
    merger(names) {
        const trs = $('#emes-page-table-manpower>tbody>tr:gt(0)');
        $.each(names, function (ind, name) {
            let bg = trs.eq(0).children('[aria-describedby=\'emes-page-table-manpower_' + name + '\']'),
                index = bg.index(),
                rowsp = 1;
            trs.slice(1).each(function (ind2, tr) {
                const me = $(tr).children('td').eq(index);
                if (bg.text() === me.text()) {
                    rowsp++;
                    me.hide();
                } else {
                    bg.attr('rowspan', rowsp);
                    bg = me;
                    rowsp = 1;
                }
                bg.attr('rowspan', rowsp);
                bg.css('display', 'table-cell');
                bg.css('vertical-align', 'middle');
            });
        });
    }
}

export default TableUtil;
