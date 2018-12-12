import i18n from '../i18n/i18n';

let timer;
class DialogUtil {

    static showDialog(options) {
        const body = $('body'),
            dialogMask = $('<div class="emes-dialog-contianer">'),
            dialogWin = $('<div class="dialog-window">'),
            winHeader = $('<div class="dialog-header emes-clearfloat"><div class="dialog-title">' +
                i18n.$t('emes.dialog.title.prompt') +
                '</div><div class="dialog-close fa fa-times fa-lg"></div></div>'),
            winContent = $('<div class="dialog-container">'),
            winFooter = $('<div class="dialog-footer">');

        dialogWin.append(winHeader);
        // 传入massage，显示到弹框中
        if (options.message) {
            dialogWin.append(winContent.html(options.message));
        }

        if (options.type === 'confirm') {
            // confirm 框
            this.creatButton(winFooter,  [{
                text: i18n.$t('emes.dialog.btn.confirm'),
                callback: options.callback
            }, {
                text: i18n.$t('emes.dialog.title.cancel')
            }], options);
            dialogWin.append(winFooter);
        } else {
            // 不传type 默认alert框
            if (options.delay && options.delay > 0) {
                this.creatButton(winFooter,  [{
                    text: `${i18n.$t('emes.dialog.btn.confirm')}(${options.delay})`,
                }], options);
                dialogWin.append(winFooter);
                // aler框倒计时
                let num = options.delay;
                timer = setInterval(() => {
                    num--;
                    $('.dialog-footer button').text(`${i18n.$t('emes.dialog.btn.confirm')}(${num})`);
                    if (num <= 0) {
                        clearInterval(timer);
                        this.close();
                    }
                }, 1000);
            } else {
                this.creatButton(winFooter,  [{
                    text: i18n.$t('emes.dialog.btn.confirm'),
                }], options);
                dialogWin.append(winFooter);
            }
        }

        // 渲染html
        dialogMask.append(dialogWin);
        body.append(dialogMask);

        $('.dialog-close').on('click', () => {
            this.close();
        });
    }

    // 关闭弹出框
    static close() {
        clearInterval(timer);
        $('.emes-dialog-contianer').remove();
    }

    // 创建按钮组
    static creatButton(footer, buttons, options) {
        const self = this;
        // const status = false;
        // 遍历出数组
        if ($(buttons).length === 1) {
            $(buttons).each(function(index, element) {
                const text = element.text ? element.text : 'button';
                const singleButton = $('<button>' + text  + '</button>');
                singleButton.on('click', () => {
                    self.close();
                });
                footer.append(singleButton);
            });

        } else if ($(buttons).length === 2) {
            $(buttons).each(function(index, element) {
                const text = element.text ? element.text : 'button';
                const callback = element.callback ? element.callback : null;

                const singleButton = $('<button>' + text + '</button>');
                // 如果有回调函数，按钮绑定回调函数
                singleButton.on('click', () => {
                    if (callback) {
                        callback();
                    }
                    self.close();
                });
                footer.append(singleButton);
            });
        }

    }
}

export default DialogUtil;
