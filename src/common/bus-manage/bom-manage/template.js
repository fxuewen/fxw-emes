const optionTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{value}}">{{nameI18n}}</option>
	{{/each}}
`;

const selectTpl = `
	{{#each this}}
	<option value="{{id}}">{{productName}}</option>
	{{/each}}
`;

export default {
    optionTpl,
    selectTpl
};
