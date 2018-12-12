export default class Util {
    static map2Arr(map) {
        const arr = [];
        for (const key in map) {
            if (map.hasOwnProperty(key)) {
                arr.unshift({
                    key: key,
                    value: map[key]
                });
            }
        }

        return arr;
    }

    // 文件上传
    static fileUpload($dom) {
        $dom.easyUpload({
            allowFileTypes: '*', // 允许上传文件类型，格式';*.doc;*.pdf'
            allowFileSize: 100000, // 允许上传文件大小(KB)
            selectText: '选择文件', // 选择文件按钮文案
            multi: true, // 是否允许多文件上传
            multiNum: 5, // 多文件上传时允许的文件数
            showNote: true, // 是否展示文件上传说明
            note: '提示：最多上传5个文件，支持格式为所有', // 文件上传说明
            showPreview: true, // 是否显示文件预览
            url: '/file/upload', // 上传文件地址
            fileName: 'file', // 文件filename配置参数
            formParam: {
                // 不需要验证token时可以去掉token: $.cookie('token_cookie')
            }, // 文件filename以外的配置参数，格式：{key1:value1,key2:value2}
            timeout: 30000, // 请求超时时间
            successFunc: function (res) {
                $('.emes-web-message-alert').html('上传成功');
                $('.emes-web-message').show();
                setTimeout(function () {
                    $('.emes-web-message').hide();
                }, 500);
                const array = res.success;
                $('.emes-modal-picUuid').val(res.success[array.length - 1].data.uuid);
                $('.fancybox-image').attr('scr', res.success[array.length - 1].data.path);
                $('.emes-modal-upload').modal('hide');
            }, // 上传成功回调函数
            errorFunc: function (res) {
                console.log('失败回调', res);
            }, // 上传失败回调函数
            deleteFunc: function (res) {
                console.log('删除回调', res);
            } // 删除文件回调函数
        });
    }

    static getAjaxPromise(options) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: options.url,
                type: options.type,
                data: options.data || '',
                dataType: 'json',
                success: function (data) {
                    resolve(data);
                },
                error: function (error) {
                    reject(error);
                }
            });
        });
    }
}
