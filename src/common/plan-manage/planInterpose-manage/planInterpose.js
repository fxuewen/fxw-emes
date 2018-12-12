import './page.css';
import pageTpl from './page.html';
import TableUtil from '../../../utils/table-util';
import i18n from '../../../i18n/i18n';
import UploadUtil from '../../../utils/upload-util';
import BasePage from '../../base-page';
import DialogUtil from '../../../utils/dialog-util';

class Page extends BasePage {

    constructor() {
        super(pageTpl);
        this.pageDom = null;
        this.workdayTable = null;
        this.workweekTable = null;
        this.uploader = null;
        //日计划
        this.workdayTableOptions = {
            options: {
                custom:{
                    pagerCallback: (page, pageSize) => {
                        this.refreshWorkdayTable(page, pageSize);
                    }
                }
            }
        };

        //周计划
        this.workweekTableOptions = {
            options: {
                custom:{
                    pagerCallback: (page, pageSize) => {
                        this.refreshWorkweekTable(page, pageSize);
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
        //模糊查询
        $('input[name=productName]',this.pageDom).initFuzzySearch({
            type: 45
        });
        $('input[name=clientName]', this.pageDom).initFuzzySearch({
            type: 12
        });
        $('input[name=code]',this.pageDom).initFuzzySearch({
            type: 34
        });

        // 生成日计划表单
        this.workdayTable = new TableUtil('emes-page-table-dayPlan','/mes/workday/report/workday/all', this.workdayTableOptions.options);
        this.refreshWorkdayTable();

        // 日计划带条件查询
        $('#dayDayGenerate .search-btn-group .search-query', this.pageDom).bind('click', () => {
            this.refreshWorkdayTable();
        });

        // 日计划导入(文件)按钮
        $('#dayDayGenerate .emes-btn-order-group .emes-btn-group-import', this.pageDom).bind('click', () => {
            const workdayUploader = new UploadUtil({
                server: '/mes/workday/batch/insert',
                success: (file, res) => {
                    if(res.success){
                        this.refreshWorkdayTable();
                    }else{
                        DialogUtil.showDialog({
                            message: res.msg,
                            type: 'alert',
                            delay: 5
                        });
                    }
                }
            });
            workdayUploader.showUploadModal();
        });

        // 周计划表单生成
        this.workweekTable = new TableUtil('emes-page-table-workorder',
            '/mes/workweek/report/workweek/all',this.workweekTableOptions.options);
        this.refreshWorkweekTable();

        // 周计划带条件查询
        $('#weekPlanConfig .search-btn-group .search-query', this.pageDom).bind('click', () => {
            this.refreshWorkweekTable();
        });
        // 周计划导入(文件)按钮
        $('#weekPlanConfig .emes-btn-order-group .emes-btn-group-import', this.pageDom).bind('click', () => {
            const workweekUploader = new UploadUtil({
                server: '/mes/workweek/bathc/insert',
                success:(file,res) => {
                    if(res.success){
                        this.refreshWorkdayTable();
                    }else{
                        DialogUtil.showDialog({
                            message: res.msg,
                            type: 'alert',
                            delay: 5
                        });
                    }
                }
            });
            workweekUploader.showUploadModal();
        });
    }

    //日计划表刷新
    refreshWorkdayTable(page, pageSize) {
        const formData = $('#dayDayGenerate .emes-search-form', this.pageDom).serialize();
        const data = {page: page || 1, pageSize: pageSize || 10};
        $.ajax({
            url: '/mes/workday/report/workday/all',
            type: 'get',
            dataType: 'json',
            data: formData + `&${$.param(data)}`,
            success: (res) => {
                this.workdayTable.dataGrid(res.data);
            },
            error: () => {
                console.error('查询失败');
            }
        });
    }

    // 周计划表刷新
    refreshWorkweekTable(page,pageSize) {
        const formData = $('#weekPlanConfig .emes-search-form', this.pageDom).serialize();
        const data = {page: page || 1, pageSize: pageSize || 10};
        $.ajax({
            url: '/mes/workweek/report/workweek/all',
            type: 'get',
            dataType: 'json',
            data: formData + `&${$.param(data)}`,
            success: (res) => {
                //this.workweekTable.dataGrid(res.data);
            },
            error: () => {
                console.error('查询失败');
            }
        });
    }
}

export default Page;
