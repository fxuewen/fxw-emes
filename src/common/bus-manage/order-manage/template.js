const optionTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{id}}">{{name}}</option>
	{{/each}}
`;

const optionOrderTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{id}}">{{code}}</option>
	{{/each}}
`;

export default {
    optionTpl,
    optionOrderTpl
};
