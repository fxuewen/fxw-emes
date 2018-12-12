import initUI from './init-ui';
import FuzzySearch from '../components/fuzzy-search/fuzzy-search';
import TableOperation from '../components/table-operation/table-operation';

const JqueryExtend = {
    initUI: function () {
        return this.each(function () {
            initUI(this);
        });
    },

    /**
     * 输入框模糊搜索
     * data: 联想值
     * idKey: 显示值对应的id键
     * nameKey: 联想显示值键
     */
    initFuzzySearch: function (options) {
        let fuzzySearch = null;
        this.each(function () {
            fuzzySearch = new FuzzySearch(this, options);
            fuzzySearch.init();
        });

        return fuzzySearch;
    },

    /**
     * 初始化表格操作
     */
    initTableOperation: function (options) {
        let tableOperation = null;
        this.each(function () {
            tableOperation = new TableOperation(this, options);
            tableOperation.init();
        });

        return tableOperation;
    }
};

// bootstrap-select国际化
$.fn.selectpicker.defaults = {
    noneSelectedText: '请选择',
    noneResultsText: '没有找到匹配项',
    countSelectedText: '选中{1}中的{0}项',
    maxOptionsText: ['超出限制 (最多选择{n}项)', '组选择超出限制(最多选择{n}组)'],
    multipleSeparator: ', ',
    selectAllText: '全选',
    deselectAllText: '取消全选'
};

export default JqueryExtend;
