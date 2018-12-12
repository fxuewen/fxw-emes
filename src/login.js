import './lib/font-awesome/css/font-awesome.min.css';
import './css/login.min.css';
import 'jquery/dist/jquery.min';
import './lib/particleground.min';


$(document).ready(function () {
    $('.particles').particleground({
        dotColor: '#ddd',
        lineColor: '#ddd'
    });

    const login = {
        init: function () {
            let $input = $('input[name="userName"]');
            if ($input.val() != '') {
                $input = $('input[name="password"]');
            }
            $input.focus();
            return this;
        },

        isIE: function () {
            let ie = 0;
            const ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf('msie') != -1) {
                ie = ua.match(/msie ([\d.]+)/)[1];
            }
            if (8.0 == ie) {
                alert('本系统不支持IE8访问,请升级IE10或更高版本!');
                $('div.main').remove();
                return false;
            }
            return true;
        }
    };

    if (login.isIE()) {
        login.init();
    }

    $('input[name="userName"]').val('');
    $('input[name="password"]').val('');
    const str = document.cookie.split(';');
    for (let i = 0; i < str.length; i++) {
        const arr = str[i].split('=');
        if ('userName' == arr[0].trim()) {
            $('input[name="userName"]').val(arr[1]);
        }
    }

    $('#sign').on('click', function () {
        const userName = $('input[name="userName"]').val();
        const password = $('input[name="password"]').val();
        if (userName.trim().length > 0 && password.trim().length > 0 && userName != null && password != null) {
            $.ajax({
                type: 'post',
                url: '/privilege/account/login',
                data: {
                    'userName': userName,
                    'password': password
                },
                dataType: 'json',
                cache: false,
                success: function (data) {
                    if (data.code == 200) {
                        document.cookie = 'userReceive=' + userName + '';
                        document.cookie = 'userName=' + userName;
                        document.cookie = 'password=' + password;
                        localStorage.setItem('userName', userName);
                        window.location.href = '/index.html';
                    } else if(data.code == 'emescloud.nologin'){
                        if(confirm('当前账号已经登录，是否要强制下线并重新登录？')){
                            // 清除已登录的缓存信息
                            $.ajax({
                                type: 'post',
                                url: '/privilege/account/clearUserCatch',
                                data: {
                                    'userName': userName,
                                    'password': password
                                },
                                dataType: 'json',
                                cache: false,
                                success: function (data) {
                                    if (data.code == 200) {
                                        $.ajax({
                                            type: 'post',
                                            url: '/privilege/account/login',
                                            data: {
                                                'userName': userName,
                                                'password': password
                                            },
                                            dataType: 'json',
                                            cache: false,
                                            success: function (data) {
                                                if (data.code == 200) {
                                                    document.cookie = 'userReceive=' + userName + '';
                                                    document.cookie = 'userName=' + userName;
                                                    document.cookie = 'password=' + password;
                                                    localStorage.setItem('userName', userName);
                                                    window.location.href = '/index.html';
                                                }else {
                                                    $('span.err').html('帐号或密码输入错误!');
                                                }
                                            },
                                            error: function () {

                                            }
                                        });
                                    }else {
                                        $('span.err').html('系统错误，请联系管理员!');
                                    }

                                },
                                error: function () {

                                }
                            });
                        }
                    }else {
                        $('span.err').html('帐号或密码输入错误!');
                    }

                },
                error: function () {

                }
            });
        } else {
            $('span.err').html('请输入账号和密码!');
        }
    });
});
