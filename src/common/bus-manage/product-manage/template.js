const optionTpl = `
	{{#each this}}
	<option value="{{id}}">{{name}}</option>
	{{/each}}
`;

const selectTpl = `
	{{#each this}}
	<option value="{{id}}">{{name}}</option>
	{{/each}}
`;

const codeTpl = `
    {{#each this}}
    <option value="{{id}}">{{code}}</option>
    {{/each}}
`;

export default {
    optionTpl,
    selectTpl,
    codeTpl
};
