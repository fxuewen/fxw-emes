class TreeGridUtil {
    constructor($dom, option, shwoRightMenuFlag) {
        this.$dom = $dom;
        this.option = option || {};
        // 是否显示右键菜单
        this.shwoRightMenuFlag = shwoRightMenuFlag;
        this.setting = {
            view: {
                dblClickExpand: false,
                showLine: true,
                selectedMulti: false,
            },
            data: {
                simpleData: {
                    enable: true,
                    idKey: 'id',
                    pIdKey: 'parentId',
                }
            },
            callback: {

            }
        };
        this.ztree = null;

        Object.assign(this.setting, option, this.getBindEvent());
    }

    // 创建树形表
    initTree(data) {
        this.ztree = $.fn.zTree.init(this.$dom, this.setting, data);
        // ztree对象
        // 获取所有根节点
        const rootNodes = this.ztree.getNodes();
        // 选中第一个根节点
        this.selectNode(rootNodes[0]);
    }

    // 选中节点
    selectNode(node) {
        if (!node) {
            return;
        }

        this.ztree.selectNode(node);
        if (node.children && node.children.length > 0) {
            this.ztree.expandNode(node, true);
        }
        // 执行回调
        this.ztree.setting.callback.onClick(null, node.id, node);
    }

    // 显示右键菜单
    showRightMenu(x, y, treeId, treeNode) {
        this.$dom.siblings('#rightMenu').remove();
        if (treeNode.level === 0) {
            this.$dom.after(`<div id="rightMenu">
                    <a id="rightMenuAdd" href="#" class="list-group-item"><span class="fa fa-plus"></span>添加</a>
                </div>`);
        } else {
            this.$dom.after(`<div id="rightMenu">
                    <a id="rightMenuAdd" href="#" class="list-group-item"><span class="fa fa-plus"></span>添加</a>
                </div>`);
        }
        $('#rightMenu').css({
            'top': y + 'px',
            'left': x + 'px',
            'visibility':'visible'
        });

        $('#rightMenu #rightMenuAdd').bind('click', () => {
            this.option.callback.rightMenuAdd(treeId, treeNode);
            // console.log(treeId);
            // console.log(treeNode);
        });

        $('#rightMenu #rightMenuDel').bind('click', () => {
            this.option.callback.rightMenuDel(treeId, treeNode);
            // console.log(treeId);
            // console.log(treeNode);
        });
        $('body').bind('mousedown', this.onBodyMouseDown);
    }

    // 隐藏右键菜单
    hideRightMenu() {
        this.$dom.siblings('#rightMenu').remove();
        if ($('#rightMenu')) {
            $('#rightMenu').css({'visibility': 'hidden'});
        }
        $('body').unbind('mousedown', this.onBodyMouseDown);
    }

    onBodyMouseDown(event) {
        if (!(event.target.id == 'rightMenu' || $(event.target).parents('#rightMenu').length > 0)) {
            $('#rightMenu').css({'visibility' : 'hidden'});
        }
    }

    // Ztree绑定事件
    getBindEvent() {
        const callback = {
            onRightClick: (event, treeId, treeNode) => {
                console.log(treeId);
                console.log(treeNode);
                if (this.option.callback && this.option.callback.onRightClick) {
                    this.option.callback.onRightClick(event, treeId, treeNode);
                }
                // if (!treeNode && event.target.tagName.toLowerCase() != 'button' && $(event.target).parents('a').length == 0) {
                //     this.showRightMenu(event.offsetX + event.target.offsetLeft,
                //         event.offsetY + event.target.offsetTop, treeId, treeNode);
                // } else if (treeNode) {
                //     this.showRightMenu(event.offsetX + event.target.offsetLeft,
                //         event.offsetY + event.target.offsetTop, treeId, treeNode);
                // }

                if (treeNode && this.shwoRightMenuFlag) {
                    this.showRightMenu(event.offsetX + event.target.offsetLeft,
                        event.offsetY + event.target.offsetTop, treeId, treeNode);
                }
            },
        };
        return {
            callback: Object.assign({}, this.option.callback, callback)
        };
    }
}

export default TreeGridUtil;
