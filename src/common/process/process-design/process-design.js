import './page.css';
import pageTpl from './page.html';
import modalTpl from './modal.html';
import BasePage from '../../base-page';
import TableUtil from '../../../utils/table-util';
import TreeGridUtil from '../../../utils/tree-grid-util';
import procedureModalTpl from './modal-procedure.html';
import DialogUtil from '../../../utils/dialog-util';
import i18n from '../../../i18n/i18n';
class Page extends BasePage {
    constructor() {
        super(pageTpl);
        this.pageDom = null;
        this.tree = null;
        this.processTable = null;
        this.procedureTable = null;
        // 树形结构回调事件
        this.treeSetting = {
            callback: {
                onClick: (event, treeId, treeNode) => {
                    // 树形结构中点击为精确选择,点击后清空搜索框内容
                    $('.search-btn-group .search-reset', this.pageDom).click();
                    this.clickItem(treeNode.productId);
                }
            },
            data: {
                key: {
                    name: 'productName',
                },
                simpleData: {
                    enable: true,
                    idKey: 'productId',
                    pIdKey: 'parentId',
                }
            }
        };

        // 工艺表格参数
        this.processTableSetting = {
            // 自定义参数
            custom: {
                singleSelect: true
            },
            onSelectRow: (rowid, status) => {
                this.showProcedure(rowid, status);
            }
        };
        // 工序表格参数
        this.procedureTableSetting = {
            // 自定义参数
            custom: {
                singleSelect: true
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

        this.tree = new TreeGridUtil($('.emes-page-tree', this.pageDom), this.treeSetting);
        this.processTable = new TableUtil(
            'emes-page-table-process-design',
            '/mes/process/list/report/all',
            this.processTableSetting
        );
        this.procedureTable = new TableUtil(
            'emes-page-table-process-design-list',
            '/mes/process/procedure/all',
            this.procedureTableSetting
        );

        // 树结构初始化
        $.ajax({
            type: 'GET',
            url: 'mes/product/tree',
            dataType: 'json',
            success: (data) => {
                // 创建树形表格
                this.tree.initTree(data.data);
            }
        });

        // 查询
        $('.search-query', this.pageDom).bind('click', () => {
            this.searchNodesByParamFuzzy();
        });

        // 添加
        $('.btn-group-add', this.pageDom).bind('click', () => {
            $('.emes-modal-title label').html('添加工艺');
            $('.emes-modal-title .emes-modal-uploadphoto').html('');
            this.refreshModal();
            $('#sys-main-mode-tabs').initUI();
            $('#sys-main-mode-tabs').modal('show');
            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    this.add();
                }
            });
        });

        // 删除
        $('.btn-group-delete', this.pageDom).bind('click', () => {
            this.delete();
        });

        // 修改
        $('.btn-group-modify', this.pageDom).bind('click', () => {
            const selIds = this.processTable.getSelIds();
            if (selIds.length === 0) {
                DialogUtil.showDialog({
                    message: '请选择修改行!',
                    type: 'alert'
                });
                return;
            } else if (selIds.length > 1) {
                DialogUtil.showDialog({
                    message: '只可修改一条记录!',
                    type: 'alert'
                });
                return;
            }

            const id = selIds[0];
            const rowData = this.processTable.getRowData(id);
            $('.emes-modal-title label').html('修改工艺');
            $('.emes-modal-title .emes-modal-uploadphoto').html('');
            this.refreshModal(rowData);
            $('#sys-main-mode-tabs').modal('show');
            // 将保存按钮的事件处理改为修改
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    this.modify();
                }
            });
        });

        // 加入知识库
        $('.btn-group-add-knowledge', this.pageDom).bind('click', () => {
            this.addToKnowledge();
        });

        // 绑定工序表格操作事件
        this.bindprocedureEvent();
    }

    // 树形菜单点击
    clickItem(id) {
        const selectNodes = this.tree.ztree.getSelectedNodes();
        if (selectNodes.length === 1) {
            $('.emes-table-breadcrumb-product .emes-table-breadcrumb-type').text(selectNodes[0].productName);
        }

        $.ajax({
            type: 'GET',
            url: '/mes/process/list/report/all',
            dataType: 'json',
            data: {
                page: 1,
                pageSize: 10,
                productId: parseInt(id)
            },
            success: (res) => {
                this.processTable.dataGrid(res.data);
                this.showProcedure();
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    // 添加工艺
    add() {
        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        const formParam = contentForm.serialize();
        const selectNodes = this.tree.ztree.getSelectedNodes();
        if (selectNodes.length === 0) {
            return;
        }
        const productId = selectNodes[0].productId;
        $.ajax({
            url: '/mes/process/insert',
            type: 'post',
            dataType: 'json',
            data: formParam + `&productId=${productId}`,
            success: (data) => {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '新增工艺成功!',
                        type: 'alert'
                    });
                    $('#sys-main-mode-tabs').modal('hide');
                    this.clickItem(productId);
                }
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    // 删除工艺
    delete() {
        const ids = this.processTable.getSelIds();
        if (ids.length == 0) {
            DialogUtil.showDialog({
                message: '请选择要删除的数据!',
                type: 'alert'
            });
            return;
        } else if (ids.length > 1) {
            DialogUtil.showDialog({
                message: '只能删除一条记录',
                type: 'alert'
            });
            return;
        }

        const selectNodes = this.tree.ztree.getSelectedNodes();
        if (selectNodes.length === 0) {
            return;
        }
        const productId = selectNodes[0].productId;
        DialogUtil.showDialog({
            message: i18n.$t('emes.confirmDelete'),
            type: 'confirm',
            callback: () => {
        $.ajax({
            url: '/mes/process/delete',
            type: 'post',
            dataType: 'json',
            data: {
                processId: ids[0],
                productId: productId
            },
            success: (data) => {
                if (data.success) {
                    this.processTable.delRowData(ids);
                    DialogUtil.showDialog({
                        message: '删除成功!',
                        type: 'alert',
                        callback: (status) => {
                            console.log(123);
                        }
                    });
                    this.showProcedure();
                }
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
            }
        });
    }

    // 修改工艺
    modify() {
        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        const formParam = contentForm.serialize();
        const selectNodes = this.tree.ztree.getSelectedNodes();
        if (selectNodes.length === 0) {
            return;
        }
        const productId = selectNodes[0].productId;
        $.ajax({
            url: '/mes/process/update',
            type: 'post',
            dataType: 'json',
            data: formParam + `&productId=${productId}` + `&id=${this.processTable.getSelIds()[0]}`,
            success: (data) => {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '修改工艺成功',
                        type: 'alert',
                        callback: (status) => {
                            console.log(123);
                        }
                    });
                    $('#sys-main-mode-tabs').modal('hide');
                    this.clickItem(productId);
                }
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    // 加入知识库
    addToKnowledge() {
        const selIds = this.processTable.getSelIds();
        if (selIds.length === 0) {
            DialogUtil.showDialog({
                message: '请选择一条记录',
                type: 'alert',
                callback: (status) => {
                    console.log(123);
                }
            });
            return;
        }

        const selectNodes = this.tree.ztree.getSelectedNodes();
        if (selectNodes.length === 0) {
            return;
        }
        const productId = selectNodes[0].productId;

        $.ajax({
            url: '/mes/process/add/repository',
            type: 'post',
            dataType: 'json',
            data: {
                id: selIds[0]
            },
            success: (data) => {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '添加成功',
                        type: 'alert',
                        callback: (status) => {
                            console.log(123);
                        }
                    });
                    this.clickItem(productId);
                }
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    // 刷新模态框
    refreshModal(data) {
        const modalContent = Handlebars.compile(this.i18n.$html(modalTpl));
        // Handllebars填充模板数据
        if (data == null || data == 'undefined') {
            $('#modalContent').html(modalContent());
        } else {
            $('#modalContent').html(modalContent(data));
        }
        $('#modalContent').initUI();

        if (data) {
            $('select[name=isLibrary]', modalContent).selectpicker('val', data.isLibrary);
        }
    }

    // 模糊查询节点
    searchNodesByParamFuzzy() {
        // 获取模糊匹配内容
        const treeObj = this.tree.ztree;
        const key = 'productName';
        let value = $('.emes-search-form input[name=productName]', this.pageDom).val();
        value = $.trim(value);
        if (!value) {
            return;
        }

        const results = treeObj.getNodesByParamFuzzy(key, value, null);
        // 展示results[0]的内容
        if (results.length === 0) {
            DialogUtil.showDialog({
                message: '无匹配项',
                type: 'alert',
                callback: (status) => {
                    console.log(123);
                }
            });
        } else {
            this.tree.ztree.expandAll(false);
            results.forEach(node => {
                this.tree.ztree.expandNode(node, true);
                // 展开选中节点
                treeObj.expandNode(node, true, true, true);
                const parentNode = node.getParentNode();
                if (parentNode) {
                    treeObj.expandNode(parentNode, true, true, true);
                }
                // 选中节点
                treeObj.selectNode(node, true);
            });
            this.clickItem(results[0].productId);
        }
    }

    // 展示工序
    showProcedure() {
        const selIds = this.processTable.getSelIds();
        if (selIds.length > 0) {
            $('.emes-page-process-design-procedure').removeClass('hidden');
        } else {
            $('.emes-page-process-design-procedure').addClass('hidden');
            return;
        }

        $.ajax({
            type: 'GET',
            url: '/mes/process/procedure/report/all',
            dataType: 'json',
            data: {
                page: 1,
                pageSize: 10,
                processId: parseInt(selIds[0])
            },
            success: (res) => {
                this.procedureTable.dataGrid(res.data);
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    // 工序按钮事件
    bindprocedureEvent() {
        // 工序添加
        $('.btn-group-add-procedure', this.pageDom).bind('click', () => {
            $('.emes-modal-title label').html('添加工序');
            this.showProcedureModal();
            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs .emes-modal-content-form')[1].getAttribute('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    this.addProcedure();
                }

            });
        });

        // 工序删除
        $('.btn-group-delete-procedure', this.pageDom).bind('click', () => {
            this.deleteProcedure();
        });

        // 工序修改
        $('.btn-group-modify-procedure', this.pageDom).bind('click', () => {
            $('.emes-modal-title label').html('添加工序');
            const procedureIds = this.procedureTable.getSelIds();
            if (procedureIds.length == 0) {
                DialogUtil.showDialog({
                    message: '请选择一条记录',
                    type: 'alert',
                    callback: (status) => {
                        console.log(123);
                    }
                });
                return;
            } else if (procedureIds.length > 1) {
                DialogUtil.showDialog({
                    message: '只能修改一条记录',
                    type: 'alert',
                    callback: (status) => {
                        console.log(123);
                    }
                });
                return;
            }

            const procedure = this.procedureTable.getRowData(procedureIds[0]);
            this.showProcedureModal(procedure);
            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                alert($('#sys-main-mode-tabs').find('form').attr('submitdisable'));
                const submitdisableFlag = $('#sys-main-mode-tabs .emes-modal-content-form')[1].getAttribute('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    this.modifyProcedure();
                }
            });
        });

        // 工序上移
        $('.btn-group-up', this.pageDom).bind('click', () => {
            this.procedureOrder(0);
        });

        // 工序下移
        $('.btn-group-down', this.pageDom).bind('click', () => {
            this.procedureOrder(1);
        });
    }

    // 显示工序模态框
    showProcedureModal(data) {
        $('.emes-modal-title .emes-modal-uploadphoto').html('');
        $('#modalContent').html(this.i18n.$html(procedureModalTpl));
        $('#modalContent').initUI();
        $('#sys-main-mode-tabs').modal('show');
        if(data){
            $('input[select-name=procedureId]', "#modalContent").val(data.name);
            $('input[select-name=equipmentId]', "#modalContent").val(data.equipmentName);
            $('input[name=code]', "#modalContent").val(data.code);
            $('input[name=time]', "#modalContent").val(data.time);
        }
       const equipmentIds=$('input[select-name=equipmentId]', "#modalContent").initFuzzySearch({
            type:53,
            selectbox: true,
            nameKey: 'equipmentName',
            idKey: 'equipmentId',
            selectCallback: (data) => {

            }
        });
        if(data){
            equipmentIds.setValue(data.equipmentName);
        }
      const  procedureIds=$('input[select-name=procedureId]', "#modalContent").initFuzzySearch({
            type:51,
            selectbox: true,
            nameKey: 'procedureName',
            idKey: 'procedureId',
            selectCallback: (data) => {
                $('input[name=code]', "#modalContent").val(data.code);
            }
        });
        if(data){
            procedureIds.setValue(data.name);
        }
    }

    // 添加工序
    addProcedure() {
        const selIds = this.processTable.getSelIds();
        if (selIds.length === 0) {
            return;
        }
        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        const dataArr = contentForm.serializeArray();
        const processId = selIds[0];
        const processFlow = {
            processId: processId
        };
        Object.keys(dataArr).forEach((key) => {
            const name = dataArr[key].name;
            const value = dataArr[key].value;
            processFlow[name] = value;
        });

        const processFlowList = [processFlow];
        const useProcedureModa = $('select[name=useProcedureModa]', $('#modalContent')).selectpicker('val');
        $.ajax({
            url: '/mes/process/insert/procedure',
            type: 'post',
            dataType: 'json',
            data: {
                processFlowList: JSON.stringify(processFlowList),
                useProcedureModa: useProcedureModa
            },
            success: (data) => {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '新增工艺成功',
                        type: 'alert',
                        callback: (status) => {
                            console.log(123);
                        }
                    });
                    $('#sys-main-mode-tabs').modal('hide');
                    this.showProcedure();
                }
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    // 删除工序
    deleteProcedure() {
        const ids = this.procedureTable.getSelIds();
        if (ids.length == 0) {
            DialogUtil.showDialog({
                message: '请选择要删除的数据',
                type: 'alert',
                callback: (status) => {
                    console.log(123);
                }
            });
        }else {
            const selectNodes = this.tree.ztree.getSelectedNodes();
            if (selectNodes.length === 0) {
                return;
            }
            const productId = selectNodes[0].productId;
            DialogUtil.showDialog({
                message: i18n.$t('emes.confirmDelete'),
                type: 'confirm',
                callback: () => {
            $.ajax({
                url: '/mes/process/delete/procedure',
                type: 'post',
                dataType: 'json',
                data: {
                    procedureIdList: ids.toString(),
                    productId: productId
                },
                success: (data) => {
                    if (data.success) {
                        DialogUtil.showDialog({
                            message: '删除成功!',
                            type: 'alert',
                            callback: (status) => {
                                console.log(123);
                            }
                        });
                        this.showProcedure();
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

    // 修改工序
    modifyProcedure() {
        const selectNodes = this.tree.ztree.getSelectedNodes();
        if (selectNodes.length === 0) {
            return;
        }
        const productId = selectNodes[0].productId;
        const procedureId = this.procedureTable.getSelIds()[0];
        const procedure = this.procedureTable.getRowData(procedureId);

        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        const dataArr = contentForm.serializeArray();
        const processFlow = {
            id: this.procedureTable.getSelIds()[0],
            order: procedure.order,
            processId: this.processTable.getSelIds()[0]
        };
        Object.keys(dataArr).forEach((key) => {
            const name = dataArr[key].name;
            const value = dataArr[key].value;
            processFlow[name] = value;
        });
        const processFlowList = [processFlow];
        $.ajax({
            url: '/mes/process/update/procedure',
            type: 'post',
            dataType: 'json',
            data: {
                processFlowList: JSON.stringify(processFlowList),
                productId: productId
            },
            success: (data) => {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '修改成功',
                        type: 'alert',
                        callback: (status) => {
                            console.log(123);
                        }
                    });
                    $('#sys-main-mode-tabs').modal('hide');
                    this.showProcedure();
                }
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    /**
     * 工序排序
     * @param {*} move 0上移，1下移
     */
    procedureOrder(move) {
        const processIds = this.processTable.getSelIds();
        const procedureIds = this.procedureTable.getSelIds();
        if (procedureIds.length === 0) {
            DialogUtil.showDialog({
                message: '请选择一条记录',
                type: 'alert',
                callback: (status) => {
                    console.log(123);
                }
            });
            return;
        }

        $.ajax({
            url: '/mes/process/process/order',
            type: 'post',
            dataType: 'json',
            data: {
                id: procedureIds[0],
                processId: processIds[0],
                move: move
            },
            success: (data) => {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '操作成功',
                        type: 'alert',
                        callback: (status) => {
                            console.log(123);
                        }
                    });
                    this.showProcedure();
                }
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }
}

export default Page;
