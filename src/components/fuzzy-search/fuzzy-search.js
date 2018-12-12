import './fuzzy-search.css';
import Util from '../../utils/util';

class FuzzySearch {
    constructor(input, options) {
        this.defaultOpts = {
            url: '/mes/commonSearch/findEmpList', // 查询接口
            type: '', // 查询类型
            nameKey: 'name', // 显示值对应的字段
            idKey: 'id', // id对应的字段
            selectbox: false, // 是否使用为select选择框场景
            // 选择值后执行事件
            selectCallback: () => {
                console.log('ok');
            },
            params: {}
        };
        this.options = Object.assign(this.defaultOpts, options);
        this.input = input; // 输入框
        this.fuzzyInput = null; // 列表容器
        this.autoCompleteData = [];
    }

    // 初始化DIV的位置
    init() {
        if ($('.emes-ul-auto-list').length === 0) {
            document.body.appendChild($('<ul class="dropdown-menu emes-ul-auto-list"></ul>')[0]);
        }

        const name = this.options.selectbox ? this.input.getAttribute('select-name') : this.input.getAttribute('name');
        if (this.options.selectbox) {
            this.fuzzyInput = $(`<input class="form-control hidden" name="${name}" />`)[0];
        } else {
            this.fuzzyInput = $(`<input class="form-control hidden" name="${name}_hide" />`)[0];
        }

        $(this.input).after($(this.fuzzyInput));
        $(this.input).after($(`
            <span class="form-control-feedback">
                <i class="fa fa-angle-down"></i>
            </span>
        `));
        this.input.setAttribute('autocomplete', 'off');
        this.bindEvent();
    }

    // 刷新下拉选项
    refreshAutoComplete() {
        this.fuzzyInput.value = '';
        const promise = Util.getAjaxPromise({
            type: 'get',
            url: this.options.url,
            data: Object.assign({
                type: this.options.type,
                searchData: this.input.value,
            }, this.options.params)
        });
        promise.then((res) => {
            this.initAutoComplete(res.data);
        });
    }

    initAutoComplete(data) {
        this.autoCompleteData = data;
        $('.emes-ul-auto-list').html('');
        if (data.length == 0) {
            this.hide();
            return;
        }

        data.forEach((item, index) => {
            const li = $(`
                <li attr-${this.options.idKey}="${item[this.options.idKey]}" attr-index="${index}">
                    ${item[this.options.nameKey]}
                </li>
            `);
            $('.emes-ul-auto-list').append(li);
        });

        const autoComplete = $('.emes-ul-auto-list');
        this.show();

        // 下拉选项事件绑定
        $('li', autoComplete).bind('click', (e) => {
            e.stopPropagation();
            const target = e.currentTarget;
            const text = target.innerText;
            const id = target.getAttribute(`attr-${this.options.idKey}`);
            const index = target.getAttribute('attr-index');

            this.input.value = text;
            // 生成隐藏input的值
            if (this.options.selectbox) {
                this.fuzzyInput.value = id;
            } else {
                // 输入框的值
                this.fuzzyInput.value = text;
            }

            $(`:not(li[attr-index=${index}])`, autoComplete).remove();
            // 选择一项后自动隐藏下拉框
            this.hide();

            // 选中事件回调
            this.options.selectCallback(this.autoCompleteData[index]);
            $(this.input).trigger('change');
        });
    }

    bindEvent() {
        // 点击输入框时联动下拉框
        $(this.input).bind('click', (e) => {
            e.stopPropagation();
            if (e.currentTarget.getAttribute('readonly')) {
                return;
            }
            if (this.fuzzyInput.value == '') {
                this.refreshAutoComplete();
            } else {
                this.refreshAutoComplete(this.autoCompleteData);
            }
        });

        // 输入内容时联动下拉框
        $(this.input).bind('input', (e) => {
            e.stopPropagation();
            this.refreshAutoComplete();
        });

        // 输入框失去焦点
        $(this.input).bind('blur', (e) => {
            if (this.options.selectbox && this.fuzzyInput.value == '') {
                this.input.value = '';
            }
        });

        // 点击非模糊搜索位置时关闭下拉框
        $(document).bind('click', (e) => {
            if (e.target == this.input) {
                return;
            }
            this.hide();
        });
    }

    /**
     * name和id选用一个,表示通过哪个字段匹配
     */
    setValue(name, id) {
        if (!this.options.selectbox) {
            this.input.value = name;
            this.fuzzyInput.value = name;
        } else {
            name = name || '';
            id = id || '';
            const promise = Util.getAjaxPromise({
                type: 'get',
                url: this.options.url,
                data: Object.assign({
                    type: this.options.type,
                    searchData: name,
                    name: name,
                    id: id
                }, this.options.params)
            });
            promise.then((res) => {
                this.setSelectBoxValue(res.data, name, id);
            });
        }
    }

    setSelectBoxValue(data, name, id) {
        this.hide();
        if (data.length == 0) {
            return;
        }

        data.forEach((item) => {
            if (item[this.options.idKey] == id) {
                this.input.value = item[this.options.nameKey];
                this.fuzzyInput.value = id;
                // 更新下拉列表
                this.initAutoComplete([item]);
                this.hide();
                // 选中事件回调
                this.options.selectCallback(item);
                return;
            }

            if (item[this.options.nameKey] == name) {
                this.input.value = name;
                this.fuzzyInput.value = item[this.options.idKey];
                // 更新下拉列表
                this.initAutoComplete([item]);
                this.hide();
                // 选中事件回调
                this.options.selectCallback(item);
                return;
            }
        });
    }

    getValue() {
        if (this.options.selectbox) {
            return this.fuzzyInput.value;
        } else {
            return this.fuzzyInput.value || this.input.value;
        }
    }

    show() {
        const inputOffset = $(this.input).offset();
        const autoComplete = $('.emes-ul-auto-list');
        autoComplete.css('left', inputOffset.left);
        autoComplete.css('top', inputOffset.top + this.input.clientHeight + 1);
        autoComplete.css('width', `${this.input.offsetWidth - 5}px`);
        autoComplete.addClass('show');
    }

    hide() {
        const autoComplete = $('.emes-ul-auto-list');
        autoComplete.removeClass('show');
    }
}

export default FuzzySearch;
