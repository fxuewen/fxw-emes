const optionTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{id}}">{{name}}</option>
	{{/each}}
`;

const selectTpl = `
	<option value="0">FILE</option>
	<option value="1">VIDEO</option>
`;

export default {
    optionTpl,
    selectTpl
};
