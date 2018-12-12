import './page.css';
import pageTpl from './page.html';
import TableUtil from '../../../utils/table-util';
import i18n from '../../../i18n/i18n';

const page = {
    pageDom: null,
    dataTable: new TableUtil('emes-page-table-online-user', '/mes/users/online/report/all'),

    load: function (target, TabControlUtil) {
        const tabBox = $(i18n.$html(pageTpl));
        tabBox.appendTo($('#sys-main-page-tabs'));
        tabBox.attr('box', target.id);
        page.pageDom = tabBox;
        // 新加页面事件处理
        $('>div[box=' + target.id + ']', TabControlUtil.boxs).initUI();
        // 添加对应选项卡
        TabControlUtil.open({
            id: target.id,
            text: target.innerText,
            close: true
        });

        // 生成数据表格
        page.refreshTable();

        // 查询
        $('.search-query', page.pageDom).bind('click', function () {
            page.refreshTable();
        });

        // 下线按钮点击
        $('.btn-group-offline', page.pageDom).unbind('click').bind('click', function () {
            page.offline();
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
            url: '/mes/users/online/report/all',
            type: 'GET',
            dataType: 'json',
            data: $.param(data) + `&${formParam}`,
            success: function (res) {
                page.dataTable.dataGrid(res.data);
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },

    // 下线
    offline: function () {
        const ids = page.dataTable.getSelIds();
        const names = [];
        ids.forEach(() => {
            const rowData = page.dataTable.getRowData('ssssss');
            rowData.name && names.push(rowData.name);
        });

        if (ids.length < 1) {
            alert('至少选择一个下线用户');
            return;
        } else {
            $.ajax({
                url: '/mes/users/offline',
                type: 'post',
                data: {
                    'userIdList': ids.toString(),
                    'userNameList': names.toString(),
                },
                success: function () {
                    page.refreshTable();
                },
                error: function () {

                }
            });
        }

    }
};

export default page;
