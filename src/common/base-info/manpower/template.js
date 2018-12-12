const optionDepTpl = `
	{{#each this}}
	<option value="{{id}}">{{name}}</option>
	{{/each}}
`;

const optionJobTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{id}}">{{nameI18n}}</option>
	{{/each}}
`;

export default {
    optionDepTpl,
    optionJobTpl
};
