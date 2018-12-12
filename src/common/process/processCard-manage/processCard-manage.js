import './page.css';
import pageTpl from './page.html';
import modalTpl from './modal.html';
import TableUtil from '../../../utils/table-util';
import template from './template';
import BasePage from '../../base-page';
import UploadUtil from '../../../utils/upload-util';
import DialogUtil from '../../../utils/dialog-util';
import i18n from '../../../i18n/i18n';
class Page extends BasePage {
    constructor() {
        super(pageTpl);
        this.pageDom = null;
        this.dataTable = null;
        this.tree = null;
        this.searchData = null;
        this.tableOptions = {
            custom: {
                formatter: {
                    state: (cellValue) => {
                        switch (cellValue) {
                            case 0:
                                return '未提交';
                            case 1:
                                return '审批中';
                            case 2:
                                return '审批完成';
                            case 3:
                                return '已发布';
                            case 4:
                                return '已退回';
                            default:
                                return '';
                        }
                    },
                    dDel: (cellValues) => {
                        switch (cellValues) {
                            case 0:
                                return '未删除';
                            case 1:
                                return '已删除';
                            default:
                                return '';
                        }
                    },
                    listUser: (listUsers) => {
                        if (listUsers.length > 0) {
                            var userName = "";
                            for (var i = 0; i < listUsers.length; i++) {
                                if (i == listUsers.length - 1) {
                                    if (listUsers[i] != null) {
                                        userName += listUsers[i].name;
                                    }
                                } else {
                                    if (listUsers[i] != null) {
                                        userName += listUsers[i].name + ",";
                                    }
                                }
                            }
                            return userName;
                        }
                    }
                },
                unformat: {
                    state: (cellValue) => {
                        switch (cellValue) {
                            case '未提交':
                                return 0;
                            case '审批中':
                                return 1;
                            case '审批完成':
                                return 2;
                            case '已发布':
                                return 3;
                            case '已退回':
                                return 4;
                            default:
                                return '';
                        }
                    },
                    dDel: (cellValues) => {
                        switch (cellValues) {
                            case '未删除':
                                return 0;
                            case '已删除':
                                return 1;
                            default:
                                return '';
                        }
                    }
                }
            },
            onCellSelect: (rowid, iCol, cellcontent, e) => {
                if(iCol !=0){
                    const colName = this.dataTable.tableOptions.colModel[iCol - 1].name;
                    if(colName =="fileName"){
                            var temp = document.createElement("form");
                            temp.action = "/file/downloads";
                            temp.method = "post";
                            temp.style.display = "none";
                            var opt = document.createElement("input");
                            opt.name = "fileName";
                            opt.value = cellcontent;
                            temp.appendChild(opt);
                            document.body.appendChild(temp);
                            temp.submit();
                            return temp;
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
        $('input[name=name]', this.pageDom).initFuzzySearch({
            type: 30
        });
        $('input[name=procedureName]', this.pageDom).initFuzzySearch({
            type: 26
        });

        this.dataTable = new TableUtil(
            'emes-page-table-processCard',
            '/mes/process/card/report/all',
            this.tableOptions
        );
        // 新加页面事件处理
        // $('>div[box=' + target.id + ']', TabControlUtil.boxs).initUI();
        this.refreshTable();
        // 添加对应选项卡
        // TabControlUtil.open({
        //     id: target.id,
        //     text: target.innerText,
        //     close: true
        // });
        const optionTemplate = Handlebars.compile(template.optionTpl);
        // 获取选择框内容
        $.ajax({
            type: 'GET',
            url: 'mes/process/card/search/data',
            dataType: 'json',
            success: (res) => {
                this.searchData = res.data;
                $('select[name=productId]', this.pageDom).html(optionTemplate(res.data.listProduct));
                $('select[name=procedureId]', this.pageDom).html(optionTemplate(res.data.listProcedure));
                $('select[name=id]', this.pageDom).html(optionTemplate(res.data.listProcessCard));
                // bootstrap-select表格refresh
                $('.selectpicker', this.pageDom).selectpicker('refresh');
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });

        // 查询
        $('.search-query', this.pageDom).bind('click', () => {
            this.refreshTable();
        });


        // 添加
        $('.btn-group-add', this.pageDom).bind('click', () => {
            $('.emes-modal-title label').html('添加工艺卡管理');
            $('.emes-modal-title .emes-modal-uploadphoto').html('');
            this.refreshModal();
            $('#sys-main-mode-tabs').initUI();
            $('#sys-main-mode-tabs').modal('show');

            const uploader = new UploadUtil({
                success: (file, res) => {
                    console.log(res);
                    const fileName = res.data.path.substring(res.data.path.lastIndexOf('/') + 1);
                    $('input[name="filePath"]', $('.emes-modal-content')).val(res.data.path);
                    $('input[name="fileUuid"]', $('.emes-modal-content')).val(res.data.uuid);
                    $('input[name="fileName"]', $('.emes-modal-content')).val(fileName);
                }
            });
            // 导入(文件)按钮
            $('.emes-btn-order-group .btn-default-upload', $('#sys-main-mode-tabs')).bind('click', () => {
                uploader.showUploadModal();
            });
            var flag=false;
            $('input[name=name]', '#sys-main-mode-tabs').unbind('blur').bind('blur', () => {
                const processName=$('input[name=name]', '#sys-main-mode-tabs').val();
                $.ajax({
                    url: '/mes/process/card/name/repetition',
                    type: 'get',
                    dataType: 'json',
                    data: {
                        "name":processName
                    },
                    success: (res) => {
                        if (res.success) {
                           const size=res.data.length;
                            if(size>0){
                                DialogUtil.showDialog({
                                    message: '工艺卡名称不能重复！',
                                    type: 'alert'
                                });
                            }else {
                                flag=true;
                            }
                        }else {
                            alert(res.msg);
                        }
                    },
                    error: (res) => {
                        console.error(res.responseText);
                    }
                });
            });
            $('.dateTime', '#sys-main-mode-tabs').unbind('change').bind('change', () => {
                const effectTime=$('input[item=effectTime]', '#sys-main-mode-tabs').val();
                var effective=$('input[name=effectiveDay]', '#sys-main-mode-tabs').val();
                if(effectTime !=null && effective !=null){
                    var datt = effectTime.split('-');//这边给定一个特定时间
                    var newDate = new Date(datt[0], datt[1]-1, datt[2]);
                    var befminuts = newDate.getTime() + 1000 * 60 * 60 * 24 * parseInt(effective);//计算前几天用减，计算后几天用加，最后一个就是多少天的数量
                    var beforeDat = new Date;
                    beforeDat.setTime(befminuts);
                    var befMonth = beforeDat.getMonth()+1;
                    var mon = befMonth >= 10 ? befMonth : '0' + befMonth;
                    var befDate = beforeDat.getDate();
                    var da = befDate >= 10 ? befDate : '0' + befDate;
                    var newDate = beforeDat.getFullYear() + '-' + mon + '-' + da;
                    const effectiveDay=$('input[item=failureTime]', '#sys-main-mode-tabs').val(newDate);
                }

            });
            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag && flag) {
                    this.add();
                }
            });
        });

        // 修改
        $('.btn-group-modify', this.pageDom).bind('click', () => {
            if (this.dataTable.getSelIds().length === 0) {
                DialogUtil.showDialog({
                    message: '请选择修改行!',
                    type: 'alert'
                });
                return;
            } else if (this.dataTable.getSelIds().length > 1) {
                DialogUtil.showDialog({
                    message: '只可修改一条记录!',
                    type: 'alert'
                });
                return;
            }
            const rowId = this.dataTable.getSelIds()[0];
            const rowData = this.dataTable.getRowData(rowId);
            $('.emes-modal-title label').html('修改工艺卡管理');
            $('.emes-modal-title .emes-modal-uploadphoto').html('');

            this.refreshModal(rowData);
            $('#sys-main-mode-tabs').modal('show');
            $('input[select-name=productId]', '#sys-main-mode-tabs').attr("readonly","readonly");
            $('input[name=name]', '#sys-main-mode-tabs').attr("readonly","readonly");

            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    this.modify();
                }
            });
        });

        // 删除
        $('.btn-group-delete', this.pageDom).bind('click', () => {
            if (this.dataTable.getSelIds().length === 0) {
                DialogUtil.showDialog({
                    message: '请选择删除行',
                    type: 'alert'
                });
                return;
            } else if (this.dataTable.getSelIds().length > 1) {
                DialogUtil.showDialog({
                    message: '只可删除一条记录',
                    type: 'alert'
                });
                return;
            }
            this.delete();
        });
        // 提交
        $('.btn-group-submit', this.pageDom).bind('click', () => {
            if (this.dataTable.getSelIds().length === 0) {
                DialogUtil.showDialog({
                    message: '请选择提交行',
                    type: 'alert'
                });
                return;
            }
            this.submit();
        });
        // 发布
        $('.btn-group-release', this.pageDom).bind('click', () => {
            if (this.dataTable.getSelIds().length === 0) {
                DialogUtil.showDialog({
                    message: '请选择发布行',
                    type: 'alert'
                });
                return;
            }
            this.release();
        });
    }

    // 添加
    add() {
        const modalDom = $('#sys-main-mode-tabs');
        const employeeIds = $('select[name=employeeId]', modalDom).selectpicker('val');
        if(employeeIds.length<1){
            DialogUtil.showDialog({
                message: '审批人不能为空',
                type: 'alert'
            });
            return;
        }
        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        const dataArr = contentForm.serializeArray();
        const productName = $('input[name=productId]', modalDom).val();
        const procedureName = $('input[name=procedureId]', modalDom).val();
        const fileType = $('select[name=fileType]', modalDom).find('option:selected').text();
        var effectTime = $('input[name=effectTime]', modalDom).val();
        var failureTime = $('input[name=failureTime]', modalDom).val();
        effectTime = effectTime.replace("/-/g", "/");
        var effectTimes=new Date(effectTime).getTime();
        failureTime = failureTime.replace("/-/g", "/");
        var failureTimes = new Date(failureTime).getTime();
        if(effectTimes>failureTimes){
            DialogUtil.showDialog({
                message: '生效时间不能大于失效时间',
                type: 'alert'
            });
            return;
        }
        const processCard = {
            productName: productName,
            procedureName: procedureName,
            fileType: fileType
        };
        Object.keys(dataArr).forEach((key) => {
            const name = dataArr[key].name;
            const value = dataArr[key].value;
            processCard[name] = value;
        });
        $.ajax({
            url: '/mes/process/card/insert',
            type: 'post',
            dataType: 'json',
            data: $.param(processCard) + `&listUserId=${employeeIds.toString()}`,
            success: (res) => {
                $('#sys-main-mode-tabs').modal('hide');
                if (res.success) {
                    DialogUtil.showDialog({
                        message: '新增工艺信息成功!',
                        type: 'alert'
                    });
                    this.refreshTable();
                }else {
                    alert(res.msg);
                }
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    submit() {
        const ids = this.dataTable.getSelIds();
        const processCardList = new Array();
        ids.forEach((id) => {
            const rowData = this.dataTable.getRowData(id);
            processCardList.push(rowData);
        });
        $.ajax({
            url: '/mes/process/card/submit',
            type: 'post',
            dataType: 'json',
            data: {
                'processCardList': JSON.stringify(processCardList)
            },
            success: (res) => {
                if (res.success) {
                    DialogUtil.showDialog({
                        message: '提交成功',
                        type: 'alert'
                    });
                }
                if (res.msg == "internalErr: you can't resubmit") {
                    DialogUtil.showDialog({
                        message: '不能重复提交!',
                        type: 'alert'
                    });
                }
                if (res.msg == "internalErr: resubmit failed") {
                    DialogUtil.showDialog({
                        message: '提交失败!',
                        type: 'alert'
                    });
                }
                this.refreshTable();
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    release() {
        const ids = this.dataTable.getSelIds();
        const processCardList = new Array();
        ids.forEach((id) => {
            const rowData = this.dataTable.getRowData(id);
            processCardList.push(rowData);
        });
        $.ajax({
            url: '/mes/process/card/release',
            type: 'post',
            dataType: 'json',
            data: {
                'processCardList': JSON.stringify(processCardList)
            },
            success: (res) => {
                if (res.success) {
                    this.refreshTable();
                    DialogUtil.showDialog({
                        message: '发布成功',
                        type: 'alert'
                    });
                }
                if (res.msg == "internalErr: you don't have permission") {
                    DialogUtil.showDialog({
                        message: '没有权限发布!',
                        type: 'alert'
                    });
                }
                if (res.msg == "internalErr: can not repeat release") {
                    DialogUtil.showDialog({
                        message: '不能重复发布!',
                        type: 'alert'
                    });
                }
                if (res.msg == "internalErr: release failed") {
                    DialogUtil.showDialog({
                        message: '发布失败!',
                        type: 'alert'
                    });
                }
                this.refreshTable();
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    delete() {
        const ids = this.dataTable.getSelIds();
        DialogUtil.showDialog({
            message: i18n.$t('emes.confirmDelete'),
            type: 'confirm',
            callback: () => {
        $.ajax({
            url: '/mes/process/card/delete',
            type: 'post',
            dataType: 'json',
            data: {
                'processCardId': ids.toString()
            },
            success: (res) => {
                if (res.success) {
                    this.dataTable.delRowData(ids);
                    this.refreshTable();
                    DialogUtil.showDialog({
                        message: '删除成功!',
                        type: 'alert',
                        callback: (status) => {
                            console.log(123);
                        }
                    });
                }
                this.refreshTable();
            },
            error: function () {
                DialogUtil.showDialog({
                    message: '删除失败',
                    type: 'alert',
                    callback: (status) => {
                        console.log(123);
                    }
                });
            }
        });
            }
        });
    }


    // 修改
    modify() {
        const modalDom = $('#sys-main-mode-tabs');
        const employeeIds = $('select[name=employeeId]', modalDom).selectpicker('val');
        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        const dataArr = contentForm.serializeArray();
        const productName = $('input[name=productId]', modalDom).val();
        const procedureName = $('input[name=procedureId]', modalDom).val();
        const fileType = $('select[name=fileType]', modalDom).find('option:selected').text();
        var effectTime = $('input[name=effectTime]', modalDom).val();
        var failureTime = $('input[name=failureTime]', modalDom).val();
        effectTime = effectTime.replace("/-/g", "/");
        var effectTimes=new Date(effectTime).getTime();
        failureTime = failureTime.replace("/-/g", "/");
        var failureTimes = new Date(failureTime).getTime();
        if(effectTimes>failureTimes){
            DialogUtil.showDialog({
                message: '生效时间不能大于失效时间',
                type: 'alert'
            });
            return;
        }
        const processCard = {
            productName: productName,
            procedureName: procedureName,
            fileType: fileType
        };
        Object.keys(dataArr).forEach((key) => {
            const name = dataArr[key].name;
            const value = dataArr[key].value;
            processCard[name] = value;
        });

        $.ajax({
            url: '/mes/process/card/update',
            type: 'post',
            dataType: 'json',
            data: $.param(processCard) + `&listUserId=${employeeIds.toString()}`,
            success: (res) => {
                $('#sys-main-mode-tabs').modal('hide');
                if (res.success) {
                    DialogUtil.showDialog({
                        message: '修改成功',
                        type: 'alert',
                        callback: (status) => {
                            console.log(123);
                        }
                    });
                }
                if (res.msg == "file type selection error") {
                    DialogUtil.showDialog({
                        message: '文件类型选择错误!',
                        type: 'alert',
                        callback: (status) => {
                            console.log(123);
                        }
                    });
                }
                if (res.msg == "internalErr: update failed") {
                    DialogUtil.showDialog({
                        message: '修改失败!',
                        type: 'alert',
                        callback: (status) => {
                            console.log(123);
                        }
                    });
                }
                this.refreshTable();
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    // 刷新数据表格(查询或更新)
    refreshTable() {
        const formParam = $('.emes-search-form', this.pageDom).serialize();
        const data = {
            page: 1,
            pageSize: 10
        };
        $.ajax({
            url: '/mes/process/card/report/all',
            type: 'get',
            dataType: 'json',
            data: $.param(data) + `&${formParam}`,
            success: (res) => {
                this.dataTable.dataGrid(res.data);
            },
            error: () => {
                DialogUtil.showDialog({
                    message: '查询失败',
                    type: 'alert',
                    callback: (status) => {
                        console.log(123);
                    }
                });
            }
        });
    }

    // 刷新模态框
    refreshModal(data) {
        const modalContent = Handlebars.compile(i18n.$html(modalTpl));
        // Handllebars填充模板数据
        if (data == null || data == 'undefined') {
            $('#modalContent').html(modalContent({}));
        } else {
            $('#modalContent').html(modalContent(data));
        }
        $('#modalContent').initUI();

        // 更新产品,客户,区域的选择内容
        if (!this.searchData) {
            return;
        }

        const modalDom = $('#sys-main-mode-tabs');
        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        const optionTemplate = Handlebars.compile(template.optionTpl);
        const selectTemplate = Handlebars.compile(template.selectTpl);

        const  productIds=  $('input[select-name=productId]', "#modalContent").initFuzzySearch({
            type:50,
            selectbox: true,
            nameKey: 'productName',
            idKey: 'productId',
            selectCallback: (data) => {
                $('input[name=productName]', "#modalContent").val(data.productName);
            }
        });
        if(data){
            productIds.setValue(data.productName);
        }

       const procedureIds= $('input[select-name=procedureId]', "#modalContent").initFuzzySearch({
            type:51,
            selectbox: true,
            nameKey: 'procedureName',
            idKey: 'procedureId',
            selectCallback: (data) => {
                $('input[name=procedureName]', "#modalContent").val(data.procedureName);
            }
        });
        if(data){
            procedureIds.setValue(data.procedureName);
        }
        $.ajax({
            url: '/mes/process/card/data/insert',
            type: 'get',
            dataType: 'json',
            success: (res) => {
                $('select[name=employeeId]', modalDom).html(optionTemplate(res.data.employee));
                $('select[name=fileType]', modalDom).html(selectTemplate());
               /* $('select[name=productId]', modalDom).html(optionTemplate(res.data.products));
                $('select[name=procedureId]', modalDom).html(optionTemplate(this.searchData.listProcedure));*/
                // 设置产品名称默认值
                if (data) {
                    res.data.products.forEach(product => {
                        if (product.id == data.productId) {
                            $('select[name=productId]', modalDom).selectpicker('val', product.id);
                        }
                    });
                    this.searchData.listProcedure.forEach(procedure => {
                        if (procedure.id == data.procedureId) {
                            $('select[name=procedureId]', modalDom).selectpicker('val', procedure.id);
                        }
                    });
                    if (data.fileType == 0) {
                        $('select[name=fileType]', modalDom).selectpicker('val', 0);
                    } else {
                        $('select[name=fileType]', modalDom).selectpicker('val', 1);
                    }

                    const userName = data.listUser;
                    var array = userName.split(",");
                    $('select[name=employeeId]', modalDom).find("option").each(function (i) {
                        var text = $(this).text();
                        if (array.indexOf(text) >= 0) {
                            $(this).attr("selected", "selected");
                        }
                    });
                    $('input[item=effectTime]', contentForm)[0].value = data.effectTime;
                    $('input[item=failureTime]', contentForm)[0].value = data.failureTime;
                }
                // bootstrap-select表格refresh
                $('.selectpicker', modalDom).selectpicker('refresh');

            },
            error: () => {
                DialogUtil.showDialog({
                    message: '查询失败',
                    type: 'alert',
                    callback: (status) => {
                        console.log(123);
                    }
                });
            }
        });
    }


}

export default Page;
