import Util from '../utils/util';
import menuTpl from '../template/menu.html';
import TabControlUtil from '../utils/tab-control-util';
import MessageUtil from '../utils/message-util';
import Mapper from './mapper';
import userImage from '../assets/images/person.jpg';
import ModalUtil from '../utils/modal-util';

const main = {

    /**
     * 初始化菜单栏及导航栏
     */
    init: function () {
        // 初始化html
        $('<div box=\'mu_0\' style=\'font-size: 24px; margin: 300px 500px 300px 700px;\'>功能建设中</div>')
            .appendTo($('#sys-main-page-tabs'));
        TabControlUtil.open({
            id: 'mu_0',
            text: '首页',
            icon: 'fa fa-home',
            close: false
        });

        // 获取登录图片
        // $.ajax({
        //     type: 'GET',
        //     url : '/privilege/permissions/user/information',
        //     dataType: 'json',
        //     success: function (res) {
        //         const picPath = res.data.path;
        //         if(picPath !== null && picPath !== ''){
        //             $('.emes-user-image').attr('src',picPath);
        //         }
        //     },
        //     error: function(res){
        //         console.error(res.responseText);
        //     }
        // });

        // 获取左侧导菜单内容
        $.ajax({
            type: 'GET',
            url: '/privilege/permissions/role-menu/query',
            data: {
                'roleId': 1
            },
            dataType: 'json',
            success: function (res) {
                const menuData = Util.map2Arr(res.data);
                const contentTemplate = Handlebars.compile(menuTpl);
                $('.emes-sidebar-menu').html(contentTemplate(menuData));
                // 事件绑定
                main.bindEvent();

                const userName = localStorage.getItem('userName');
                if (userName) {
                    $('.emes-user-name').text(userName);
                    $('.emes-user-image').attr('src', userImage);
                }
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });

        // 导航栏事件绑定
        main.bindNavEvent();
        MessageUtil.pullNewMessage();
        // 模态框初始化
        $('#sys-main-mode-tabs').modal({
            backdrop: 'static',
            keyboard: false
        });
        $('#sys-main-mode-tabs').on('show.bs.modal', function() {
            ModalUtil.modalCenter($(this));
        });
        ModalUtil.modalDrag($('#sys-main-mode-tabs'));
        $('#sys-main-mode-tabs').modal('hide');
    },

    // 导航按钮
    bindNavEvent: function () {
        // 点击dom
        $(document).bind('click', function () {
            $('div.em-message-body').slideUp(1500);
        });

        // 锁屏
        $('#sys-main-lock').unbind('click').bind('click', function () {
            alert('功能建设中');
        });

        // 消息按钮
        $('.sys-main-tabs-nav #message').bind('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $('div.em-message-body').show();
            const userReceive = MessageUtil.getCookie('userReceive');
            MessageUtil.initMsg(userReceive);
        });

        // 个人中心
        $('.emes-personal-center').unbind('click').bind('click', function () {
            alert('功能建设中');
        });

        // 退出登录
        $('.emes-nav-sign-out').unbind('click').bind('click', function () {
            $.ajax({
                type: 'post',
                url: '/privilege/account/logout',
                dataType: 'json',
                cache: false,
                success: function () {
                    const cname = 'EMES-loginToken';
                    const cvalue = '';
                    const d = new Date();
                    d.setTime(d.getTime());
                    const expires = 'expires=' + d.toUTCString();
                    document.cookie = cname + '=' + cvalue + '; ' + expires;
                    window.location.href = '/login.html';
                },
                error: function () {

                }
            });
        });
    },

    /**
     * 菜单添加绑定事件
     */
    bindEvent: function () {

        /**
         * 父菜单点击事件
         */
        $('.sidebar-menu>li').bind('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const $li = $(this);
            if (!$li.hasClass('menu-open')) {
                $('.sidebar-menu>li').removeClass('menu-open');
                $('.emes-sidebar-menu .treeview-menu').css('display', 'none');
                $li.addClass('menu-open');
                $li.find('ul').css('display', 'block');
            } else {
                $li.removeClass('menu-open');
                $li.find('ul').css('display', 'none');
            }
        });

        /**
         * 子菜单点击事件
         */
        $('.sidebar-menu .treeview-menu>li>a').bind('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const pageDom = $('>div[box=' + this.id + ']', TabControlUtil.boxs);

            // page已存在的直接通过选项卡打开
            if (pageDom.length > 0) {
                TabControlUtil.showTabBox(this.id);
            } else {
                // 页面不存在需要加载page
                const mapperUrl = this.getAttribute('data-url');
                Mapper[mapperUrl].load(this, TabControlUtil);
            }
        });
    }
};

export default main;
