import Util from './util';
import TextUtil from './text-util';
const tempOptionId = [];
const TabControlUtil = {
    tabs: $('.emes-nav-tabs'), // 选项卡头容器父对象
    boxs: $('#sys-main-page-tabs'), // 选项卡对应的展示区对象

    // 打开一个选项卡,不存在则创建
    open: function (option) {
        // 打开一个选项卡就存入id到数组
        tempOptionId.push(option.id);
        if (TabControlUtil.tabs.length === 0) {
            TabControlUtil.tabs = $('.emes-nav-tabs');
        }

        const uuid = option.id || Util.getUID('tabs');
        let $tab = $('>a[tab=' + uuid + ']', TabControlUtil.tabs);

        if ($tab.length === 0) { // 不存在新增
            // 记录菜单使用值
            const data = JSON.parse(localStorage.getItem('menu')) || {};
            if (data[uuid]) {
                data[uuid] = data[uuid] + 1;
            } else {
                data[uuid] = 1;
            }
            localStorage.setItem('menu', JSON.stringify(data));

            const close = option.close === undefined || option.close == true;
            const icon = option.icon || '';
            let html = '';
            if (close) {
                html = `<a href="#" class="sys-tab">
							<i class="${icon}"></i>
							<span title="${option.text}">${option.text}</span>
							<i class="fa fa-times emes-tab-close"></i>
						</a>`;
            } else {
                html = `<a href="#" class="sys-tab">
							<i class="${icon}"></i>
							<span title="${option.text}">${option.text}</span>
						</a>`;
            }
            // 将选项卡加到导航项中
            $tab = $(html).appendTo(TabControlUtil.tabs).attr('tab', uuid);

            if (TabControlUtil.tabs.height() > 36) {
                $('.sys-tab:eq(1) .fa-times').click();
            }

            // 选项卡绑定事件
            $tab.data('option', option).click(function () {
                const $this = $(this);
                if ($this.hasClass('active')) {
                    return;
                }
                $this.addClass('active');
                const $navs = $('.nav-second-level #' + $this.attr('tab')),
                    $li = $navs.parents('#sys-main-menu-ul>li');
                if (!$li.hasClass('active')) {
                    $('#sys-main-menu-ul>li.active').removeClass('active')
                        .find('a').removeClass('active')
                        .next().removeClass('in').css('height', '1px').attr('aria-expanded', 'false');
                    $li.addClass('active').find('a').removeClass('active')
                        .next().addClass('in').attr('aria-expanded', 'true').removeAttr('style');
                }
                $('.nav-second-level .active').removeClass('active');
                $navs.addClass('active');
                TabControlUtil.showTabBox(TabControlUtil.fixed($(this)));
            }).find('>i.fa-times:last').one('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                TabControlUtil.close($(this).parent().attr('tab'));
            });
        }

        // 触发选中元素的指定事件
        $tab.trigger('click');

        if (TabControlUtil.tabs[0].clientWidth >= TabControlUtil.boxs[0].clientWidth - 450 && TabControlUtil.tabs[0].children[1] && TabControlUtil.tabs[0].children[1].innerText && (TextUtil.getTextWidth(option.text).width <= TextUtil.getTextWidth(TabControlUtil.tabs[0].children[1].innerText).width)) {
            // 选项卡tab超过长度就关闭第二个（首页项不关闭）新增的tab内部文字长度小于等于删除的第二个tab内部文字的长度
            TabControlUtil.remove(tempOptionId[1]);
            tempOptionId.splice(1, 1);
        } else if (TabControlUtil.tabs[0].clientWidth >= TabControlUtil.boxs[0].clientWidth - 450 && TabControlUtil.tabs[0].children[1] && TabControlUtil.tabs[0].children[1].innerText && (TextUtil.getTextWidth(option.text).width > TextUtil.getTextWidth(TabControlUtil.tabs[0].children[1].innerText).width)) {
            // 当新增的tab内部文字长度大于删除的第二个tab内部文字的长度 选项卡tab关闭两个tab 第二个tab和第三个tab
            TabControlUtil.remove(tempOptionId[1]);
            TabControlUtil.remove(tempOptionId[2]);
            tempOptionId.splice(1, 2);
        }
    },

    /**
     * 左右翻选项卡固定
     * @param {Object} $a 点击的选项卡对象
     */
    fixed: function ($a) {
        let tabW = $a.outerWidth();
        $a.prevAll().each(function () {
            tabW += $(this).outerWidth();
        });

        // 获得当前选项卡之前所有的宽度
        const $box = $('#sys-main-head-body');
        let boxW = $box.outerWidth();
        $('.roll-nav', $box).each(function () {
            boxW -= $(this).outerWidth();
        });

        // 可视化选项卡的区域宽度
        const width = tabW > boxW ? tabW - boxW : 0;
        $('nav.sys-main-tabs-nav').animate({
            marginLeft: 0 - width + 'px'
        }, 'fast');

        return $a.attr('tab');
    },

    // 显示选项卡对应的展示区
    showTabBox: function (id) {
        if (id == null || id == '') {
            id = TabControlUtil.tabs.find('>a.active:first').attr('tab');
        }

        $('>:not([tab=' + id + '])', TabControlUtil.tabs).removeClass('active');
        $('>:not([box=' + id + '])', TabControlUtil.boxs).hide();

        const $box = $('>div[box=' + id + ']', TabControlUtil.boxs);
        if ($box.length > 0) {
            // 存在直接显示
            $box.show(200);
            // 对应选项卡激活
            $('[tab=' + id + ']', TabControlUtil.tabs).addClass('active');
        }
    },

    // 关闭选项卡
    close: function (tabId) {
        if (tabId) {
            this.remove(tabId);
        }

        let $box = $('>a.active:last', TabControlUtil.tabs);
        if ($box.length == 0) {
            $box = $('>a:last', TabControlUtil.tabs);
        }

        // 对象执行指定事件
        $box.trigger('click');
    },

    // 删除选项卡
    remove: function (tabId) {
        $('>.sys-tab[tab=' + tabId + ']', TabControlUtil.tabs).remove();
        $('>.emes-page[box=' + tabId + ']', TabControlUtil.boxs).remove();
    }
};

export default TabControlUtil;
