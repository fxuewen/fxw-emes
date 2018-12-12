class UploadUtil {
    constructor(customOption) {
        this.customOption = customOption;
        this.option = {
            // 选完文件后，是否自动上传。
            auto: false,
            // 文件接收服务端。
            server: '/file/upload',
            // 选择文件的按钮
            pick: {
                id: '#emes-file-uploader-picker',
                multiple: false,
                label: '选择文件'
            },
            fileNumLimit: 1,
            formData: {
                encrypted: 1 // 是否加密
            }
        };
        Object.assign(this.option, customOption);

        // 初始化
        this.$list = $('#emes-file-uploader-list');
        this.$list.html('');
        this.uploader = WebUploader.create(this.option);
        this.bindEvent();
    }

    // 显示上传模态框
    showUploadModal() {
        $('.emes-modal-upload-web').modal('show');
        $('.emes-modal-upload-web').on('shown.bs.modal', () => {
            this.$list.html('');
            this.uploader.refresh();
        });
        $('.emes-modal-upload-web').on('hidden.bs.modal.bs.modal', () => {
            this.$list.html('');
            this.uploader.reset();
        });
    }

    // 绑定事件
    bindEvent() {
        // 上传完成事件监听
        this.uploader.on('fileQueued', (file) => {
            this.uploader.options.formData.fileName = file.name;
            const imgTypeArr = ['gif', 'jpg', 'jpeg', 'bmp', 'png'];
            let li = null;
            if (imgTypeArr.indexOf(file.ext) < 0) {
                li = $(
                    `<div id="${file.id}" class="file-item thumbnail">
                        <div class="info">${file.name}</div>
                    </div>`
                );
            } else {
                li = $(
                    `<div id="${file.id}" class="file-item thumbnail">
                        <img><div class="info">${file.name}</div>
                    </div>`
                );
            }
            const $img = li.find('img');
            // $list为容器jQuery实例
            this.$list.append(li);
            // 如果为非图片文件,创建缩略图
            // thumbnailWidth x thumbnailHeight 为 100 x 100
            if ($img) {
                this.uploader.makeThumb(file, (error, src) => {
                    if (error) {
                        $img.replaceWith('<span>不能预览</span>');
                        return;
                    }
                    $img.attr('src', src);
                }, 100, 100);
            }
        });

        // 文件上传过程中创建进度条实时显示。
        this.uploader.on('uploadProgress', (file, percentage) => {
            const $li = $(`#${file.id}`);
            let $percent = $li.find('.progress span');

            // 避免重复创建
            if (!$percent.length) {
                $percent = $('<p class="progress"><span></span></p>')
                    .appendTo($li)
                    .find('span');
            }

            $percent.css('width', percentage * 100 + '%');
        });

        // 文件上传成功，给item添加成功class, 用样式标记上传成功。
        this.uploader.on('uploadSuccess', (file, res) => {
            $('#' + file.id).addClass('upload-state-done');
            $('.emes-modal-upload-web').modal('hide');
            if (this.customOption.success && typeof this.customOption.success === 'function') {
                this.customOption.success(file, res);
            }
        });

        // 文件上传失败，显示上传出错。
        this.uploader.on('uploadError', (file) => {
            const $li = $(`#${file.id}`);
            let $error = $li.find('div.error');

            // 避免重复创建
            if (!$error.length) {
                $error = $('<div class="error"></div>').appendTo($li);
            }

            $error.text('上传失败');
        });

        // 完成上传完了，成功或者失败，先删除进度条。
        this.uploader.on('uploadComplete', (file) => {
            $('#' + file.id).find('.progress').remove();
        });

        // 点击上传事件
        $('#emes-file-uploader-upload').bind('click', () => {
            this.uploader.retry();
        });
    }
}

export default UploadUtil;
