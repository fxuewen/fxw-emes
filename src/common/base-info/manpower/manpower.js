import './page.css';
import pageTpl from './page.html';
import modalTpl from './modal.html';
import updateModalTpl from './manpower-modal.html';
import TableUtil from '../../../utils/table-util';
import i18n from '../../../i18n/i18n';
import UploadUtil from '../../../utils/upload-util';
import BasePage from '../../base-page';
import ValidatorUtil from '../../../utils/validator-util';
import DialogUtil from '../../../utils/dialog-util';
import template from './template';

class Page extends BasePage {

    constructor() {
        super(pageTpl);
        this.pageDom = null;
        this.dataTable = null;
        this.uploader = null;
        this.tableOptions = {
            options: {
                custom: {
                    formatter: {
                        // 性别
                        sex: (colValue) => {
                            if (colValue === 1) {
                                return '男';
                            } else {
                                return '女';
                            }
                        },
                        // 班次
                        shift: (colValue) => {
                            if (colValue === 1) {
                                return '白班';
                            } else {
                                return '晚班';
                            }
                        },
                        // 人员添加<a>标签
                        number: (colValue, rowObject) => {
                            const id = rowObject.rowId;
                            return `<a class="emes-a" href="#" item="${id}">${colValue}</a>`;
                        }
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
        // 表填充
        this.dataTable = new TableUtil('emes-page-table-manpower',
            'mes/employee/report/all', this.tableOptions.options);
        // 文件上传
        this.uploader = new UploadUtil({
            formData: {
                encrypted: 0 // 是否加密
            },
            success: (file, res) => {
                $('.fancybox-image', $('.emes-modal-content')).attr('src', res.data.path);
                $('.emes-pic-uuid', $('.emes-modal-content')).val(res.data.uuid);
            }
        });

        // 生成数据表格
        this.refreshTable();
        // 查询
        $('.search-btn-group .search-query', this.pageDom).bind('click', () => {
            this.refreshTable();
        });

        // 模糊查询
        $('input[name=name]', this.pageDom).initFuzzySearch({
            type: 1
        });
        $('input[name=departmentName]', this.pageDom).initFuzzySearch({
            type: 2
        });
        $('input[name=number]', this.pageDom).initFuzzySearch({
            type: 3
        });

        // 添加
        $('.btn-group-add', this.pageDom).bind('click', () => {
            $('.emes-modal-title label').html('添加人力信息');
            $('.emes-modal-title .emes-modal-uploadphoto').html('上传头像').bind('click', () => {
                // 显示上传模态框
                this.uploader.showUploadModal();
            });
            this.refreshModal();
            // 填充设备选择框
            const modalDom = $('#sys-main-mode-tabs');
            const optionTemplate = Handlebars.compile(template.optionDepTpl);
            const optionTempJobTpl = Handlebars.compile(template.optionJobTpl);
            $.ajax({
                url: '/mes/job/report/all',
                type: 'get',
                dataType: 'json',
                success: (res) => {
                    $('select[item=jobId]', modalDom).html(optionTempJobTpl(res.data.list));
                    $('.selectpicker', $('#sys-main-mode-tabs')).selectpicker('refresh');
                },
                error: (res) => {
                    console.error(res.responseText);
                }
            });
            $.ajax({
                url: '/mes/department/all',
                type: 'get',
                dataType: 'json',
                success: (res) => {
                    $('select[item=departmentId]', modalDom).html(optionTemplate(res.data));
                    $('.selectpicker', $('#sys-main-mode-tabs')).selectpicker('refresh');
                },
                error: (res) => {
                    console.error(res.responseText);
                }
            });

            $.ajax({
                url: '/mes/factory/report/query',
                type: 'get',
                dataType: 'json',
                success: (res) => {
                    $('select[item=factoryId]', modalDom).html(optionTemplate(res.data.list));
                    $('.selectpicker', $('#sys-main-mode-tabs')).selectpicker('refresh');
                },
                error: (res) => {
                    console.error(res.responseText);
                }
            });

            $('input[select-name=jobId]', $('#sys-main-mode-tabs')).initFuzzySearch({
                type: 62,
                selectbox: true,
                nameKey: 'name_i18n',
                idKey: 'id',
                // 选择事件
                selectCallback: (data) => {
                    $('input[name="jobId"]', $('#sys-main-mode-tabs')).val(data.id);
                }
            });

            $('.em-user-set').css('display', 'block');
            $('#sys-main-mode-tabs').modal('show');
            $('#sys-main-mode-tabs').initUI();
            const validatorUtil = new ValidatorUtil('em-submit-form', false);
            validatorUtil.initValidator();
            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    this.add();
                }
            });

            $('#sys-main-mode-tabs').on('hide.bs.modal', function () {
                $('#sys-main-mode-tabs').find('.emes-modal-uploadphoto').text('');
            });
            this.judgeProjectName();
        });

        // 修改
        $('.btn-group-modify', this.pageDom).bind('click', () => {
            const selIds = this.dataTable.getSelIds();
            const rowId = selIds[0];
            const rowData = this.dataTable.getRowData(rowId);
            this.refreshModal(rowData);
            if (selIds.length === 0) {
                DialogUtil.showDialog({
                    message: '请选择修改行!',
                    type: 'alert',
                    delay: 5
                });
                return;
            } else if (selIds.length > 1) {
                DialogUtil.showDialog({
                    message: '只可修改一条记录!',
                    type: 'alert',
                    delay: 5
                });
                return;
            }
            const id = selIds[0];
            $('.emes-modal-title label').html('修改人力信息');
            $('.emes-modal-title .emes-modal-uploadphoto').html('上传头像').bind('click', () => {
                // 显示上传模态框
                this.uploader.showUploadModal();
            });
            $.ajax({
                url: '/mes/employee/detail',
                type: 'get',
                dataType: 'json',
                data: {
                    'id': id
                },
                success: (res) => {
                    this.refreshModal(res.data);
                    $('#sys-main-mode-tabs').modal('show');
                    $('#sys-main-mode-tabs').initUI();
                    const validatorUtil = new ValidatorUtil('em-submit-form', false);
                    validatorUtil.initValidator();
                    // 将保存按钮的事件处理改为添加
                    $('.emes-modal-save').unbind('click').bind('click', () => {
                        $('#sys-main-mode-tabs').find('form').trigger('validate');
                        const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                        if (!submitdisableFlag) {
                            this.modify();
                        }
                    });
                },
                error: () => {
                    DialogUtil.showDialog({
                        message: '查询失败!',
                        type: 'alert',
                        delay: 5
                    });
                }
            });
        });

        // a标签点击事件
        $('#emes-page-table-manpower', this.pageDom).on('click', 'a', (event) => {
            const id = $(event.target).attr('item');
            $('.emes-modal-title label').html('修改人力信息');
            $('.emes-modal-title .emes-modal-uploadphoto').html('上传头像').bind('click', () => {
                // 显示上传模态框
                this.uploader.showUploadModal();
            });
            $('.em-user-set').css('display', 'none');
            // 将保存按钮的事件处理改为修改
            $('.emes-modal-save').unbind('click').bind('click', () => {
                this.modify();
            });
            $.ajax({
                url: '/mes/employee/detail',
                type: 'get',
                dataType: 'json',
                data: {
                    'id': id
                },
                success: (res) => {
                    this.refreshModal(res.data);
                    $('#sys-main-mode-tabs').modal('show');
                    $('#sys-main-mode-tabs').initUI();
                    const validatorUtil = new ValidatorUtil('em-submit-form', false);
                    validatorUtil.initValidator();
                    // 将保存按钮的事件处理改为添加
                    $('.emes-modal-save').unbind('click').bind('click', () => {
                        $('#sys-main-mode-tabs').find('form').trigger('validate');
                        const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                        if (!submitdisableFlag) {
                            this.modify();
                        }
                    });
                },
                error: (res) => {
                    DialogUtil.showDialog({
                        message: '查询失败!',
                        type: 'alert',
                        delay: 5
                    });
                }
            });
        });

        // 刪除
        $('.btn-group-delete', this.pageDom).bind('click', () => {
            this.del();
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
            url: '/mes/employee/report/all',
            type: 'get',
            dataType: 'json',
            data: $.param(data) + `&${formParam}`,
            success: (res) => {
                this.dataTable.dataGrid(res.data);
            },
            error: (res) => {
                DialogUtil.showDialog({
                    message: '查询失败!',
                    type: 'alert',
                    delay: 5
                });
            }
        });
    }

    judgeProjectName(){
        const modalDom = $('#sys-main-mode-tabs');
        $('input[name=name]', '.emes-modal-content').blur(function(){
            const emloyeeName = $('input[name=name]', '#modalForm').val();
            $('input[name=name]', modalDom).attr('value',emloyeeName);
        });
        $('input[name=number]', '.emes-modal-content').blur(function(){
            const emloyeeNumber = $('input[name=number]', '#modalForm').val();
            $('input[name=number]', modalDom).attr('value',emloyeeNumber);
        });
    }
    // 刷新模态框
    refreshModal(data) {
        if (data == null || data == 'undefined') {
            const modalContent = Handlebars.compile(i18n.$html(modalTpl));
            // Handllebars填充模板数据
            $('#modalContent').html(modalContent({}));
        } else {
            const modalContent = Handlebars.compile(i18n.$html(updateModalTpl));
            $('#modalContent').html(modalContent(data));
            const modalDom = $('#sys-main-mode-tabs');
            const optionTemplate = Handlebars.compile(template.optionDepTpl);
            const optionTempJobTpl = Handlebars.compile(template.optionJobTpl);
            $.ajax({
                url: '/mes/department/all',
                type: 'get',
                dataType: 'json',
                success: (res) => {
                    $('select[item=departmentId]', modalDom).html(optionTemplate(res.data));
                    $('.selectpicker', $('#sys-main-mode-tabs')).selectpicker('refresh');
                    if (res != null) {
                        res.data.forEach(element => {
                            if (data.departmentName == element.name) {
                                $('select[name=departmentId]', modalDom).selectpicker('val', element.id);
                            }
                        });
                    }
                },
                error: (res) => {
                    console.error(res.responseText);
                }
            });

            $.ajax({
                url: '/mes/factory/report/query',
                type: 'get',
                dataType: 'json',
                success: (res) => {
                    $('select[item=factoryId]', modalDom).html(optionTemplate(res.data.list));
                    $('.selectpicker', $('#sys-main-mode-tabs')).selectpicker('refresh');
                    // if (res.data != null) {
                    //     res.data.list.forEach(element => {
                    //         if (data.factoryName == element.name) {
                    //             $('select[name=factoryId]', modalDom).selectpicker('val', element.id);
                    //         }
                    //     });
                    // }
                },
                error: (res) => {
                    console.error(res.responseText);
                }
            });

            $.ajax({
                url: '/mes/job/report/all',
                type: 'get',
                dataType: 'json',
                success: (res) => {
                    $('select[item=jobId]', modalDom).html(optionTempJobTpl(res.data.list));
                    $('.selectpicker', $('#sys-main-mode-tabs')).selectpicker('refresh');
                    if (res != null) {
                        res.data.list.forEach(element => {
                            if (data.jobName == element.nameI18n) {
                                $('select[name=jobId]', modalDom).selectpicker('val', element.id);
                            }
                        });
                    }
                },
                error: (res) => {
                    console.error(res.responseText);
                }
            });
        }
    }

    // 向后台添加
    add() {
        const datas = $('#modalForm').serialize();
        $.ajax({
            url: '/mes/employee/insert',
            type: 'post',
            dataType: 'json',
            data: datas,
            success: (data) => {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '新增成功!',
                        type: 'alert',
                        delay: 5
                    });
                    $('#sys-main-mode-tabs').modal('hide');
                    this.refreshTable();
                } else {
                    DialogUtil.showDialog({
                        message: data.msg,
                        type: 'alert',
                        delay: 5
                    });
                }
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    // 修改
    modify() {
        $.ajax({
            url: '/mes/employee/update',
            type: 'post',
            dataType: 'json',
            data: $('#modalForm').serialize(),
            success: (res) => {
                if (res.success) {
                    DialogUtil.showDialog({
                        message: '修改成功',
                        type: 'alert',
                        delay: 5
                    });
                    $('#sys-main-mode-tabs').modal('hide');
                    this.refreshTable();
                } else {
                    DialogUtil.showDialog({
                        message: res.msg,
                        type: 'alert',
                        delay: 5
                    });
                }
            },
            error: (res) => {
                DialogUtil.showDialog({
                    message: res.easyFileIndex,
                    type: 'alert',
                    delay: 5
                });
            }
        });
    }

    // 删除
    del() {
        const ids = this.dataTable.getSelIds();

        if (ids.length == 0) {
            DialogUtil.showDialog({
                message: '请选择要删除的数据!',
                type: 'alert',
                delay: 5
            });
        } else {
            DialogUtil.showDialog({
                message: i18n.$t('emes.confirmDelete'),
                type: 'confirm',
                callback: () => {
                    $.ajax({
                        url: '/mes/employee/delete',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            'ids': ids
                        },
                        success: (data) => {
                            if (data.success) {
                                this.dataTable.delRowData(ids);
                                this.refreshTable();
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
}

export default Page;
