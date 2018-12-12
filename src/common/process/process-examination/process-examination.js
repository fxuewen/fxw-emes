import pageTpl from './page.html';
import BasePage from '../../base-page';
import TableUtil from '../../../utils/table-util';
import template from './template';
import DialogUtil from '../../../utils/dialog-util';

class Page extends BasePage {
    constructor() {
        super(pageTpl);
        this.pageDom = null;
        this.processTable = null;
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
                            return '审批失败';
                        default:
                            return '';
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
                        case '审批失败':
                            return 4;
                        default:
                            return '';
                        }
                    }
                },
                pagerCallback: (page, pageSize) => {
                    this.searchProcessExamination(page, pageSize);
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
        $('input[name=version]', this.pageDom).initFuzzySearch({
            type: 31
        });
        $('input[name=diEid]', this.pageDom).initFuzzySearch({
            type: 32
        });


        this.processTable = new TableUtil('emes-page-table-process-examination',
            '/mes/process/examine/report/all', this.tableOptions);

        this.searchProcessExamination();

        // 查询
        $('.search-query', this.pageDom).bind('click', () => {
            this.searchProcessExamination();
        });

        // 同意
        $('.emes-btn-group-agree', this.pageDom).bind('click', () => {
            this.examinationApproval();
        });

        // 发布
        $('.emes-btn-group-release', this.pageDom).bind('click', () => {
            this.examinationRelease();
        });

        // 退回
        $('.emes-btn-group-back', this.pageDom).bind('click', () => {
            this.examinationFailure();
        });
    }

    searchProcessExamination(page, pageSize) {
        const formData = $('.emes-search-form', this.pageDom).serialize();
        const data = {
            page: page || 1,
            pageSize: pageSize || 10
        };
        $.ajax({
            url: 'mes/process/examine/report/all',
            type: 'get',
            dataType: 'json',
            data: formData + `&${$.param(data)}`,
            success: (res) => {
                this.processTable.dataGrid(res.data);
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    // 同意按钮
    examinationApproval() {
        const selIds = this.processTable.getSelIds();
        if (selIds.length === 0) {
            DialogUtil.showDialog({
                message: '请选择需要审批的数据',
                type: 'alert',
                callback: (status) => {
                    console.log(123);
                }
            });
            return;
        }
        const processCardList = new Array;
        selIds.forEach((id) => {
            const rowData = this.processTable.getRowData(id);
            processCardList.push(rowData);
        });

        $.ajax({
            url: 'mes/process/examine/consent',
            type: 'post',
            dataType: 'json',
            data: {
                'processCardList': JSON.stringify(processCardList)
            },
            success: (res) => {
                if (res.code != '200') {
                    DialogUtil.showDialog({
                        message: '审批失败',
                        type: 'alert',
                        callback: (status) => {
                            console.log(123);
                        }
                    });
                } else {
                    this.processTable.dataGrid(res.data);
                    this.searchProcessExamination();
                }

            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    // 发布按钮
    examinationRelease() {
        const selIds = this.processTable.getSelIds();
        if (selIds.length === 0) {
            DialogUtil.showDialog({
                message: '请选择需要发布的数据',
                type: 'alert',
                callback: (status) => {
                    console.log(123);
                }
            });
            return;
        }

        const processCardList = new Array;
        selIds.forEach((id) => {
            const rowData = this.processTable.getRowData(id);
            processCardList.push(rowData);
        });

        $.ajax({
            url: 'mes/process/examine/release',
            type: 'post',
            dataType: 'json',
            data: {
                'processCardList': JSON.stringify(processCardList)
            },
            success: (res) => {
                if (res.code != '200') {
                    DialogUtil.showDialog({
                        message: '发布失败',
                        type: 'alert',
                        callback: (status) => {
                            console.log(123);
                        }
                    });
                } else {
                    this.processTable.dataGrid(res.data);
                    this.searchProcessExamination();
                }
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    // 退回按钮
    examinationFailure() {
        const selIds = this.processTable.getSelIds();
        if (selIds.length === 0) {
            DialogUtil.showDialog({
                message: '请选择需要退回的数据',
                type: 'alert',
                callback: (status) => {
                    console.log(123);
                }
            });
            return;
        }

        const processCardList = new Array;
        selIds.forEach((id) => {
            const rowData = this.processTable.getRowData(id);
            processCardList.push(rowData);
        });

        $.ajax({
            url: 'mes/process/examine/returned',
            type: 'post',
            dataType: 'json',
            data: {
                'processCardList': JSON.stringify(processCardList)
            },
            success: (res) => {
                if (res.code != '200') {
                    DialogUtil.showDialog({
                        message: '审批失败',
                        type: 'alert',
                        callback: (status) => {
                            console.log(123);
                        }
                    });
                } else {
                    this.processTable.dataGrid(res.data);
                    this.searchProcessExamination();
                }
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }
}

export default Page;
