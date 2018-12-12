/**
 * Created by 智能制造 on 2018/3/28.
 */
const MessageUtil = {
    pullNewMessage: function () {

        const userId = MessageUtil.getCookie('EMES-loginToken');
        if (!userId) {

            console.log('拉取新消息,no token');
            return;

        }


        $.ajax({
            url: 'message/client/pullnew',
            dataType: 'json',
            type: 'post',
            async: true,
            timeout: 0,	// 永不超时
            success: function (data) {

                if (data.code == 200) {

                    const msgSize = data.data.length;
                    $('.emes-messages-label-total').text(msgSize);

                } else {

                    // 登录过期
                    if (data.code == 'emescloud.nologin') {

                        window.location = '/login.html';

                    } else {

                        console.log('拉取新消息ret.code!=200，内部错误:' + data.code + ',' + data.data);

                    }

                }
                let interNxtPull = 3000;
                // 如果已显示有新消息，则加大再次请求查询的间隔
                if ($('#message').text() > 0) {

                    interNxtPull = interNxtPull * 10;

                }
                setTimeout(MessageUtil.pullNewMessage, interNxtPull);

            },
            error: function () {

                console.log('拉取新消息失败，内部错误');
                setTimeout(MessageUtil.pullNewMessage, 30000);

            }
        });

    },

    showDetail: function () {

        const currA = event.target;
        const ul = document.getElementById('msg_detail_1');

        //	if($(detailUlId).is(':hidden')) {
        //		$(detailUlId).show();
        //	} else {
        //		$(detailUlId).hide();
        //	}

        if (ul.style.display == 'none' || ul.style.display == '' || !ul.style.display) {

            ul.style.display = 'block';
            currA.style.color = 'red';
            console.log('show');

        } else {

            ul.style.display = 'none';
            currA.style.color = 'black';
            console.log('hide');

        }

    },

    createMsgDiv: function (messages) {

        const mainDiv = $('div.em-message-body .em-message-context')[0];
        mainDiv.innerHTML = '';
        messages.forEach(function (message) {

            const div = document.createElement('div');
            div.className = 'con-dom';
            div.style.cssText = 'margin:10px;';
            const span = document.createElement('span');
            span.className = 'msg_short';
            span.innerHTML = '来自' + message.userSend + '：' + message.content.substr(0, 8) + '...';
            if (message.status != 2) {

                // 未读状态设为红色
                span.style.color = 'red';

            }

            const ul = document.createElement('ul');
            ul.className = 'msg_detail';
            // $(".msg_detail").css("display", "none");
            const liSend = document.createElement('li');
            liSend.innerHTML = message.userSend;
            const liTime = document.createElement('li');
            liTime.innerHTML = message.gmtCreate;
            const liCont = document.createElement('li');
            liCont.innerHTML = message.content;

            ul.appendChild(liSend);
            ul.appendChild(liTime);
            ul.appendChild(liCont);
            const lineDiv = document.createElement('div');
            lineDiv.style.cssText += 'width:1000px;margin:0 auto;padding:0 200px; border-top:1px solid #ddd;';
            span.onclick = function () {

                if (ul.style.display == 'none' || ul.style.display == '' || !ul.style.display) {

                    ul.style.display = 'block';
                    console.log('show');

                } else {

                    ul.style.display = 'none';
                    console.log('hide');

                }
                span.style.display = 'none';
                // 设置已读
                MessageUtil.updateReaded(message.id);

            };

            div.appendChild(span);
            div.appendChild(ul);
            mainDiv.appendChild(lineDiv);
            mainDiv.appendChild(div);
            $('.msg_detail').css('display', 'none');

        });

    },

    initMsg: function (userId) {

        $.ajax({
            url: 'message/client/all',
            data: {
                'userReceive': userId
            },
            dataType: 'json',
            type: 'post',
            success: function (data) {

                if (data.code == 200) {

                    MessageUtil.createMsgDiv(data.data);

                } else {

                    console.log('更新消息状态ret.code!=200，内部错误:' + data.code + ',' + data.data);

                }

            },
            error: function () {

                console.log('拉取all消息，无服务.');
                //			createMsgDiv([
                //				{id: 1, userSend: 'hjl', status: 1, gmtCreate: 20180101, content: 'ahahah,123123a'},
                //				{id: 2, userSend: 'zjl', status: 2, gmtCreate: 20180103, content: 'chahah,123123a'},
                //				{id: 3, userSend: '3rt', status: 2, gmtCreate: 20180102, content: 'bhahah,123123a'}
                //			]);

            }
        });

    },

    updateReaded: function (msgId) {

        const spanShortMsg = event.target;
        $.ajax({
            url: 'message/client/readed',
            data: {
                'messageId': msgId
            },
            dataType: 'json',
            type: 'post',
            success: function (data) {

                if (data.code == 200) {

                    spanShortMsg.style.color = 'black';

                } else {

                    console.log('拉取all消息ret.code!=200，内部错误:' + data.code + ',' + data.data);

                }

            },
            error: function () {

                console.log('更新消息状态，无服务.');

            }
        });

    },

    // //--------------------------------------------------
    // // 初始化数据
    // //--------------------------------------------------
    //
    // window.onload = function () {
    //   var userId = getCookie("userId");
    //  initMsg(userId);
    // }

    // 获取单个cookies中属性的值
    getCookie: function (cookieName) {

        const arrCookie = document.cookie.split('; ');
        for (let i = 0; i < arrCookie.length; i++) {

            const arr = arrCookie[i].split('=');
            if (cookieName == arr[0]) {

                return arr[1];

            }

        }
        return '';

    }
};

export default MessageUtil;
