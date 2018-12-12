import './page.css';
import pageTpl from './page.html';
import template from './template';
import i18n from '../../../i18n/i18n';

// 定义全局变量
let roleId;
const data = [];
let addMenuButton;
let addOptionButton;
let addFieldButton;

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

        $.ajax({
            url: '/privilege/permissions/role/query',
            type: 'get',
            dataType: 'json',
            success: function (data) {
                const roleListTemplate = Handlebars.compile(template.roleListTemplate);
                $('.emes-app-role', page.pageDom).append(roleListTemplate(data));

                $('.emes-app-role', page.pageDom).on('click', 'li .role-list', function () {
                    page.selColumn(this);
                });
            },
            error: function () {
                console.log('获取角色信息失败');
            }
        });

        // 创建角色，绑定事件
        $('.create-role', page.pageDom).bind('click', function () {
            page.createRole();
        });
    },
    // 点击左侧菜单事件
    selColumn: function (op) {
        $(op).parent('li').parent('ul').children('li').removeClass('active');
        $(op).parent('li').addClass('active');
        roleId = $(op).attr('role-id');
        // 便于修改角色名称
        $('.roleId').val(roleId);
        $('.role-name').val($(op).text());

        // 修改角色名称
        $('.update-role', page.pageDom).on('click', function () {
            page.updateRole();
        });

        // 获取用户
        $.ajax({
            url: '/mes/privilege/permissions/role-user',
            type: 'get',
            dataType: 'json',
            data: {'roleId': roleId},
            async: false,
            success: function (data) {
                const fieldTemplate = Handlebars.compile(template.userListTemplate);
                $('.user-content').html(fieldTemplate(data));

                // 删除用户
                $('.user-content', page.pageDom).on('click', '.del-role', function () {
                    page.delRole(this);
                });

                // 可选择用户
                $('.add-user', page.pageDom).bind('click', function () {
                    page.initUserSel(this);
                });
            },
            error: function () {
                console.log('获取用户数据失败');
            }
        });

        // 获取菜单
        $.ajax({
            url: '/privilege/permissions/menu-resource/query',
            type: 'get',
            dataType: 'json',
            data: {'roleId': roleId},
            async: false,
            success: function (res) {
                const data = page.groupUpGrade(res.data);
                console.log(data);
                const menuListTemplate = Handlebars.compile(template.menuListTemplate);
                $('.permission-menu').html(menuListTemplate(data));

                // 删除菜单
                $('.permission-menu', page.pageDom).on('click', '.delete-menu', function () {
                    page.deleteMenu(this);
                });

                // 可选择菜单
                $('.addMenu', page.pageDom).bind('click', function () {
                    page.initMenuSel(this);
                });
            },
            error: function () {
                console.log('获取菜单数据失败');
            }
        });

        page.listOption();
        page.listField();
    },
    // 获取操作
    listOption: function () {
        $.ajax({
            url: '/privilege/permissions/permission/query',
            type: 'get',
            dataType: 'json',
            data: {'roleId': roleId},
            async: false,
            success: function (data) {
                const map = page.groupField(data.data);
                const fieldTemplate = Handlebars.compile(template.operListTemplate);
                $('.oper-content').html(fieldTemplate(map));

                // 删除操作
                $('.oper-content', page.pageDom).on('click', '.delete-option', function () {
                    page.deleteOption(this);
                });

                // 可选操作
                $('.addOper', page.pageDom).bind('click', function () {
                    page.initOperSel(this);
                });
            },
            error: function () {
                console.log('获取操作数据失败');
            }
        });
    },
    // 获取字段
    listField: function () {
        $.ajax({
            url: '/privilege/permissions/column-permission/query',
            type: 'get',
            dataType: 'json',
            data: {'roleId': roleId},
            async: false,
            success: function (data) {
                const map = page.groupField(data.data);
                const fieldTemplate = Handlebars.compile(template.columnListTemplate);
                $('.column-content').html(fieldTemplate(map));

                // 删除操作
                $('.column-content', page.pageDom).on('click', '.delete-field', function () {
                    page.deleteField(this);
                });

                // 可选操作
                $('.addField', page.pageDom).bind('click', function () {
                    page.initColumnSel(this);
                });
            },
            error: function () {
                console.log('获取字段数据失败');
            }
        });
    },
    // 创建角色弹出模态框
    createRole: function () {
        $('.emes-modal-title label').html('创建角色');
        $('.emes-modal-title .emes-modal-uploadphoto').html('');
        // 添加模态框样式大小
        $('.emes-modal-body').css('height', '100px');
        page.refreshModal(template.createRoleTemplate);
        $('#sys-main-mode-tabs').modal('show');
        // 将保存按钮的事件处理改为添加
        $('.emes-modal-save')[0].onclick = function () {
            page.addRole();
        };
    },
    // 添加角色按钮事件
    addRole: function () {
        $.ajax({
            url: '/privilege/permissions/role/add',
            data: $('.add-role').serialize(),
            dataType: 'json',
            type: 'post',
            success: function (data) {
                $('.emes-app-role').append(
                    '<li data-showval=' + data.data.nameI18n + '>' +
                    '<a href="#" class="role-list" role-id=' + data.data.id + '>' +
                    data.data.nameI18n +
                    '</a></li>'
                );
                // 清空数据
                $('.role-id').val('');
                $('.role-name').val('');
                $('#sys-main-mode-tabs').modal('hide');
            },
            error: function () {
                alert('保存失败！');
            }
        });
    },
    // 修改角色弹出模态框
    updateRole: function () {
        const data = {'id': roleId, 'roleName': $('.emes-app-role .active').attr('data-showval')};
        if (roleId) {
            $('.emes-modal-title label').html('修改角色名称');
            $('.emes-modal-title .emes-modal-uploadphoto').html('');
            // 添加模态框样式大小
            $('.emes-modal-body').css('height', '100px');
            page.refreshModal(template.createRoleTemplate, data);
            $('#sys-main-mode-tabs').modal('show');
            // 将保存按钮的事件处理改为添加
            $('.emes-modal-save')[0].onclick = function () {
                page.updateRoleName();
            };
        } else {
            alert('请先选择角色！');
        }
    },
    // 修改角色
    updateRoleName: function () {
        const roleId = $('input[name=id]').val();
        $.ajax({
            url: '/privilege/permissions/role-name/update',
            data: $('.add-role').serialize(),
            dataType: 'json',
            type: 'post',
            success: function () {
                $('a[role-id=' + roleId + ']').text($('input[name=roleName]').val());
                $('#sys-main-mode-tabs').modal('hide');
            },
            error: function () {
                alert('修改名称失败！');
            }
        });
    },
    // 添加用户模态框
    initUserSel: function (dom) {
        const doms = $(dom).parent().find('a');
        let employeeIds = '';
        doms.each(function (index, element) {
            if (index == doms.length - 1) {
                employeeIds += $(element).attr('employee-id');
            } else {
                employeeIds += $(element).attr('employee-id') + ',';
            }
        });
        $.ajax({
            url: '/mes/privilege/select-employee',
            data: {'employeeIds': employeeIds},
            dataType: 'json',
            type: 'get',
            success: function (data) {
                $('.emes-modal-title label').html('角色信息设置');
                $('.emes-modal-title .emes-modal-uploadphoto').html('');
                // 添加模态框样式大小
                $('.emes-modal-body').css('height', '400px');
                page.refreshModal(template.selectUserTemplate, data);
                $('#sys-main-mode-tabs').modal('show');

                // 添加选取绑定事件
                $('.sel-span').on('click', function () {
                    if ($(this).hasClass('equip-select-span-selected')) {
                        $(this).removeClass('equip-select-span-selected');
                    } else {
                        $(this).addClass('equip-select-span-selected');
                    }
                });

                // 将保存按钮的事件处理改为添加
                $('.emes-modal-save')[0].onclick = function () {
                    page.saveSelectUser();
                };
            },
            error: function () {
                alert('获取失败！');
            }
        });
    },
    // 批量添加用户
    saveSelectUser: function () {
        const doms = $('.equip-select-span-selected').find('strong');
        let employeeIds = '';
        data.splice(0, data.length);
        doms.each(function (index, element) {
            const employee = new Object();
            employee.name = $(element).text();
            employee.id = $(element).attr('employee-id');
            data.push(employee);

            if (index == doms.length - 1) {
                employeeIds += $(element).attr('employee-id');
            } else {
                employeeIds += $(element).attr('employee-id') + ',';
            }
        });
        $.ajax({
            url: '/privilege/permissions/role-user/add',
            data: {'employeeIds': employeeIds, 'roleId': roleId},
            dataType: 'json',
            type: 'post',
            success: function () {
                const addUserTemplate = Handlebars.compile(template.addUserTemplate);
                $('.add-user').before(addUserTemplate(data));
                $('#sys-main-mode-tabs').modal('hide');
            },
            error: function () {
                alert('获取失败！');
            }
        });
    },
    // 根据雇员id与角色id删除角色与用户的关联关系
    delRole: function (obj) {
        const id = $(obj).attr('employee-id');
        $.ajax({
            url: '/privilege/permissions/user-role/delete',
            data: {'id': id, 'roleId': roleId},
            dataType: 'json',
            type: 'post',
            success: function () {
                $(obj).parent().remove();
            },
            error: function () {
                alert('修改名称失败！');
            }
        });
    },
    // 删除菜单
    deleteMenu: function (dom) {
        $.ajax({
            url: '/privilege/permissions/menu/remove',
            data: {'id': $(dom).attr('menuId'), 'uuid': $(dom).attr('uuid'), 'roleId': roleId},
            dataType: 'json',
            type: 'post',
            success: function () {
                $(dom).parent().remove();
                page.listOption();
                page.listField();
            },
            error: function () {
                alert('删除菜单失败！');
            }
        });
    },
    // 选择菜单
    initMenuSel: function (dom) {
        addMenuButton = dom;
        $('.equipSelectDiv').html('');
        const doms = $(dom).parent().find('a');
        let menuIds = '';
        doms.each(function (index, element) {
            if (index == doms.length - 1) {
                menuIds += $(element).attr('menuId');
            } else {
                menuIds += $(element).attr('menuId') + ',';
            }
        });
        $.ajax({
            url: '/privilege/permissions/menu/query',
            data: {
                menuIds: menuIds,
                parentId: $(dom).parent().parent().children('div:first-child')
                    .children('label:first-child').attr('menuId')
            },
            dataType: 'json',
            type: 'get',
            success: function (data) {
                $('.emes-modal-title label').html('选择菜单');
                $('.emes-modal-title .emes-modal-uploadphoto').html('');
                // 添加模态框样式大小
                $('.emes-modal-body').css('height', '400px');
                page.refreshModal(template.selectMenuTemplate, data);
                $('#sys-main-mode-tabs').modal('show');

                // 添加选取绑定事件
                $('.sel-span').on('click', function () {
                    if ($(this).hasClass('equip-select-span-selected')) {
                        $(this).removeClass('equip-select-span-selected');
                    } else {
                        $(this).addClass('equip-select-span-selected');
                    }
                });

                // 将保存按钮的事件处理改为添加
                $('.emes-modal-save')[0].onclick = function () {
                    page.saveSelectMenu();
                };
            },
            error: function () {
                alert('获取菜单失败！');
            }
        });
    },
    // 保存菜单
    saveSelectMenu: function () {
        const doms = $('.equip-select-span-selected').find('strong');
        let id = '';
        let uuid = '';
        data.splice(0, data.length);
        doms.each(function (index, element) {
            const menu = new Object();
            menu.nameI18n = $(element).text();
            menu.uuid = $(element).attr('uuid');
            menu.id = $(element).attr('menuId');
            data.push(menu);

            if (index == doms.length - 1) {
                id += $(element).attr('menuId');
                uuid += $(element).attr('uuid');
            } else {
                id += $(element).attr('menuId') + ',';
                uuid += $(element).attr('uuid') + ',';
            }
        });
        $.ajax({
            url: '/privilege/permissions/menu/add',
            data: {'roleId': roleId, 'uuid': uuid, 'menuId': id},
            dataType: 'json',
            type: 'post',
            success: function () {
                const addMenuTemplate = Handlebars.compile(template.addMenuTemplate);
                $(addMenuButton).before(addMenuTemplate(data));
                $('#sys-main-mode-tabs').modal('hide');
                page.listOption();
                page.listField();
            },
            error: function () {
                alert('获取失败！');
            }
        });
    },
    // 删除功能权限
    deleteOption: function (dom) {
        $.ajax({
            url: '/privilege/permissions/permission/remove',
            data: {'roleId': roleId, 'uuid': $(dom).attr('uuid')},
            dataType: 'json',
            type: 'post',
            success: function () {
                $(dom).parent().remove();
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },
    // 选择可用功能
    initOperSel: function (dom) {
        addOptionButton = dom;
        $('.equipSelectDiv').html('');
        const doms = $(dom).parent().find('a');
        let operIds = '';
        doms.each(function (index, element) {
            if (index == doms.length - 1) {
                operIds += $(element).attr('operationId');
            } else {
                operIds += $(element).attr('operationId') + ',';
            }
        });
        $.ajax({
            url: '/privilege/permissions/operation-resource/query',
            data: {'operationId': operIds, 'menuId': $(dom).attr('menuId')},
            dataType: 'json',
            type: 'get',
            success: function (data) {
                $('.emes-modal-title label').html($(dom).attr('menuName'));
                $('.emes-modal-title .emes-modal-uploadphoto').html('');
                // 添加模态框样式大小
                $('.emes-modal-body').css('height', '400px');
                page.refreshModal(template.selectOperTemplate, data);
                $('#sys-main-mode-tabs').modal('show');

                // 添加选取绑定事件
                $('.sel-span').on('click', function () {
                    if ($(this).hasClass('equip-select-span-selected')) {
                        $(this).removeClass('equip-select-span-selected');
                    } else {
                        $(this).addClass('equip-select-span-selected');
                    }
                });

                // 将保存按钮的事件处理改为添加
                $('.emes-modal-save')[0].onclick = function () {
                    page.saveSelectOper();
                };
            },
            error: function () {
                alert('获取菜单失败！');
            }
        });
    },
    // 保存功能
    saveSelectOper: function () {
        const doms = $('.equip-select-span-selected').find('strong');
        let uuids = '';
        data.splice(0, data.length);
        doms.each(function (index, element) {
            const oper = new Object();
            oper.nameI18n = $(element).text();
            oper.uuid = $(element).attr('uuid');
            oper.id = $(element).attr('operationId');
            data.push(oper);

            if (index == doms.length - 1) {
                uuids += $(element).attr('uuid');
            } else {
                uuids += $(element).attr('uuid') + ',';
            }
        });
        $.ajax({
            url: '/privilege/permissions/permission/add',
            data: {'roleId': roleId, 'uuids': uuids},
            dataType: 'json',
            type: 'post',
            success: function () {
                const addOperTemplate = Handlebars.compile(template.addOperTemplate);
                $(addOptionButton).before(addOperTemplate(data));
                $('#sys-main-mode-tabs').modal('hide');
            },
            error: function () {
                alert('获取失败！');
            }
        });
    },
    // 删除字段
    deleteField: function (dom) {
        $.ajax({
            url: '/privilege/permissions/privilege/column/remove',
            data: {'roleId': roleId, 'reportId': $(dom).attr('reportId'), 'columnId': $(dom).attr('columnId')},
            dataType: 'json',
            type: 'post',
            success: function () {
                $(dom).parent().remove();
            },
            error: function (res) {
                console.error(res.responseText);
            }
        });
    },
    // 可选字段
    initColumnSel: function (dom) {
        addFieldButton = dom;
        $('.equipSelectDiv').html('');
        const doms = $(dom).parent().find('a');
        let columnIds = '';
        doms.each(function (index, element) {
            if (index == doms.length - 1) {
                columnIds += $(element).attr('columnId');
            } else {
                columnIds += $(element).attr('columnId') + ',';
            }
        });
        $.ajax({
            url: '/privilege/permissions/report-column/query',
            data: {'columnIds': columnIds, 'menuId': $(dom).attr('menuId')},
            dataType: 'json',
            type: 'get',
            success: function (data) {
                $('.emes-modal-title label').html($(dom).attr('menuName'));
                $('.emes-modal-title .emes-modal-uploadphoto').html('');
                // 添加模态框样式大小
                $('.emes-modal-body').css('height', '400px');
                page.refreshModal(template.selectFieldTemplate, data);
                $('#sys-main-mode-tabs').modal('show');

                // 添加选取绑定事件
                $('.sel-span').on('click', function () {
                    if ($(this).hasClass('equip-select-span-selected')) {
                        $(this).removeClass('equip-select-span-selected');
                    } else {
                        $(this).addClass('equip-select-span-selected');
                    }
                });

                // 将保存按钮的事件处理改为添加
                $('.emes-modal-save')[0].onclick = function () {
                    page.saveSelectField();
                };
            },
            error: function () {
                alert('获取菜单失败！');
            }
        });
    },
    // 保存字段
    saveSelectField: function () {
        const doms = $('.equip-select-span-selected').find('strong');
        let privilegeColumnJson = '[';
        data.splice(0, data.length);
        doms.each(function (index, element) {
            const field = new Object();
            field.aliasName = $(element).text().trim();
            field.id = $(element).attr('columnId');
            field.reportId = $(element).attr('reportId');
            data.push(field);

            let obj;
            if (index == doms.length - 1) {
                obj = {
                    'roleId': roleId,
                    'reportId': $(element).attr('reportId'),
                    'columnId': $(element).attr('columnId')
                };
                privilegeColumnJson += JSON.stringify(obj);
            } else {
                obj = {
                    'roleId': roleId,
                    'reportId': $(element).attr('reportId'),
                    'columnId': $(element).attr('columnId')
                };
                privilegeColumnJson += JSON.stringify(obj) + ',';
            }
        });
        privilegeColumnJson += ']';
        $.ajax({
            url: '/privilege/permissions/column-permission/add',
            data: {'privilegeColumnJson': privilegeColumnJson},
            dataType: 'json',
            type: 'post',
            success: function () {
                const addFieldTemplate = Handlebars.compile(template.addFieldTemplate);
                $(addFieldButton).before(addFieldTemplate(data));
                $('#sys-main-mode-tabs').modal('hide');
            },
            error: function () {
                alert('获取失败！');
            }
        });
    },
    // 刷新模态框
    refreshModal: function (template, data) {
        const modalContent = Handlebars.compile(template);
        // Handllebars填充模板数据
        if (data == null || data == 'undefined') {
            $('#modalContent').html(modalContent());
        } else {
            $('#modalContent').html(modalContent(data));
        }
    },

    groupField: function (arr) {
        const map = {};
        const dest = [];
        for (let i = 0; i < arr.length; i++) {
            const ai = arr[i];
            if (!map[ai.menuId]) {
                dest.push({
                    menuId: ai.menuId,
                    menuName: ai.menuName,
                    data: [ai]
                });
                map[ai.menuId] = ai;
            } else {
                for (let j = 0; j < dest.length; j++) {
                    const dj = dest[j];
                    if (dj.menuId == ai.menuId) {
                        dj.data.push(ai);
                        break;
                    }
                }
            }
        }
        return dest;
    },

    groupUpGrade: function (arr) {
        const map = {};
        const dest = [];
        for (let i = 0; i < arr.length; i++) {
            const ai = arr[i];
            if (!map[ai.parentId]) { // id不同的进入if语句
                dest.push({
                    parentId: ai.parentId,
                    data: [ai]
                });
                map[ai.parentId] = ai;
            } else { // id相同的进入else语句
                for (let j = 0; j < dest.length; j++) {
                    const dj = dest[j];
                    if (dj.parentId == ai.parentId) {
                        dj.data.push(ai);
                        break;
                    }
                }
            }
        }

        const levelAll = dest;
        let levelOne = [];
        for (let i = 0; i < levelAll.length; i++) {
            if (levelAll[i].parentId == 0) {
                levelOne = levelAll[i].data;
                levelAll.splice(i, 1);
            }
        }

        const resultdest = [];
        outer: for (let i = 0; i < levelOne.length; i++) {
            for (let j = 0; j < levelAll.length; j++) {
                if (levelOne[i].id == levelAll[j].parentId) {
                    resultdest.push({
                        id: levelOne[i].id,
                        nameI18n: levelOne[i].nameI18n,
                        data: levelAll[j].data
                    });
                    continue outer;
                }
            }
            resultdest.push({
                id: levelOne[i].id,
                nameI18n: levelOne[i].nameI18n,
                data: []
            });
        }
        return resultdest;
    }


};

export default page;
