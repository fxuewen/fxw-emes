import './page.css';
import pageTpl from './page.html';
// import projectCode from './project-code.html';
// import projectDirector from './project-director.html';
// import orderCode from './order-code.html';
// import orderDirector from './order-director.html';
// import orderErp from './order-Erp.html';
import templateTpl from './template';
import i18n from '../../../i18n/i18n';

const page = {
    pageDom: null,

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

        // 项目负责人所属部门
        $('a[item="biz_project_director_depart"]', page.pageDom).on('click', function(){
            page.projectDirector(this);
        });

        // 订单跟进人所属部门
        $('a[item="biz_order_director_depart"]', page.pageDom).on('click', function(){
            page.ordertDirector(this);
        });

        // 是否支持ERP导入修改数量
        $('a[item="biz_order_erp_update"]', page.pageDom).on('click', function(){
            page.orderErpUpdate(this);
        });

        // 项目编号生成规则
        $('a[item="biz_project_code_rule"]', page.pageDom).on('click', function(){
            page.projectCodeRule(this);
        });

        // 订单编号生成规则
        $('a[item="biz_order_code_rule"]', page.pageDom).on('click', function(){
            page.orderCodeRule(this);
        });

        // 保存
        $('.emes-right-div input[item="submit"]').on('click', function(){
            page.saveProjectDirector();
        });
    },

    // 项目负责人所属部门
    projectDirector: function (dom) {
        // 获取所有的部门
        $.ajax({
            url: 'mes/global-config/department/list',
            dataType: 'json',
            type: 'get',
            async: 'false',
            success: function (res){
                const temp = Handlebars.compile(templateTpl.projectDirector);
                $('.emes-global-content', page.pageDom).html(temp(res));

                // 数据回填
                page.projectDirectorData(dom);
            },
            error: function() {
                console.error('获取数据失败！');
            }
        });
    },

    // 项目负责人所属部门数据回填
    projectDirectorData: function (dom) {
        $.ajax({
            url: 'mes/global-config/project/detail',
            data: {'category': $(dom).attr('item')},
            dataType: 'json',
            type: 'get',
            success: function (res){
                console.log(res.data);
                $('.emes-projectDirector input[name="id"]').val(res.data.id);
                const arr = res.data.depart;
                const checkboxArr = $('.emes-projectDirector input[name="name"]');
                $.each(arr, function(index, val){
                    $.each(checkboxArr, function(index2,value2){
                        if (val == value2.value) {
                            $(value2).attr('checked', 'true');
                            return false;
                        }
                    });
                });
            },
            error: function() {
                console.error('获取数据失败！');
            }
        });
    },

    // 保存项目负责人所属部门修改数据
    saveProjectDirector: function () {
        $.ajax({
            url: 'mes/global-config/project/update',
            data: $('.emes-projectDirector').serialize(),
            dataType: 'json',
            type: 'post',
            success: function (){
                console.log('保存成功！');
            },
            error: function() {
                console.error('获取数据失败！');
            }
        });
    }

    // ordertDirector: function (dom) {

    // },

    // orderErpUpdate: function (dom) {

    // },

    // projectCodeRule: function (dom) {

    // },

    // orderCodeRule: function (dom) {

    // }
};

export default page;
