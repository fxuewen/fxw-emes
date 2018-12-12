const projectDirector = `
	<form class="emes-projectDirector">
		<input type="hidden" name="id">
		{{#each data}}
			<input type="checkbox" value="{{name}}" name="depart">{{name}}  
		{{/each}}
	</form>
`;

export default {
    projectDirector
};
