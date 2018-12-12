const optionTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{id}}">{{number}}</option>
	{{/each}}
`;

const optionFactoryTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{id}}">{{code}}</option>
	{{/each}}
`;

export default {
    optionTpl,
    optionFactoryTpl
};
