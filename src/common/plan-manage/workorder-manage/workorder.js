import './page.css';
import pageTpl from './page.html';
import modalTpl from './modal.html';
import workorderTpl from './workorder-modal.html';
import template from './template';
import TableUtil from '../../../utils/table-util';
import i18n from '../../../i18n/i18n';
import BasePage from '../../base-page';
import DialogUtil from '../../../utils/dialog-util';

class Page extends BasePage {
    constructor() {
        super(pageTpl);
        this.pageDom = null;
        this.orderTable = null;
        this.workOrderTable = null;
        this.workOrderConfigTable = null;
        this.groupIds = '';

        // 订单表参数设置(工单生成)
        this.orderTableSetting = {
            options: {
                custom: {
                    formatter: {
                        deliveryDate: (colValue) =>{
                            const date = new Date(colValue);
                            return date.format('YYYY-MM-DD');
                        },
                        diTime: (colValue) =>{
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

        // 工单表参数设置(工单生成)
        this.workOrderSetting = {
            options: {
                custom: {
                    formatter: {
                        type: (colValue) => {
                            if(colValue === 1){
                                return '试制';
                            }else if(colValue === 2){
                                return '正常';
                            }else if(colValue === 3){
                                return '重工';
                            }else if(colValue === 4){
                                return '变更';
                            }
                        },
                        depotLock: (colValue) => {
                            if(colValue === 0){
                                return 'N';
                            }else if(colValue === 1){
                                return 'Y';
                            }
                        },
                        startTime: (colValue) =>{
                            const date = new Date(colValue);
                            return date.format('YYYY-MM-DD');
                        },
                        endTime: (colValue) =>{
                            const date = new Date(colValue);
                            return date.format('YYYY-MM-DD');
                        }
                    },
                    pagerCallback: (page, pageSize) => {
                        this.refreshWorkOrderTable(page, pageSize);
                    }
                }
            }
        };

        // 工单配置表参数设置(工单配置)
        this.workOrderConfigSetting = {
            options: {
                custom: {
                    formatter: {
                        type: (colValue) => {
                            if(colValue === 1){
                                return '试制';
                            }else if(colValue === 2){
                                return '正常';
                            }else if(colValue === 3){
                                return '重工';
                            }else if(colValue === 4){
                                return '变更';
                            }
                        },
                        status: (colValue) => {
                            if(colValue === 1){
                                return '未提交排产';
                            }else if(colValue === 2){
                                return '已提交排产';
                            }else if(colValue === 3){
                                return '生产中';
                            }else if(colValue === 4){
                                return '暂停';
                            }else if(colValue == 5){
                                return '暂存';
                            }else if(colValue == 6){
                                return '完工';
                            }
                        },
                        depotLock: (colValue) => {
                            if(colValue === 0){
                                return 'N';
                            }else if(colValue === 1){
                                return 'Y';
                            }
                        },
                        startTime: (colValue) =>{
                            const date = new Date(colValue);
                            return date.format('YYYY-MM-DD');
                        },
                        endTime: (colValue) =>{
                            const date = new Date(colValue);
                            return date.format('YYYY-MM-DD');
                        }
                    },
                    singleSelect: true,
                    pagerCallback: (page, pageSize) => {
                        this.workOrderRefreshTable(page, pageSize);
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
        $('input[name=productName]',this.pageDom).initFuzzySearch({
            type: 45
        });
        $('input[name=clientName]', this.pageDom).initFuzzySearch({
            type: 12
        });
        $('input[name=mainCode]', this.pageDom).initFuzzySearch({
            type: 46
        });
        $('input[name=code]',this.pageDom).initFuzzySearch({
            type: 34
        });

        // 订单表初始化查询(工单生成)
        this.orderTable = new TableUtil('emes-page-table-order',
            '/mes/workorder/report/order/all', this.orderTableSetting.options);
        this.refreshTable();

        // 订单表带条件查询(工单生成)
        $('#workOrderGenerate .search-btn-group .search-query', this.pageDom).on('click', () => {
            this.refreshTable();
        });

        // 展开按钮(工单生成)
        $('.emes-btn-workorder-group .emes-btn-group-show', this.pageDom).on('click', () => {
            this.isShow();
        });

        // 工单表查询(工单生成)
        this.workOrderTable = new TableUtil('emes-page-table-workorder',
            '/mes/workorder/report/workorder/query', this.workOrderSetting.options);

        // 查询订单对应的工单(工单生成)
        $('.emes-btn-workorder-group .emes-btn-group-search', this.pageDom).on('click', () => {
            // 请先选择订单
            const ids = this.orderTable.getSelIds();
            if (ids.length < 1) {
                DialogUtil.showDialog({
                    message: '请先选择订单',
                    type: 'alert',
                    delay: 5
                });
                return;
            }
            this.refreshWorkOrderTable();
        });

        // 工单添加按钮(工单生成)
        $('.emes-btn-workorder-group .emes-btn-group-add', this.pageDom).on('click', () => {
            // 验证只能选择名称相同的产品
            const formData = this.selValidation();
            if (!formData) {
                DialogUtil.showDialog({
                    message: '只能选择产品名称相同的订单',
                    type: 'alert',
                    delay: 5
                });
                return;
            }

            $('.emes-modal-title label').html('添加工单信息');
            $('.emes-modal-title .emes-modal-uploadphoto').html('');
            this.refreshModal(i18n.$html(modalTpl));
            $('#sys-main-mode-tabs').initUI();
            $('#sys-main-mode-tabs').modal('show');

            // 填充模态框内容
            $('input[name="productName"]').val(formData[0].productName);
            $('input[name="productId"]').val(formData[0].productId);
            $('input[name="orderId"]').val(this.orderTable.getSelIds());

            $.ajax({
                url: 'mes/workorder/globalDefine/query',
                type: 'get',
                dataType: 'json',
                success: (res) => {
                    const temp = Handlebars.compile(template.optionWorkOrderTypeTpl);
                    const contentModal = $('.emes-modal-content');
                    $('select[item=\'orderType\']', contentModal).html(temp(res.data));
                    $('.selectpicker', contentModal).selectpicker('refresh');

                    $('select[item=\'orderType\']', contentModal).addClass('emes-form-validate');
                },
                error: function () {
                    console.error('获取查询数据失败！');
                }
            });

            // 工单数量失去焦点是验证
            $('input[name="quantity"]').on('blur', () => {
                const quantity = $('input[name="quantity"]').val();
                let quantityTotal = 0;
                formData.forEach((value) => {
                    quantityTotal += parseInt(value.workableOrder);
                });
                if (quantity > quantityTotal) {
                    $('input[name="quantity"]').val('');
                    DialogUtil.showDialog({
                        message: '输入的工单数量不得大于:'+ quantityTotal,
                        type: 'alert',
                        delay: 5
                    });
                }
            });

            // 计划生产时间与结束时间验证
            $('input[name="endTime"]').on('blur', () => {
                const startTime = $('input[name="startTime"]').val();
                const endTime = $('input[name="endTime"]').val();
                if (startTime > endTime) {
                    $('input[name="endTime"]').val('');
                    DialogUtil.showDialog({
                        message: '计划结束时间必须大于等于计划生产时间',
                        type: 'alert',
                        delay: 5
                    });
                }
            });

            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                this.add();
            });
        });

        // 工单删除按钮(工单生成)
        $('.emes-btn-workorder-group .emes-btn-group-delete', this.pageDom).bind('click', () => {
            this.del();
        });

        // 工单配置表初始化(工单配置)
        this.workOrderConfigTable = new TableUtil('emes-page-table-workorder-config',
            '/mes/workorder/report/workorder/all',
            this.workOrderConfigSetting.options),
        this.workOrderRefreshTable();

        // 工单配置查询按钮(工单配置)
        $('#workOrderConfig .search-btn-group .search-query', this.pageDom).bind('click', () => {
            this.workOrderRefreshTable();
        });

        // 工单配置修改(工单配置)
        $('.emes-btn-workorder-config-group .emes-btn-group-modify', this.pageDom).on('click', () => {
            this.workOrderModify();
        });

        // 提交排产
        $('.emes-btn-group-commit', this.pageDom).on('click', () => {
            this.changeStatus(2,'未提交排产');
        });

        // 取消排产
        $('.emes-btn-group-cancle', this.pageDom).on('click', () => {
            this.changeStatus(1,'已提交排产');
        });

        // 开始
        $('.emes-btn-group-start', this.pageDom).on('click', () => {
            this.changeStatus(3,'已提交排产');
        });

        // 暂停
        $('.emes-btn-group-suspend', this.pageDom).on('click', () => {
            this.changeStatus(4,'生产中');
        });

        // 暂存
        $('.emes-btn-group-stag', this.pageDom).on('click', () => {
            this.changeStatus(5,'生产中');
        });

        // 继续
        $('.emes-btn-group-continue', this.pageDom).on('click', () => {
            this.changeStatus(3,'continue');
        });

        // 完成
        $('.emes-btn-group-finish', this.pageDom).on('click', () => {
            this.changeStatus(6,'生产中');
        });
    }

    // 刷新订单表数据(工单生成)
    refreshTable(page, pageSize) {
        const formData = $('#workOrderGenerate .emes-search-form', this.pageDom).serialize();
        const data = {page: page || 1, pageSize: pageSize || 10};
        $.ajax({
            url: 'mes/workorder/report/order/all',
            type: 'get',
            dataType: 'json',
            data: formData + `&${$.param(data)}`,
            success: (res) => {
                this.orderTable.dataGrid(res.data);
            },
            error: function () {
                console.error('查询失败');
            }
        });
    }

    // 是否展示
    isShow() {
        if ($('.emes-page-workorder-table').is(':hidden')) {
            $('.emes-page-workorder-table').show();
            $('.fa-toggle-down', this.pageDom).next().text('隐藏');
            $('.fa-toggle-down', this.pageDom).attr('class', 'fa fa-toggle-up');
        } else {
            $('.emes-page-workorder-table').hide();
            $('.fa-toggle-up', this.pageDom).next().text('展开');
            $('.fa-toggle-up', this.pageDom).attr('class', 'fa fa-toggle-down');
        }
    }

    // 刷新工单表(查询或更新)
    refreshWorkOrderTable(page, pageSize) {
        const formData = $('.emes-page-order-table .jqgrow.ui-row-ltr.success', this.pageDom);
        let ids = '';
        formData.each((index, element) => {
            if (index == formData.length - 1) {
                ids += $(element).attr('id');
            } else {
                ids += $(element).attr('id') + ',';
            }
        });

        const data = {orderId: ids, page: page || 1, pageSize: pageSize || 10};
        $.ajax({
            url: 'mes/workorder/report/workorder/query',
            type: 'get',
            dataType: 'json',
            data: $.param(data),
            success: (res) => {
                this.workOrderTable.dataGrid(res.data);
            },
            error: function () {
                console.error('查询失败');
            }
        });
    }

    // 验证:只能选择名称相同的产品
    selValidation() {
        const formData = [];
        const rowIds = this.orderTable.getSelIds();
        if (rowIds.length >= 1) {
            if (rowIds.length == 1) {
                formData[0] = this.orderTable.getRowData(rowIds);
                return formData;
            } else {
                for (let i = 0; i < rowIds.length; i++) {
                    if (this.orderTable.getRowData(rowIds[0]).productId !=
                        this.orderTable.getRowData(rowIds[i]).productId) {
                        return null;
                    }
                    formData[i] = this.orderTable.getRowData(rowIds[i]);
                }
                return formData;
            }
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
            const startTime = new Date(data.startTime);
            const endTime = new Date(data.endTime);
            data.startTime = startTime.format('YYYY-MM-DD');
            data.endTime = endTime.format('YYYY-MM-DD');
            $('#modalContent').html(modalContent(data));
        }
    }

    // 添加工单
    add() {
        const validation = this.valValidation();
        if (validation) {
            DialogUtil.showDialog({
                message: '带 * 号的字段不能为空',
                type: 'alert',
                delay: 5
            });
            return;
        }
        let quantity = parseInt($('input[name="quantity"]', $('.emes-modal-content')).val());
        $.ajax({
            url: 'mes/workorder/workorder/insert',
            data: $('.form-horizontal', $('.emes-modal-content')).serialize(),
            dataType: 'json',
            type: 'post',
            success: (res) => {
                if (!res.success) {
                    DialogUtil.showDialog({
                        message: res.msg,
                        type: 'alert',
                        delay: 5
                    });
                } else {
                    const rowIds = this.orderTable.getSelIds();
                    for (let i = 0; i < rowIds.length; i++) {
                        if (quantity >= parseInt(this.orderTable.getRowData(rowIds[i]).workableOrder)) {
                            quantity -= parseInt(this.orderTable.getRowData(rowIds[i]).workableOrder);
                            $('#'+rowIds[i]).find('td[aria-describedby="emes-page-table-order_workableOrder"]').eq(0).text(0);
                        } else {
                            let amount = parseInt(this.orderTable.getRowData(rowIds[i]).workableOrder) - quantity;
                            $('#'+rowIds[i]).find('td[aria-describedby="emes-page-table-order_workableOrder"]').eq(0).text(amount);
                            break;
                        }
                    }
                    $('#sys-main-mode-tabs').modal('hide');
                    this.refreshWorkOrderTable();
                }

            },
            error: function () {
                console.error('新增失败');
            }
        });
    }

    // 值不允许为空
    valValidation() {
        const val = $('select.emes-form-validate, input.emes-form-validate', $('.emes-modal-content'));
        for (let i = 0; i < val.length; i++) {
            if (!val[i].value) {
                return val[i];
            }
        }
    }

    // 删除工单
    del() {
        const ids = this.workOrderTable.getSelIds();
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
                        url: 'mes/workorder/workorder/delete',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            id: ids.toString()
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
                                this.refreshWorkOrderTable();
                            }
                        },
                        error: (res) => {
                            console.error(res.responseText);
                        }
                    });
                }
            });
        }
    }

    // 工单配置表(查询或更新)
    workOrderRefreshTable(page, pageSize) {
        const formData = $('#workOrderConfig .emes-search-form', this.pageDom).serialize();
        const data = {page: page || 1, pageSize: pageSize || 10};
        $.ajax({
            url: 'mes/workorder/report/workorder/all',
            type: 'get',
            dataType: 'json',
            data: formData + `&${$.param(data)}`,
            success: (res) => {
                this.workOrderConfigTable.dataGrid(res.data);
            },
            error: () => {
                console.error('查询失败');
            }
        });
    }

    // 工单配置修改按钮事件
    workOrderModify() {
        const id = this.workOrderConfigTable.getSelIds();
        if (id.length != 1) {
            DialogUtil.showDialog({
                message: '请选择一条数据修改',
                type: 'alert',
                delay: 5
            });
            return;
        } else {
            const record = this.workOrderConfigTable.getRowData(id);
            $.ajax({
                url: 'mes/workorder/workorder/detail',
                type: 'get',
                dataType: 'json',
                data: {
                    id: id.toString()
                },
                success: (res) => {
                    if (!res.success) {
                        DialogUtil.showDialog({
                            message: res.msg,
                            type: 'alert',
                            delay: 5
                        });
                        return;
                    }
                    $('.emes-modal-title label').html('修改工单信息');
                    $('.emes-modal-title .emes-modal-uploadphoto').html('');
                    this.refreshModal(i18n.$html(workorderTpl), res.data.wordorderParameter);
                    $('#sys-main-mode-tabs').initUI();
                    $('#sys-main-mode-tabs').modal('show');

                    // 回填值
                    $('input[name="startTime"]').val(res.data.wordorderParameter.startTime);
                    $('input[name="endTime"]').val(res.data.wordorderParameter.endTime);
                    const colValue = parseInt(res.data.wordorderParameter.type);
                    $('input[item="type"]').val(this.typeValue(colValue));

                    // 工艺选择
                    const temp = Handlebars.compile(template.optionProcessTpl);
                    $('select[item=\'processName\']', $('#modalContent')).html(temp(res.data.processList));
                    $('select[item=\'processName\']', $('#modalContent')).selectpicker('val', record.processId);

                    // 工单分组
                    const groupTemp = Handlebars.compile(template.groupTpl);
                    $('select[item=\'groupId\']', $('#modalContent')).html(groupTemp(res.data.wordorderParameterList));
                    // let groupId = res.data.wordorderParameter.groupIds;
                    // if(groupId !== null){
                    //     // 分组id赋值
                    //     this.groupIds = groupId.split(',');
                    //     $('select[item=\'groupId\']', $('#modalContent')).selectpicker('val', this.groupIds);
                    // }
                    $('.selectpicker', $('#modalContent')).selectpicker('refresh');

                    // 工艺值改变
                    $('select[item=\'processName\']', $('#modalContent')).on('change', (event) => {
                        this.processNameChange(event.target);
                    });

                    // 工艺添加验证样式
                    const contentModal = $('.emes-modal-content');
                    $('select[item=\'processName\']', contentModal).addClass('emes-form-validate');
                },
                error: (res) => {
                    console.error(res.responseText);
                }
            });

            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                this.update(record);
            });
        }
    }

    // 修改工单配置保存
    update(data) {
        const validation = this.valValidation();
        if (validation) {
            DialogUtil.showDialog({
                message: '带 * 号的字段不能为空',
                type: 'alert',
                delay: 5
            });
            return;
        }
        if (parseInt(data.inputAmount) > parseInt($('input[name="quantity"]', $('.emes-workorder-config-form'))[0].value)) {
            DialogUtil.showDialog({
                message: '工单数量必须大于等于投入产量',
                type: 'alert',
                delay: 5
            });
            return;
        }else if (data.status !== '未提交排产'){
            if(data.status !== '暂停' && data.status !== '暂存'){
                DialogUtil.showDialog({
                    message: '暂停或暂存状态才能修改',
                    type: 'alert',
                    delay: 5
                });
                return;
            }
        }
        // const addGroups = $('select[item=\'groupId\']', $('.emes-workorder-config-form')).selectpicker('val');
        // if(addGroups !== null){
        //     let removeId = [];
        //     let addId = [];
        //     if(this.groupIds !== null){
        //         removeId = this.groupIds;
        //         addGroups.forEach((value,index) => {
        //             if (this.groupIds.indexOf(value) < 0) {
        //                 addId.push(value);
        //                 removeId.remove(index);
        //             }
        //         });
        //     }else{
        //         addId = addGroups;
        //     }
        //     $('input[name=addId]',$('.emes-workorder-config-form')).val(addId);
        //     $('input[name=removeId]',$('.emes-workorder-config-form')).val(removeId);
        // }
        $.ajax({
            url: 'mes/workorder/workorder/update',
            type: 'post',
            dataType: 'json',
            data: $('.emes-workorder-config-form').serialize(),
            success: (res) => {
                if (!res.success) {
                    DialogUtil.showDialog({
                        message: res.msg,
                        type: 'alert',
                        delay: 5
                    });
                } else {
                    $('#sys-main-mode-tabs').modal('hide');
                    this.workOrderRefreshTable();
                    this.refreshTable();
                }
            },
            error: () => {
                console.error('修改失败');
            }
        });
    }

    // 工单类型
    typeValue(colValue) {
        if(colValue === 1){
            return '试制';
        }else if(colValue === 2){
            return '正常';
        }else if(colValue === 3){
            return '重工';
        }else if(colValue === 4){
            return '变更';
        }
    }

    // 改变工艺名称
    processNameChange(dom) {
        $('input[name="processId"]', $('#modalContent')).val($(dom).val());
    }

    // 修改排产状态
    changeStatus(status,type) {
        const id = this.workOrderConfigTable.getSelIds();
        if(id.length != 1) {
            DialogUtil.showDialog({
                message: '请先选择一条数据',
                type: 'alert',
                delay: 5
            });
            return;
        }
        const workorder = this.workOrderConfigTable.getRowData(id);
        const orderStatus = workorder.status;
        if(type === 'continue'){
            if(orderStatus !== '暂停' && orderStatus !== '暂存'){
                DialogUtil.showDialog({
                    message: '状态为暂停/暂存才能执行',
                    type: 'alert',
                    delay: 5
                });
                return;
            }
        }
        if(orderStatus !== type && type !== 'continue'){
            DialogUtil.showDialog({
                message: '状态为'+type+'才能执行',
                type: 'alert',
                delay: 5
            });
            return;
        }
        $.ajax({
            url: '/mes/workorder/update-status',
            data: {'id': id[0], 'status': status},
            type: 'post',
            dataType: 'json',
            success: (res) => {
                if (res.success) {
                    this.workOrderRefreshTable();
                }else{
                    DialogUtil.showDialog({
                        message: res.msg,
                        type: 'alert',
                        delay: 5
                    });
                }
            },
            error: () => {
                console.error('修改失败！');
            }
        });
    }
}

export default Page;
