const optionTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{id}}">{{name}}</option>
	{{/each}}
`;

const optionsTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{id}}">{{code}}</option>
	{{/each}}
`;

const codeTpl = `
	{{#each this}}
	<option value="{{id}}">{{code}}</option>
	{{/each}}
`;

const selectTpl = `
	{{#each this}}
	<option value="{{id}}">{{name}}</option>
	{{/each}}
`;

export default {
    optionTpl,
    optionsTpl,
    selectTpl,
    codeTpl
};
