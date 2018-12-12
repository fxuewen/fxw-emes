const optionTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{id}}">{{code}}</option>
	{{/each}}
`;

const optionEquipmentTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{id}}">{{name}}</option>
	{{/each}}
`;

const optionProcessTypeTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{value}}">{{desc}}</option>
	{{/each}}
`;

export default {
    optionTpl,
    optionEquipmentTpl,
    optionProcessTypeTpl
};
