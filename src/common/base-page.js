import TabControlUtil from '../utils/tab-control-util';
import i18n from '../i18n/i18n';

class BasePage {
    constructor(pageTpl) {
        this.pageTpl = pageTpl;
        this.tabUtil = TabControlUtil;
        this.i18n = i18n;
        this.tabOption = null;
    }

    load() {
        const tabBox = $(i18n.$html(this.pageTpl));
        tabBox.appendTo($('#sys-main-page-tabs'));
        tabBox.attr('box', this.tabOption.id);
        this.pageDom = tabBox;

        // 新加页面事件处理
        $('>div[box=' + this.tabOption.id + ']', TabControlUtil.boxs).initUI();

        // 添加对应选项卡
        TabControlUtil.open(this.tabOption);
    }

    // 重新生成page
    refresh() {
        TabControlUtil.remove(this.tabOption.id);
        this.load();
    }
}

export default BasePage;
