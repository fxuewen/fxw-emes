import './page.css';
import pageTpl from './page.html';
import modalTpl from './modal.html';
import TableUtil from '../../../utils/table-util';
import TreeGridUtil from '../../../utils/tree-grid-util';
import template from './template';
import i18n from '../../../i18n/i18n';
import BasePage from '../../base-page';
import ValidatorUtil from '../../../utils/validator-util';
import DialogUtil from '../../../utils/dialog-util';

class Page extends BasePage {
    constructor() {
        super(pageTpl);
        this.pageDom = null;
        this.tree = null;
        this.dataTable = null;
        this.searchData = null;
        // 树形结构回调事件
        this.treeSetting = {
            callback: {
                onClick: (event, treeId, treeNode) => {
                    // 树形结构中点击为精确选择,点击后清空搜索框内容
                    $('.search-btn-group .search-reset', this.pageDom).click();
                    this.clickItem([treeNode.productId]);
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
        this.tableOptions = {
            options: {
                custom: {
                    formatter: {
                        // 性别
                        rohsFlag: (colValue) => {
                            if (colValue === 1) {
                                return 'Y';
                            } else if(colValue === 2){
                                return 'N';
                            } else{
                                return colValue;
                            }
                        }
                    },
                    unformat: {
                        rohsFlag: (cellValue) => {
                            switch (cellValue) {
                            case 'Y':
                                return 1;
                            case 'N':
                                return 2;
                            default:
                                return ' ';
                            }
                        }
                    },
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
        this.dataTable = new TableUtil('emes-page-table-product-manage', '/mes/product/report/query',this.tableOptions.options);
        this.tree = new TreeGridUtil($('.emes-page-tree', this.pageDom), this.treeSetting);
        // 树结构初始化
        $.ajax({
            type: 'GET',
            url: 'mes/product/tree',
            dataType: 'json',
            success: (res) => {
                // 创建树形表格
                this.tree.initTree(res.data);
            }
        });

        // 获取选择框内容
        $.ajax({
            type: 'GET',
            url: 'mes/product/search/data',
            dataType: 'json',
            success: (res) => {
                this.searchData = res.data;
                const optionTemplate = Handlebars.compile(template.optionTpl);
                $('select[name=productName]', this.pageDom).html(optionTemplate(res.data.productList));
                $('select[name=clientName]', this.pageDom).html(optionTemplate(res.data.clientList));
                $('select[name=areaName]', this.pageDom).html(optionTemplate(res.data.areaList));
                // bootstrap-select表格refresh
                $('.selectpicker', this.pageDom).selectpicker('refresh');
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });

        // 查询
        $('.search-query', this.pageDom).bind('click', () => {
            this.searchNodesByParamFuzzy();
        });

        // 添加
        $('.btn-group-add', this.pageDom).bind('click', () => {
            $('.emes-modal-title label').html('添加产品');
            $('.emes-modal-title .emes-modal-uploadphoto').html('');
            this.refreshModal();
            $('.em-user-set').css('display', 'block');
            $('#sys-main-mode-tabs').modal('show');
            $('#sys-main-mode-tabs').initUI();
            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    this.add();
                }
            });
            const contentModal = $('.emes-modal-content');
            $('input[select-name=clientName]', contentModal).initFuzzySearch({
                type: 102,
                selectbox: true,
                nameKey: 'name',
                idKey: 'id',
                // 选择事件
                selectCallback: (data) => {
                    $('input[name=clientId]','.emes-modal-content').val(data.id);
                   
                }
            });
            $('input[select-name=factoryCode]', contentModal).initFuzzySearch({
                type: 103,
                selectbox: true,
                nameKey: 'code',
                idKey: 'id',
                // 选择事件
                selectCallback: (data) => {                 
                    $('input[name=factoryId]','.emes-modal-content').val(data.id);
                   
                }
            });
            this.judgeProjectName();
            this.rohsPutValues();
            //安全库存的默认值
            this.initInputValue('safeStock',0,contentModal);
        });

        // 修改
        $('.btn-group-modify', this.pageDom).bind('click', () => {
            const selIds = this.dataTable.getSelIds();
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
            const rowId = selIds[0];
            const rowData = this.dataTable.getRowData(rowId);
            $('.emes-modal-title label').html('修改产品');
            $('.emes-modal-title .emes-modal-uploadphoto').html('');
            this.refreshModal(rowData);
            $('#sys-main-mode-tabs').modal('show');
            $('#sys-main-mode-tabs').initUI();
            $('.emes-modal-save').unbind('click').bind('click', () => {
                $('#sys-main-mode-tabs').find('form').trigger('validate');
                const submitdisableFlag = $('#sys-main-mode-tabs').find('form').attr('submitdisable') === 'false' ? false : true;
                if (!submitdisableFlag) {
                    this.modify();
                }

            });
            // 将保存按钮的事件处理改为添加

            //填充隐藏值      
            this.getDetailInfo(rowId);
            this.getFactoryInfo(rowData.factoryCode);
            const contentModal = $('.emes-modal-content');
            const fuzzySearch = $('input[select-name=clientName]', contentModal).initFuzzySearch({
                type: 102,
                selectbox: true,
                nameKey: 'name',
                idKey: 'id',
                // 选择事件
                selectCallback: (data) => {
                    $('input[name=clientId]','.emes-modal-content').val(data.id);
                   
                }
            });
            fuzzySearch.setValue(rowData.clientName);

            const fuzzySearchCode = $('input[select-name=factoryCode]', contentModal).initFuzzySearch({
                type: 103,
                selectbox: true,
                nameKey: 'code',
                idKey: 'id',
                // 选择事件
                selectCallback: (data) => {                 
                    $('input[name=factoryId]','.emes-modal-content').val(data.id);
                   
                }
            });
            fuzzySearchCode.setValue(rowData.factoryCode);
            this.judgeProjectName(rowData);
            this.rohsPutValues(rowData.rohsFlag);
        });

        // 模糊查询
        $('input[name=productName]', this.pageDom).initFuzzySearch({
            type: 45
        });
        $('input[name=clientName]', this.pageDom).initFuzzySearch({
            type: 12
        });
        $('input[name=areaName]', this.pageDom).initFuzzySearch({
            type: 20
        });

   
    }

    //rohs赋值
    rohsPutValues(selectValue){
        var options = '';
        if(selectValue && selectValue == '1'){
            options =  '<option value ="1" selected="selected" >Y</option>'+
            '          <option value ="2" >N</option>';
        }else if(selectValue && selectValue == '2'){
            options =  '<option value ="1" >Y</option>'+
            '          <option value ="2" selected="selected" >N</option>';
        }else{
            options = ' <option selected="selected" disabled="disabled"  style="display: none" value="0"></option> '+
            '  <option value ="1" >Y</option>'+
            '  <option value ="2" >N</option>';
        }
        $("select[name=rohsFlag]",'.emes-modal-content').append(
            options
        );
    }

    //设置默认值
    initInputValue(name,value,dom){
        $('input[name='+name+']', dom).val(value);
    }

    //判断产品名称唯一性
    judgeProjectName(rowData){
        $('input[name=name]', '.emes-modal-content').blur(function(){
            const getProductName = $('input[name=name]', '.emes-modal-content').val();
            
            if(rowData){
                const orangeProductName = rowData.name;
                if(getProductName != orangeProductName){
                    $.ajax({
                        type: 'POST',
                        url: '/mes/product/judge/product',
                        dataType: 'json',
                        data: {'productName':getProductName},
                        success: (res) => {
                            if(res.code != '200'){
                                DialogUtil.showDialog({
                                    message: '该产品名称已存在!',
                                    type: 'alert',
                                    delay: 5
                                });
                                $('input[name=name]', '.emes-modal-content').val('');
                            }
                        },
                        error: function (res) {
                            console.error(res.responseText);
                        }
                    });
                }           
            }else if(!rowData){
                $.ajax({
                    type: 'POST',
                    url: '/mes/product/judge/product',
                    dataType: 'json',
                    data: {'productName':getProductName},
                    success: (res) => {
                        if(res.code != '200'){
                            DialogUtil.showDialog({
                                message: '该产品名称已存在!',
                                type: 'alert',
                                delay: 5
                            });
                            $('input[name=name]', '.emes-modal-content').val('');
                        }
                    },
                    error: function (res) {
                        console.error(res.responseText);
                    }
                });
            }
        });
    }

    // 树形菜单点击
    clickItem(ids) {
        if (!ids) {
            return;
        }

        // 获取表单数据
        const pageParam = {
            page: 1,
            pageSize: 10,
            productIds: ids.toString()
        };

        $.ajax({
            type: 'GET',
            url: '/mes/product/report/query',
            dataType: 'json',
            data: $.param(pageParam),
            success: (res) => {
                this.dataTable.dataGrid(res.data);
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    }

    // 添加
    add() {
        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        $.ajax({
            url: '/mes/product/add',
            type: 'post',
            dataType: 'json',
            data: contentForm.serialize(),
            success: (data) => {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '添加成功!',
                        type: 'alert',
                        delay: 5
                    });
                    $('#sys-main-mode-tabs').modal('hide');
                    // 刷新page,更新树结构
                    this.refresh();
                    $.ajax({
                        type: 'GET',
                        url: 'mes/product/tree',
                        dataType: 'json',
                        success: (res) => {
                            // 创建树形表格
                            this.tree.initTree(res.data);
                        }
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
        const contentForm = $('#sys-main-mode-tabs .emes-modal-content-form');
        const rowId = this.dataTable.getSelIds()[0];
        $.ajax({
            url: '/mes/product/modify',
            type: 'post',
            dataType: 'json',
            data: contentForm.serialize() + `&id=${rowId}`,
            success: (data) => {
                if (data.success) {
                    DialogUtil.showDialog({
                        message: '修改成功!',
                        type: 'alert',
                        delay: 5
                    });
                    $('#sys-main-mode-tabs').modal('hide');
                    this.clickItem(this.dataTable.getSelIds());
                    $.ajax({
                        type: 'GET',
                        url: 'mes/product/tree',
                        dataType: 'json',
                        success: (res) => {
                            // 创建树形表格
                            this.tree.initTree(res.data);
                        }
                    });
                }
            },
            error: (res) => {
                console.error(res.responseText);
            }
        });
    }

    // 刷新模态框
    refreshModal(data) {
        const modalContent = Handlebars.compile(i18n.$html(modalTpl));
        // Handllebars填充模板数据
        if (!data) {
            $('#modalContent').html(modalContent({}));
        } else {
            $('#modalContent').html(modalContent(data));
        }
        // 更新产品,客户,区域的选择内容
        if (!this.searchData) {
            return;
        }
        const modalDom = $('#sys-main-mode-tabs');
        const optionTemplate = Handlebars.compile(template.optionTpl);
        $('select[name=parentNameStr]', modalDom).html(optionTemplate(this.searchData.productList));
        $('select[name=mainNameStr]', modalDom).html(optionTemplate([]));
        $('select[name=clientId]', modalDom).html(optionTemplate(this.searchData.clientList));
        const selectTemplate = Handlebars.compile(template.selectTpl);
        $('select[name=areaIdStr]', modalDom).html(selectTemplate(this.searchData.areaList));
        $('select[name=equipmentOrLineIdStr]', modalDom).html(selectTemplate(this.searchData.equipmentList));
        const codeTemplate = Handlebars.compile(template.codeTpl);
        $('select[name=factoryId]', modalDom).html(codeTemplate(this.searchData.factoryList));
        // bootstrap-select表格refresh
        $('.selectpicker', modalDom).selectpicker('refresh');
        // 设置客户名称默认值
        if (data) {
            this.searchData.clientList.forEach(client => {
                if (client.name == data.clientName) {
                    $('select[name=clientId]', modalDom).selectpicker('val', client.id);
                }
            });
        }
        // 设置厂区编码默认值
        if (data) {
            this.searchData.factoryList.forEach(factory => {
                if (factory.code == data.factoryCode) {
                    $('select[name=factoryId]', modalDom).selectpicker('val', factory.id);
                }
            });
        }

        // 设置生产区域默认值
        if (data) {
            this.searchData.areaList.forEach(area => {
                if (area.name == data.areaName) {
                    $('select[name=areaId]', modalDom).selectpicker('val', area.id);
                }
            });
        }

        // 设置设备默认值
        if (data) {
            const equipmentIdArr = new Array();
            const equipmentNameArr = data.equipmentOrLine.split(",");
            if (equipmentNameArr.length > 0) {
                equipmentNameArr.forEach(equipmentName => {
                        this.searchData.equipmentList.forEach(equipment => {
                            if (equipmentName == equipment.name) {
                                equipmentIdArr.push(equipment.id);
                            }
                        })
                    },
                )
                $('select[name=equipmentOrLineIdStr]', modalDom).selectpicker('val', equipmentIdArr);
            }
        }


// 选择设备联动
        const equipmentChange = () => {
            const equipmentIds = $('select[name=equipmentOrLineIdStr]', modalDom).selectpicker('val');
            $.ajax({
                url: '/mes/product/equipmentType/query-by-equipment',
                type: 'GET',
                dataType: 'json',
                data: {
                    equipmentIds: equipmentIds.toString()
                },
                success: (res) => {
                    // 填充产品类型内容
                    $('.selectpicker', modalDom).selectpicker('refresh');
                    $('input[name=equipmentTypeStr]', modalDom).val(res.data);
                },
                error: (res) => {
                    console.error(res.responseText);
                }
            });
        };

        $('select[name=equipmentOrLineIdStr]', modalDom).on('hidden.bs.select', () => {
            equipmentChange();
        });

        // 设置父产品默认值
        if (data) {
                const parentIdArr = new Array();
                const parentNameArr = data.parentNameStr.split(",");
                if (parentNameArr.length > 0) {
                    parentNameArr.forEach(parentName => {
                            this.searchData.productList.forEach(product => {
                                if (parentName == product.name) {
                                    parentIdArr.push(product.id);
                                }
                            })
                        },
                    )
                    $('select[name=parentNameStr]', modalDom).selectpicker('val', parentIdArr);
                }
        }

        // 选择父产品联动
        const parentProductChange = () => {
            const productIds = $('select[name=parentNameStr]', modalDom).selectpicker('val');
            $.ajax({
                url: '/mes/product/mainproduct/query-by-parent',
                type: 'post',
                dataType: 'json',
                data: {
                    parentIds: productIds.toString()
                },
                success: (res) => {
                    // 填充主产品内容
                    $('.selectpicker', modalDom).selectpicker('refresh');
                    $('input[name=mainNameStr]', modalDom).val(res.data);
                },
                error: (res) => {
                    console.error(res.responseText);
                }
            });
        };
        $('select[name=parentNameStr]', modalDom).on('hidden.bs.select', () => {
            parentProductChange();
        });

        // 设置默认选择区域
        if (data) {
            const areaIdArr = new Array();
            const areaNameArr = data.areaName.split(",");
            if (areaNameArr.length > 0) {
                areaNameArr.forEach(areaName => {
                        this.searchData.areaList.forEach(area => {
                            if (areaName == area.name) {
                                areaIdArr.push(area.id);
                            }
                        })
                    },
                )
                $('select[name=areaIdStr]', modalDom).selectpicker('val', areaIdArr);
                equipmentChange();
            }
        }


    }

   //获取客户id
    getDetailInfo(id){
        $.ajax({
            url: '/mes/product/getProductByKeyId',
            type: 'get',
            dataType: 'json',
            data:{'id':id},
            async: false,
            success: function (res) {
                $('input[name=clientId]','.emes-modal-content').val(res.data.clientId); //客户id
            },
            error: function () {
                alert('查询失败');
            }
        });
    }

    //获取工厂detail
    getFactoryInfo(code){
        $.ajax({
            url: '/mes/factory/code/info',
            type: 'get',
            dataType: 'json',
            data:{'factoryCode':code},
            async: false,
            success: function (res) {
                
                $('input[name=factoryId]','.emes-modal-content').val(res.data.id); 
                $('input[select-name=factoryCode]','.emes-modal-content').val(res.data.code); 
            },
            error: function () {
                alert('查询失败');
            }
        });
    }

    

// 模糊查询节点
    searchNodesByParamFuzzy() {
        // 获取模糊匹配内容
        const treeObj = this.tree.ztree;
        
        const productName = $(".emes-search-form input[name=productName]", this.pageDom).val();//产品名称
        const clientName = $(".emes-search-form input[name=clientName]", this.pageDom).val();//客户名称
        const areaName = $(".emes-search-form input[name=areaName]", this.pageDom).val();//生产区域
        
        // 内容为空时显示所有
        if (!productName && !clientName && !areaName) {
            return;
        }

        const selNodes = treeObj.getNodesByFilter(node => {
            let flag = true;
            // 过滤产品名
            if (productName && productName != node.productName) {
                flag = false;
            }

            // 过滤客户名
            if (clientName && clientName != node.clientName) {
                flag = false;
            }

            // 过滤地区
            const areaList = node.areaList;
            let hasArea = false;
            areaList.forEach(area => {
                if (!areaName || areaName == area.name) {
                    hasArea = true;
                    return;
                }
            });

            return (flag && hasArea);
        });

        if (selNodes.length === 0) {
            DialogUtil.showDialog({
                message: '无匹配项!',
                type: 'alert',
                delay: 5
            });
            return;
        }

        const selIds = [];
        // 取消所有节点选中
        const nodes = treeObj.getNodes();
        nodes.forEach(node => {
            treeObj.selectNode(node, false);
        });

        // 处理选中节点
        selNodes.forEach(selNode => {
            selIds.push(selNode.productId);
            if (selNode.children && selNode.children.length > 0) {
                treeObj.expandNode(selNode, true);
            }
            // 选中节点
            treeObj.selectNode(selNode, true);
        });

        // 更新产品列表
        this.clickItem(selIds);
    }
}

export default Page;
