const createRoleTemplate = `
	<form class="form-horizontal em-submit-form add-role">
		<input type="hidden" class="role-id" name="id" value="{{id}}"/>
		<div class="input-group em-auto-input" style="width:90%;margin: 8px;">
			<div class="input-group-addon"><label class="line">角色名称:</label></div>
			<input type="text" name="roleName" class="form-control role-name" required="required" value="{{roleName}}"/>
		</div>
	</form>
`;

const roleListTemplate = `
	{{#each data}}
	<li data-showval="{{nameI18n}}">
		<a href="#" class="role-list" role-id ="{{id}}">{{nameI18n}}</a>
	</li>
	{{/each}}
`;

const userListTemplate = `
	{{#each data}}
	<span class="equip-span">
	    <strong>{{name}}({{number}})</strong>
	    <a title="移除" class="del-role" employee-id ="{{id}}"><i class="fa fa-window-close"></i></a>
	    </span>
	{{/each}}
	<button class="addEquipBtn add-user">+</button>
	<div style="clear:both;"></div>
`;

const addUserTemplate = `
	{{#each this}}
	<span class="equip-span">
	<strong>{{name}}</strong>
	<a title="移除" employee-id ="{{id}}" class="del-role"><i class="fa fa-window-close"></i></a>
	</span>
	{{/each}}
`;

const selectUserTemplate = `
	{{#each data}}
	<span class="equip-select-span sel-span">
		<strong employee-id ="{{id}}">{{name}}({{number}})</strong>
	</span>
	{{/each}}
	<div style="clear:both;"></div>
`;

const menuListTemplate = `
	{{#each this}}
	<div class="emes-page-privilege-content">
		<div class="board_style fa-hover">
			<div class="board_name">
				<label class="left_float" menuId="{{id}}">{{nameI18n}}</label>
				<div class="right_float">
				</div>
				<div style="clear:both;"></div>
			</div>
			<div class="equipment_name">
				{{#each data}}
				<span class="equip-span">
		                <strong>{{nameI18n}}</strong>
						<a title="移除" uuid ="{{uuid}}" menuId="{{id}}" class="delete-menu">
							<i class="fa fa-window-close"></i>
						</a>
		                </span>
				{{/each}}
				<button class="addEquipBtn addMenu">+</button>
				<div style="clear:both;"></div>
			</div>
		</div>
	</div>
	{{/each}}
`;

const addMenuTemplate = `
	{{#each this}}
	<span class="equip-span">
		<strong>{{nameI18n}}</strong>
		<a title="移除" uuid ="{{uuid}}" menuId="{{id}}" class="delete-menu"><i class="fa fa-window-close"></i></a>
	</span>
	{{/each}}
`;

const selectMenuTemplate = `
	{{#each data}}
	<span class="equip-select-span sel-span">
		<strong menuId="{{id}}" uuid ="{{uuid}}">{{nameI18n}}</strong>
	</span>
	{{/each}}
`;

const operListTemplate = `
	{{#each this}}
	<div class="emes-page-privilege-content">
		<div class="board_style fa-hover">
			<div class="board_name">
				<label class="left_float">{{menuName}}</label>
				<div class="right_float">
				</div>
				<div style="clear:both;"></div>
			</div>
			<div class="equipment_name">
				{{#each data}}
				<span class="equip-span">
					<strong>{{nameI18n}}</strong>
					<a title="移除" uuid ="{{uuid}}" operationId="{{id}}" class="delete-option">
						<i class="fa fa-window-close"></i>
					</a>
				</span>
				{{/each}}
				<button class="addEquipBtn addOper" menuName="{{menuName}}" menuId="{{menuId}}">+</button>
				<div style="clear:both;"></div>
			</div>
		</div>
	</div>
	{{/each}}
`;

const selectOperTemplate = `
	{{#each data}}
	<span class="equip-select-span sel-span">
		<strong uuid ="{{uuid}}" operationId="{{id}}">{{nameI18n}}</strong>
	</span>
	{{/each}}
`;

const addOperTemplate = `
	{{#each this}}
	<span class="equip-span">
		<strong>{{nameI18n}}</strong>
		<a title="移除" uuid ="{{uuid}}" operationId="{{id}}" class="delete-option">
			<i class="fa fa-window-close"></i>
		</a>
	</span>
	{{/each}}
`;

const columnListTemplate = `
	{{#each this}}
	<div class="emes-page-privilege-content">
		<div class="board_style fa-hover">
			<div class="board_name">
				<label class="left_float">{{menuName}}</label>
				<div class="right_float">
				</div>
				<div style="clear:both;"></div>
			</div>
			<div class="equipment_name">
				{{#each data}}
				<span class="equip-span">
		                <strong>{{aliasName}}</strong>
		                <a title="移除" columnId ="{{id}}" reportId="{{reportId}}" class="delete-field">
							<i class="fa fa-window-close"></i>
						</a>
		                </span>
				{{/each}}
				<button class="addEquipBtn addField" menuName="{{menuName}}" menuId="{{menuId}}">+</button>
				<div style="clear:both;"></div>
			</div>
		</div>
	</div>
	{{/each}}
`;

const selectFieldTemplate = `
	{{#each data}}
	<span class="equip-select-span sel-span">
		<strong columnId ="{{id}}" reportId="{{reportId}}">{{aliasName}}</strong>
	</span>
	{{/each}}
`;

const addFieldTemplate = `
	{{#each this}}
	<span class="equip-span">
		<strong>{{aliasName}}</strong>
		<a title="移除" columnId ="{{id}}" reportId="{{reportId}}" class="delete-field">
			<i class="fa fa-window-close"></i>
		</a>
	</span>
	{{/each}}
`;

export default {
    createRoleTemplate,
    roleListTemplate,
    userListTemplate,
    addUserTemplate,
    selectUserTemplate,
    menuListTemplate,
    addMenuTemplate,
    selectMenuTemplate,
    operListTemplate,
    selectOperTemplate,
    addOperTemplate,
    columnListTemplate,
    selectFieldTemplate,
    addFieldTemplate
};
