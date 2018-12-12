const optionTpl = `
    <option value=" ">请选择</option>
    {{#each this}}
    <option value="{{name}}">{{name}}</option>
    {{/each}}
`;

const optionVersion = `
    <option value=" ">请选择</option>
    {{#each this}}
    <option value="{{version}}">{{version}}</option>
    {{/each}}
`;

const optionUser = `
    <option value=" ">请选择</option>
    {{#each this}}
    <option value="{{employeeId}}">{{name}}</option>
    {{/each}}
`;

export default {
    optionTpl,
    optionVersion,
    optionUser
};