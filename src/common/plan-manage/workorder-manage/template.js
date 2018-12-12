const optionTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{name}}">{{name}}</option>
	{{/each}}
`;

const optionOrderTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{mainCode}}">{{mainCode}}</option>
	{{/each}}
`;

const optionWorkOrderTypeTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{value}}">{{desc}}</option>
	{{/each}}
`;

const optionWorkOrderCodeTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{code}}">{{code}}</option>
	{{/each}}
`;

const optionProcessTpl = `
	<option value="">请选择</option>
	{{#each this}}
	<option value="{{id}}">{{name}}</option>
	{{/each}}
`;

const groupTpl = `
	{{#each this}}
	<option value="{{id}}">{{code}}:{{productName}}</option>
	{{/each}}
`;

export default {
    optionTpl,
    optionOrderTpl,
    optionWorkOrderTypeTpl,
    optionWorkOrderCodeTpl,
    optionProcessTpl,
    groupTpl
};
