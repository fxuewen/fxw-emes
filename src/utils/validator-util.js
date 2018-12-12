import ArrayUtil from './array-util';
import i18n from '../i18n/i18n';

// 是否为数字正则
const parrten = /^\d+(\.\d+)?$/;

class ValidatorUtil {
    constructor($dom, isValidFlag) {
        this.dom = $dom;
        this.isValidFlag = isValidFlag;
    }

    initValidator() {
        $('input[validator]', this.dom).each((index)=> {
            const target = $('input[validator]', this.dom)[index];
            const validatorAttr = $(target).attr('validator');
            const validatorAttrArr = validatorAttr.split(' ');
            // 输入框失去焦点
            $(target).bind('blur', () => {
                if (ArrayUtil.isInArray(validatorAttrArr, 'isInteger')) {
                    this.isIntergerParrten($(target)[0].value, $(target));
                } else if (ArrayUtil.isInArray(validatorAttrArr, 'isRequire')) {
                    this.isRequireParrten($(target));
                }
            });

            $(target).bind('keyup', (event) => {
                $(target).css('border-color','#72afd2');
                $(target).siblings('p').css('display','none');
                if (ArrayUtil.isInArray(validatorAttrArr, 'isInteger')) {
                    this.isIntergerParrten(event.target.value, $(target));
                } else if (ArrayUtil.isInArray(validatorAttrArr, 'isRequire')) {
                    this.isRequireParrten($(target));
                }
            });

            $(target).bind('change', (event) => {
                $(target).css('border-color','#72afd2');
                $(target).siblings('p').css('display','none');
                if (ArrayUtil.isInArray(validatorAttrArr, 'isInteger')) {
                    this.isIntergerParrten(event.target.value, $(target));
                } else if (ArrayUtil.isInArray(validatorAttrArr, 'isRequire')) {
                    this.isRequireParrten($(target));
                }
            });
        });

        $(this.dom).bind('validate', () => {
            $('input[validator]', this.dom).each((index) => {
                $($('input[validator]', this.dom)[index]).trigger('blur');
                const validate = $('input[validator]', this.dom)[index].getAttribute('isInvalidFalg');
                if (validate === 'true') {
                    return false;
                }
            });
        });
    }

    // input值必填项校验
    isRequireParrten(target) {
        if (!target[0].value) {
            this.showValidatorWarning(target, i18n.$t('emes.validator.tips.isrequire'));
            // target.focus();
        } else {
            this.hideValidatorWarning (target);
        }
    }

    // 键盘输入的值是否为数字判断
    isIntergerParrten(keyCode, target) {
        if (parrten.test(keyCode)) {
            this.hideValidatorWarning (target);
        } else {
            this.showValidatorWarning(target, i18n.$t('emes.validator.tips.isinteger'));
        }
    }

    showValidatorWarning (target, showTxt){
        $(target).css('border-color', '#f00');
        $(target).siblings('.emes-tooltips').remove();
        $(target).after(`<div class='emes-tooltips'><div class='tooltip-arrow'></div><div class='tooltip-inner-text'>${showTxt}</div></div>`);
        this.isValidFlag = true;
        $(target).parents('form').attr('submitdisable', this.isValidFlag);
        $(target).attr('isInvalidFalg', this.isValidFlag);
    }

    hideValidatorWarning (target) {
        $(target).css('border-color','#72afd2');
        $(target).siblings('.emes-tooltips').remove();
        this.isValidFlag = false;
        $(target).parents('form').attr('submitdisable', this.isValidFlag);
        $(target).attr('isInvalidFalg', this.isValidFlag);
    }
}
export default ValidatorUtil;
