import './page.css';
import pageTpl from './page.html';
import logTpl from './loginfo.html';
import suggestModalTpl from './modal-suggest.html';
import modalInfoTpl from './modal-info.html';
import TableUtil from '../../../utils/table-util';
import i18n from '../../../i18n/i18n';

const page = {
    pageDom: null,
    dataTable: null,
    tableOptions: {
        custom: {
            formatter: {
                status: (colValue) => {
                    if (colValue == 0) {
                        return '开启';
                    } else if (colValue == 1) {
                        return '暂停';
                    } else if (colValue == 2) {
                        return '废弃';
                    }
                }
            },
            unformat: {
                status: (colValue) => {
                    if (colValue == '开启') {
                        return 0;
                    } else if (colValue == '暂停') {
                        return 1;
                    } else if (colValue == '废弃') {
                        return 2;
                    }
                }
            }
        }
    },
    url: '',

    load: function (target, TabControlUtil) {
        const tabBox = $(i18n.$html(pageTpl));
        tabBox.appendTo($('#sys-main-page-tabs'));
        tabBox.attr('box', target.id);
        page.pageDom = tabBox;
        // 新加页面事件处理
        $('>div[box=' + target.id + ']', TabControlUtil.boxs).initUI();
        TabControlUtil.open({
            id: target.id,
            text: target.innerText,
            close: true
        });

        page.dataTable = new TableUtil('emes-page-table-task', '/mes/schedule/report/all', page.tableOptions);

        // 生成数据表格
        page.refreshTable();

        // 查询
        $('.search-query', page.pageDom).bind('click', function () {
            page.refreshTable();
        });

        // 暂停
        $('.btn-group-stop', page.pageDom).bind('click', function () {
            page.url = '/mes/schedule/pause';
            page.showSuggestModal();
        });

        // 恢复
        $('.btn-group-resume', page.pageDom).bind('click', function () {
            page.url = '/mes/schedule/resume';
            page.showSuggestModal();
        });

        // 废弃
        $('.btn-group-discard', page.pageDom).bind('click', function () {
            page.url = '/mes/schedule/discard';
            page.showSuggestModal();
        });

        // 修改
        $('.btn-group-modify', page.pageDom).bind('click', function () {
            page.url = '/mes/schedule/single';
            const selItems = [];
            $('input[type=checkbox]:checked').each(function () {
                selItems.push($(this).attr('data-pid'));
            });
            if (selItems.length == 1) {
                $.ajax({
                    url: page.url,
                    type: 'post',
                    dataType: 'json',
                    cache: false,
                    data: {
                        'scheduleId': selItems.toString(),
                    },
                    success: function (data) {
                        $('.em-modal-title label').html('修改后台任务');
                        page.refreshModal(data.data);
                        $('#sys-main-mode-tabs').modal('show');
                        // 将保存按钮的事件处理改为添加
                        $('.emes-modal-save')[0].onclick = function () {
                            page.add();
                        };
                    },
                    error: function () {

                    }
                });
            } else {
                alert('只能选择一个任务');
            }
        });
    },

    // 刷新数据表格(查询或更新)
    refreshTable: function () {
        const formParam = $('.emes-search-form', page.pageDom).serialize();
        const data = {
            page: 1,
            pageSize: 10
        };
        $.ajax({
            url: '/mes/schedule/report/all',
            type: 'get',
            data: $.param(data) + `&${formParam}`,
            dataType: 'json',
            success: function (res) {
                page.dataTable.dataGrid(res.data);
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    loginfo: function (tabBox) {
        const scheduleId = [];
        $('input[name="chk"]').each(function () {
            scheduleId.push($(this).attr('data-pid'));
        });
        $.ajax({
            type: 'GET',
            url: '/task/info',
            data: {
                'scheduleId': scheduleId.toString()
            },
            dataType: 'json',
            success: function (res) {
                const logTplTemplate = Handlebars.compile(logTpl);
                $('.log-info', tabBox).html(logTplTemplate(res));
                const time = 5000;
                setTimeout(page.loginfo, time);
            }
        });
    },

    // 意见框
    showSuggestModal: function () {
        const selItems = [];
        $('input[type=checkbox]:checked').each(function () {
            selItems.push($(this).attr('data-pid'));
        });

        if (selItems.length < 1) {
            alert('至少选择一个任务');
            return;
        } else {
            // 定义模态框内容
            $('#emes-main-modal-common').html(i18n.$html(suggestModalTpl));
            // 显示模态框
            $('#emes-main-modal-common').modal('show');

            // 模态框提交按钮
            $('.modal-suggest-submit', $('#emes-main-modal-common')).unbind('click').bind('click', function () {
                $('#emes-main-modal-common').modal('hide');
                const content = $('.modal-suggest-content-input', $('#emes-main-modal-common')).val();
                $.ajax({
                    url: page.url,
                    type: 'post',
                    dataType: 'json',
                    cache: false,
                    data: {
                        'scheduleId': selItems.toString(),
                        'remark': content,
                    },
                    success: function () {
                        page.refreshTable();
                    },
                    error: function () {

                    }
                });
            });
        }
    },

    // 刷新模态框
    refreshModal: function (data) {
        const modalInfoTemplate = Handlebars.compile(i18n.$html(modalInfoTpl));
        // Handllebars填充模板数据
        if (data == null || data == 'undefined') {
            $('#modalContent').html(modalInfoTemplate({}));
        } else {
            $('#modalContent').html(modalInfoTemplate(data));
        }

        $('.emes-task-modal-btn-cron').unbind('focus').bind('focus', function () {
            page.showTimeModal();
        });
    },

    // 时间框
    showTimeModal: function () {

    },

    // 表格事件
    bindTableEvent: function () {
        // 表格tips
        $('td,th', page.pageDom).bind('mouseover', function () {
            if (this.scrollWidth <= this.offsetWidth) {
                return;
            }
            // 文本溢出时显示tip

            // 注册tip
            $(this).tooltip({
                position: 'right',
                content: `<span style="color:#fff">${this.innerText}</span>`,
                onShow: function () {
                    $(this).tooltip('tip').css({
                        backgroundColor: '#666',
                        borderColor: '#666'
                    });
                },
                onHide: function () {
                    // 隐藏时销毁
                    $(this).tooltip('destroy');
                }
            });

            // 显示tip
            $(this).tooltip('show');
        });
    }
};

export default page;
