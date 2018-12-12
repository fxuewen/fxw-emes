
import i18n from '../i18n/i18n';
import Validator from '../utils/validator-util';
// 右侧显示页面添加后的事件处理

const initUI = function (dom) {
    const $dom = $(dom || document);

    /**
	 * 高级搜索收缩与重置
	 */
    $('.search-btn-group', $dom).each(function () {
        let $this = $(this);
        $('.search-reset', $this).click(function () {
            const $in = $this.parents('.emes-search-form').find('.form-control').val('');
            $in.next().find('.fa-times').removeClass('fa-times');
            if ($in.data('hideval')) {
                $in.data('hideval', '').data('showval', '');
            }
        });
        $('.emes-open-fold', $this).click(function () {
            $this = $($this);
            $this.siblings('.form-inline').toggleClass('emes-fold-height-animate');
            $this.find('.fa').toggleClass('emes-open');
            $this.find('.fa').hasClass('emes-open') ? $this.find('span').text(i18n.$t('emes.show')) :
                $this.find('span').text(i18n.$t('emes.hide'));
        });
    });

    /**
	 * 输入框校验初始化
	 */

    $('form', $dom).each(function (index) {
        const validator = new Validator($($('form', $dom)[index]), false);
        validator.initValidator();
        if (validator.dom && validator.dom[0] && (validator.dom[0].className.indexOf('emes-submit-form')) > 0) {
            $(validator.dom[0]).attr('submitdisable','');
        }
    });

    /**
	 * 输入框 autocomplete=off 以免双击显示历史信息
	 */
    $('input[type=text]', $dom).each(function () {
        $(this).attr('autocomplete', 'off');
    });


    /**
	 * 时间弹出框
	 */
    $('input[target=date]', $dom).each(function () {
        $(this).daterangepicker({
            autoApply: true,
            singleDatePicker: true,
            timePicker24Hour: true,
            locale: {
                format: 'YYYY-MM-DD'
            }
        });
        $(this).val('');
    });

    $('input[target=date-range]', $dom).each(function () {
        $(this).daterangepicker({
            autoApply: true,
            showWeekNumbers: true,
            showISOWeekNumbers: true,
            locale: {
                format: 'YYYY-MM-DD'
            }
        });
        $(this).val('');
    });

    // 树形结构界面收缩
    $('.ztree-close', $dom).click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        const $this = $(this);
        const $leftDiv = $this.parents('.emes-page').find('.emes-left-div:first');
        if ($leftDiv.length) {
            $this.hasClass('open') ? $this.find('span').text('收起') : $this.find('span').text('展开');
            $leftDiv.toggleClass('ztree-close');
            $this.toggleClass('open');
        }
    });

    // bootstrap选择框生成
    $('.selectpicker', $dom).selectpicker('refresh');
};

export default initUI;
