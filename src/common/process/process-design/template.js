const optionTpl = `
    {{#each this}}
    <option value="{{id}}" attr-index="{{@index}}">{{name}}</option>
    {{/each}}
`;

export default {
    optionTpl
};
