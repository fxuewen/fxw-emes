import pageTpl from './page.html';
import modalTpl from './modal.html';
import modifyModalTpl from './modify-modal.html';
import deliveryModalTpl from './delivery-modal.html';
import TableUtil from '../../../utils/table-util';
import i18n from '../../../i18n/i18n';
import BasePage from '../../base-page';
import UploadUtil from '../../../utils/upload-util';
import DialogUtil from '../../../utils/dialog-util';

class Page extends BasePage {

    constructor() {
        super(pageTpl);
        this.pageDom = null;
        this.dataTable = null;
        this.orderApartTable = null;

        // 订单表
        this.dataTableSetting = {
            options: {
                custom: {
                    formatter: {
                        deliveryDate: (colValue)=>{
                            const date = new Date(colValue);
                            return date.format('YYYY-MM-DD');
                        }
                    },
                    pagerCallback: (page, pageSize) => {
                        this.refreshTable(page, pageSize);
                    }
                }
            }
        };

        // 交期表
        this.orderApartTableSetting = {
            options: {
                custom: {
                    formatter:{
                        date: (colValue) =>{
                            const date = new Date(colValue);
                            return date.format('YYYY-MM-DD');
                        },
                        deliveryDate: (colValue)=>{
                            const date = new Date(colValue);
                            return date.format('YYYY-MM-DD');
                        }
                    },
                    pagerCallback: (page, pageSize) => {
                        this.refreshOrderApartTable(page, pageSize);
                    }
                }
            }
        };
    }

    load(target) {
        if (!this.tabOption && target) {
            this.tabOption = {
                id: target.id,
                text: target.innerText,
                close: true
            };
        }
        super.load();

        // 模糊查询
        $('input[name=productName]', this.pageDom).initFuzzySearch({
            type: 45
        });
        $('input[name=clientName]', this.pageDom).initFuzzySearch({
            type: 12
        });
        $('input[name=mainCode]', this.pageDom).initFuzzySearch({
            type: 46
        });

        this.dataTable = new TableUtil('emes-page-table-order-manage',
            '/mes/order/report/all', this.dataTableSetting.options);
        // 生成数据表格
        this.refreshTable();

        this.orderApartTable = new TableUtil('emes-page-table-order-apart',
            '/mes/order/report/delivery/detail', this.orderApartTableSetting.options);

        // 查询订单
        $('.search-btn-group .search-query', this.pageDom).bind('click', () => {
            this.refreshTable();
        });

        // 展开
        $('.emes-btn-apart-group .emes-btn-group-show', this.pageDom).bind('click', () => {
            this.isShow();
        });

        // 查询交期
        $('.emes-btn-apart-group .emes-btn-group-search', this.pageDom).bind('click', () => {
            this.refreshOrderApartTable();
        });

        // 添加订单
        $('.emes-btn-order-group .emes-btn-group-add', this.pageDom).bind('click', () => {
            $('.emes-modal-title label').html('添加订单信息');
            $('.emes-modal-title .emes-modal-uploadphoto').html('');
            this.refreshModal(i18n.$html(modalTpl));
            $('#sys-main-mode-tabs').initUI();
            $('#sys-main-mode-tabs').modal('show');
            // 模态框下拉框
            const contentModal = $('.emes-modal-content');
            // 产品名称
            $('input[select-name=productId]', contentModal).initFuzzySearch({
                type: 47,
                selectbox:true,
                nameKey:'name',
                idKey:'id',
                // 选择事件
                selectCallback: (data) => {
                    $('input[name=productName]',contentModal).val(data.name);
                    $('input[name=clientName]',contentModal).val(data.clientName);
                    $('input[name=clientId]',contentModal).val(data.clientId);
                }
            });
            // 订单跟踪人
            $('input[select-name=followerId]', contentModal).initFuzzySearch({
                type: 49,
                params: {'extraParame':'biz_order_director_depart'},
                selectbox:true,
                nameKey:'name',
                idKey:'id',
                selectCallback: (data) => {
                    $('input[name=followerName]',contentModal).val(data.name);
                }
            });

            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    this.add();
                }
            });
        });

        // 修改订单
        $('.emes-btn-order-group .emes-btn-group-modify', this.pageDom).bind('click', () => {
            const formData = this.selectOne();
            if (!formData) {
                DialogUtil.showDialog({
                    message: '只能选择一条记录!',
                    type: 'alert',
                    delay: 5
                });
                return;
            }

            // 填充订单数据
            $.ajax({
                url: 'mes/order/order/detail',
                type: 'get',
                data: formData,
                dataType: 'json',
                async: false,
                success: (res) => {
                    $('.emes-modal-title label').html('修改订单信息');
                    $('.emes-modal-title .emes-modal-uploadphoto').html('');
                    this.refreshModifyModal(res);
                    $('#sys-main-mode-tabs').initUI();
                    $('#sys-main-mode-tabs').modal('show');
                    const contentModal = $('.emes-modal-content');
                    // 订单跟踪人
                    const fuzzySearch = $('input[select-name=followerId]', contentModal).initFuzzySearch({
                        type: 49,
                        params: {'extraParame':'biz_order_director_depart'},
                        selectbox:true,
                        nameKey:'name',
                        idKey:'id',
                        selectCallback: (data) => {
                            $('input[name=followerName]',contentModal).val(data.name);
                        }

                    });
                    fuzzySearch.setValue(res.data.followerName, res.data.followerId);
                    $('input[name="deliveryDate"]', $('.emes-modal-content')).val(res.data.deliveryDate);
                },
                error: () => {
                    console.error('获取订单数据失败！');
                }
            });

            // 订单跟进人绑定事件
            $('select[item=\'orderEmployee\']', $('.emes-modal-content.modify-order')).on('change', (event) => {
                this.employeeModify(event.target);
            });

            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                this.modifyOrder();
            });
        });

        // 刪除订单
        $('.emes-btn-order-group .emes-btn-group-delete', this.pageDom).bind('click', () => {
            this.del();
        });

        // 导入(文件)按钮
        $('.emes-btn-order-group .emes-btn-group-import', this.pageDom).bind('click', () => {
            const uploader = new UploadUtil({
                server: '/mes/order/batch/insert',
                success: (file, res) => {
                    if(res.success){
                        DialogUtil.showDialog({
                            message: '导入成功',
                            type: 'alert',
                            delay: 5
                        });
                        this.refreshTable();
                    }else{
                        DialogUtil.showDialog({
                            message: res.msg,
                            type: 'alert',
                            delay: 5
                        });
                    }
                }
            });
            uploader.showUploadModal();
        });

        // 添加交期
        $('.emes-btn-apart-group .emes-btn-group-add', this.pageDom).bind('click', () => {
            const formData = this.selectOrderOne();
            if (!formData) {
                DialogUtil.showDialog({
                    message: '只能选择一条交期记录',
                    type: 'alert',
                    delay: 5
                });
                return;
            }
            $('.emes-modal-title label').html('添加交期拆分');
            $('.emes-modal-title .emes-modal-uploadphoto').html('');
            this.refreshModal(i18n.$html(deliveryModalTpl));
            const orderId = formData[0].getAttribute('id');
            const code = $(formData[0])
                .find('td[aria-describedby="emes-page-table-order-manage_code"]')[0].innerText;
            const productName = $(formData[0])
                .find('td[aria-describedby="emes-page-table-order-manage_productName"]')[0].innerText;
            const orderQuantity = $(formData[0])
                .find('td[aria-describedby="emes-page-table-order-manage_quantity"]')[0].innerText;
            const deliveryDate = $(formData[0])
                .find('td[aria-describedby="emes-page-table-order-manage_deliveryDate"]')[0].innerText;
            $('input[name="orderId"]', $('.emes-from-delivery')).val(orderId);
            $('input[name="code"]', $('.emes-from-delivery')).val(code);
            $('input[name="productName"]', $('.emes-from-delivery')).val(productName);
            $('input[name="orderQuantity"]', $('.emes-from-delivery')).val(orderQuantity);
            $('input[name="deliveryDate"]', $('.emes-from-delivery')).val(deliveryDate);
            $('#sys-main-mode-tabs').initUI();
            $('#sys-main-mode-tabs').modal('show');


            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    this.addDeliveryDate();
                }
            });
        });

        // 修改交期
        $('.emes-btn-apart-group .emes-btn-group-modify', this.pageDom).bind('click', () => {
            const deliveryFormData = this.selectDeliveryOne();
            const formData = this.selectOrderOne();
            if (!deliveryFormData) {
                DialogUtil.showDialog({
                    message: '只能选择一条交期拆分记录',
                    type: 'alert',
                    delay: 5
                });
                return;
            }
            if (!formData) {
                DialogUtil.showDialog({
                    message: '只能选择一条订单记录',
                    type: 'alert',
                    delay: 5
                });
                return;
            }
            $.ajax({
                url: 'mes/order/delivery/detail',
                data: deliveryFormData,
                dataType: 'json',
                type: 'get',
                success: (res) => {
                    $('.emes-modal-title label').html('修改交期拆分');
                    $('.emes-modal-title .emes-modal-uploadphoto').html('');
                    this.refreshModal(i18n.$html(deliveryModalTpl), res);
                    const orderId = formData[0].getAttribute('id');
                    const code = $(formData[0])
                        .find('td[aria-describedby="emes-page-table-order-manage_code"]')[0].innerText;
                    const productName = $(formData[0])
                        .find('td[aria-describedby="emes-page-table-order-manage_productName"]')[0].innerText;
                    const orderQuantity = $(formData[0])
                        .find('td[aria-describedby="emes-page-table-order-manage_quantity"]')[0].innerText;
                    const deliveryDate = $(formData[0])
                        .find('td[aria-describedby="emes-page-table-order-manage_deliveryDate"]')[0].innerText;
                    $('input[name="orderId"]', $('.emes-from-delivery')).val(orderId);
                    $('input[name="code"]', $('.emes-from-delivery')).val(code);
                    $('input[name="productName"]', $('.emes-from-delivery')).val(productName);
                    $('input[name="orderQuantity"]', $('.emes-from-delivery')).val(orderQuantity);
                    $('input[name="deliveryDate"]', $('.emes-from-delivery')).val(deliveryDate);

                    $('#sys-main-mode-tabs').initUI();
                    $('#sys-main-mode-tabs').modal('show');
                    $('input[name="date"]', $('.emes-modal-content')).val(res.data.date);

                    // 将保存按钮的事件处理改为添加
                    $('.emes-modal-save').unbind('click').bind('click', () => {
                        this.modifyDeliveryDate();
                    });
                },
                error: function () {
                    console.error('获取交期拆分记录失败！');
                }
            });
        });

        // 刪除交期拆分
        $('.emes-btn-apart-group .emes-btn-group-delete', this.pageDom).bind('click', () => {
            this.delDelivery();
        });
    }

    // 刷新数据表格(查询或更新)
    refreshTable(page, pageSize) {
        const formData = $('.emes-search-form', this.pageDom).serialize();
        const data = {
            page: page || 1,
            pageSize: pageSize || 10
        };
        $.ajax({
            url: 'mes/order/report/all',
            type: 'get',
            dataType: 'json',
            data: formData + `&${$.param(data)}`,
            success: (res) => {
                this.dataTable.dataGrid(res.data);
            },
            error: () => {
                console.error('查询失败');
            }
        });
    }

    // 刷新交期拆分表(查询或更新)
    refreshOrderApartTable(page, pageSize) {
        const formData = this.selectOne();
        if (!formData) {
            DialogUtil.showDialog({
                message: '只能选择一条记录',
                type: 'alert',
                delay: 5
            });
            return;
        }
        const data = {
            page: page || 1,
            pageSize: pageSize || 10
        };
        $.ajax({
            url: 'mes/order/report/delivery/detail',
            type: 'get',
            dataType: 'json',
            data: formData + `&${$.param(data)}`,
            success: (res) => {
                this.orderApartTable.dataGrid(res.data);
            },
            error: function () {
                console.error('查询失败');
            }
        });
    }

    // 判断是否只选择了一条订单记录
    selectOne() {
        let formData = $('.emes-page-order-table .jqgrow.ui-row-ltr.success', this.pageDom);
        if (formData.length == 1) {
            formData = {
                orderId: formData[0].getAttribute('id')
            };
            formData = $.param(formData);
            return formData;
        }
        return null;
    }

    // 判断是否只选择了一条订单记录
    selectOrderOne() {
        const formData = $('.emes-page-order-table .jqgrow.ui-row-ltr.success', this.pageDom);
        if (formData.length == 1) {
            return formData;
        }
        return null;
    }

    // 判断是否只选择了一条交期拆分记录
    selectDeliveryOne() {
        let formData = $('.emes-page-apart-table .jqgrow.ui-row-ltr.success', this.pageDom);
        if (formData.length == 1) {
            formData = {
                id: formData[0].getAttribute('id')
            };
            formData = $.param(formData);
            return formData;
        }
        return null;
    }

    // 刷新模态框
    refreshModal(modal, data) {
        const modalContent = Handlebars.compile(modal);
        // Handllebars填充模板数据
        if (data == null || data == 'undefined') {
            $('#modalContent').html(modalContent());
        } else {
            const date = new Date(data.data.date);
            data.data.date = date.format('YYYY-MM-DD');
            $('#modalContent').html(modalContent(data.data));
        }
    }

    // 刷新订单修改模态框
    refreshModifyModal(data) {
        const modalContent = Handlebars.compile(i18n.$html(modifyModalTpl));
        // Handllebars填充模板数据
        if (data == null || data == 'undefined') {
            $('#modalContent').html(modalContent());
        } else {
            const date = new Date(data.data.deliveryDate);
            data.data.deliveryDate = date.format('YYYY-MM-DD');
            $('#modalContent').html(modalContent(data.data));
        }
    }

    employeeSelect(dom) {
        const contentModal = $('.emes-modal-content');
        $('input[name="followerName"]', contentModal).val($(dom).find('option:selected').text());
    }

    // 添加订单
    add() {
        // 订单不能重复
        if (this.fieldValidation()) {
            DialogUtil.showDialog({
                message: '订单编号不能重复',
                type: 'alert',
                delay: 5
            });
            return;
        }
        $.ajax({
            url: 'mes/order/order/insert',
            type: 'post',
            dataType: 'json',
            data: $('.form-horizontal').serialize(),
            success: (res) => {
                if (!res.success) {
                    DialogUtil.showDialog({
                        message: res.msg,
                        type: 'alert',
                        delay: 5
                    });
                } else {
                    $('#sys-main-mode-tabs').modal('hide');
                    this.refreshTable();
                }
            },
            error: function () {
                console.error('新增客户信息失败');
            }
        });
    }

    // 效验
    fieldValidation() {
        const code = $('input[name="code"]').val();
        const codeTds = $('td[aria-describedby="emes-page-table-order-manage_code"]', this.pageDom);
        for (let i = 0; i < codeTds.length; i++) {
            if (code == $(codeTds[i]).attr('title')) {
                return true;
            }
        }
        return false;
    }

    // 修改
    modifyOrder() {
        $.ajax({
            url: 'mes/order/order/update',
            type: 'post',
            dataType: 'json',
            data: $('.form-modify-order').serialize(),
            success: (res) => {
                if (!res.success) {
                    DialogUtil.showDialog({
                        message: res.msg,
                        type: 'alert',
                        delay: 5
                    });
                } else {
                    $('#sys-main-mode-tabs').modal('hide');
                    this.refreshTable();
                }
            },
            error: () => {
                console.error('修改客户信息失败');
            }
        });
    }

    // 修改界面选择 订单跟进人 时修改值
    employeeModify(dom) {
        const contentModal = $('.form-modify-order');
        console.log(dom);
        console.log($(dom).find('option:selected').text());
        $('input[name="followerName"]', contentModal).val($(dom).find('option:selected').text());
    }

    // 刪除
    del() {
        const ids = this.dataTable.getSelIds();
        if (ids.length == 0) {
            DialogUtil.showDialog({
                message: '请选择要删除的数据',
                type: 'alert',
                delay: 5
            });
        } else {
            DialogUtil.showDialog({
                message: i18n.$t('emes.confirmDelete'),
                type: 'confirm',
                callback: () => {
                    $.ajax({
                        url: 'mes/order/order/delete',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            'id': ids.toString()
                        },
                        success: (res) => {
                            if (!res.success) {
                                DialogUtil.showDialog({
                                    message: res.msg,
                                    type: 'alert',
                                    delay: 5
                                });
                            } else {
                                this.refreshTable();
                                this.refreshOrderApartTable();
                            }
                        },
                        error: () => {
                            console.error('删除失败');
                        }
                    });
                }
            });
        }
    }

    // 是否展示
    isShow() {
        if ($('.emes-page-apart-table').is(':hidden')) {
            $('.emes-page-apart-table').show();
            $('.fa-toggle-down', this.pageDom).next().text('隐藏');
            $('.fa-toggle-down', this.pageDom).attr('class', 'fa fa-toggle-up');
        } else {
            $('.emes-page-apart-table').hide();
            $('.fa-toggle-up', this.pageDom).next().text('展开');
            $('.fa-toggle-up', this.pageDom).attr('class', 'fa fa-toggle-down');
        }
    }

    // 添加订单交期
    addDeliveryDate() {
        const flag = this.validationDelivery();
        if (!flag) {
            return;
        }
        $.ajax({
            url: 'mes/order/delivery/insert',
            type: 'post',
            dataType: 'json',
            data: $('.form-horizontal', $('.emes-from-delivery')).serialize(),
            success: (res) => {
                if(!res.success) {
                    DialogUtil.showDialog({
                        message: res.msg,
                        type: 'alert',
                        delay: 5
                    });
                } else {
                    $('#sys-main-mode-tabs').modal('hide');
                    this.refreshOrderApartTable();
                }
            },
            error: () => {
                console.error('获取查询数据失败！');
            }
        });
    }

    // 修改订单交期
    modifyDeliveryDate() {
        const flag = this.validationDelivery();
        if (!flag) {
            return;
        }
        $.ajax({
            url: 'mes/order/delivery/update',
            type: 'post',
            dataType: 'json',
            data: $('.form-horizontal', $('.emes-from-delivery')).serialize(),
            success: (res) => {
                if (!res.success) {
                    DialogUtil.showDialog({
                        message: res.msg,
                        type: 'alert',
                        delay: 5
                    });
                } else {
                    $('#sys-main-mode-tabs').modal('hide');
                    this.refreshOrderApartTable();
                }
            },
            error: () => {
                console.error('获取查询数据失败！');
            }
        });
    }

    // 删除交期拆分
    delDelivery() {
        const ids = this.orderApartTable.getSelIds();
        if (ids.length == 0) {
            DialogUtil.showDialog({
                message: '请选择要删除的数据',
                type: 'alert',
                delay: 5
            });
        } else {
            DialogUtil.showDialog({
                message: i18n.$t('emes.confirmDelete'),
                type: 'confirm',
                callback: () => {
                    $.ajax({
                        url: 'mes/order/delivery/delete',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            'id': ids.toString()
                        },
                        success: (res) => {
                            if (res.success) {
                                this.refreshOrderApartTable();
                            } else {
                                DialogUtil.showDialog({
                                    message: res.msg,
                                    type: 'alert',
                                    delay: 5
                                });
                            }
                        },
                        error: function () {
                            console.error('删除失败');
                        }
                    });
                }
            });
        }
    }

    // 添加或修改交期验证
    validationDelivery() {
        const orderQuantity = $('input[name="orderQuantity"]', $('.emes-from-delivery')).val();
        const deliveryDate = $('input[name="deliveryDate"]', $('.emes-from-delivery')).val();
        const quantity = $('input[name="quantity"]', $('.emes-from-delivery')).val();
        const date = $('input[name="date"]', $('.emes-from-delivery')).val();
        if (parseInt(quantity) > parseInt(orderQuantity)) {
            DialogUtil.showDialog({
                message: '拆分数量不能大于总订单数',
                type: 'alert',
                delay: 5
            });
            return false;
        }
        if (date > deliveryDate) {
            DialogUtil.showDialog({
                message: '拆分交期不能晚于订单交期',
                type: 'alert',
                delay: 5
            });
            return false;
        }
        return true;
    }

}

export default Page;
