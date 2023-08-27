<script lang="ts">
	let emptyPrompt = {
		task: [],
		persona: [],
		format: [],
		tone: [],
		exemplars: [],
		context: []
	};

	let missingBlocks = {
		task: false,
		persona: false,
		format: false,
		tone: false,
		exemplars: false,
		context: false
	};

	$: console.log(missingBlocks);

	let loadingAnalyze = false;
	let analyzePrompt = () => {
		if (loadingAnalyze) return;
		loadingAnalyze = true;
		analysedPrompt = emptyPrompt;
		analyzedInput = '';
		missingBlocks = {
			task: false,
			persona: false,
			format: false,
			tone: false,
			exemplars: false,
			context: false
		};
		suggestions = {
			task: [],
			persona: [],
			format: [],
			tone: [],
			exemplars: [],
			context: []
		};
		revisedPrompt = '';
		console.log('Analyzing prompt...');
		fetch('/api/AnalysePrompt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				prompt: input
			})
		})
			.then((res) => res.json())
			.then((data) => {
				loadingAnalyze = false;
				console.log(data);
				analysedPrompt = data.prompt;
				transformInput(data.prompt);
			})
			.catch((err) => {
				console.log(err);
				loadingAnalyze = false;
			});
	};

	let transformInput = (prompt: {
		task: string[];
		format: string[];
		persona: string[];
		tone: string[];
		exemplars: string[];
		context: string[];
	}) => {
		// Go over input string and add html tags , span with class for each part of the prompt
		console.log('transformInput', prompt);
		let array = [
			{ name: 'task', value: prompt.task },
			{ name: 'format', value: prompt.format },
			{ name: 'persona', value: prompt.persona },
			{ name: 'tone', value: prompt.tone },
			{ name: 'exemplars', value: prompt.exemplars },
			{ name: 'context', value: prompt.context }
		];
		analyzedInput = input;
		array.forEach((element) => {
			element.value.forEach((value) => {
				if (value.length !== 0 && analyzedInput.toLowerCase().includes(value.toLowerCase())) {
					let index = getLocationOfIncludes(analyzedInput, value);
					let length = value.length;
					analyzedInput = analyzedInput.replace(
						analyzedInput.slice(index, index + length),
						`<span class="${element.name}">${analyzedInput.slice(index, index + length)}</span>`
					);
				}
			});
		});
	};

	let getLocationOfIncludes = (str1: string, str2: string) => {
		if (str1.toLowerCase().includes(str2.toLowerCase())) {
			return str1.toLowerCase().indexOf(str2.toLowerCase());
		}
		return -1;
	};

	let input = '';
	let analysedPrompt = {
		task: [],
		persona: [],
		format: [],
		tone: [],
		exemplars: [],
		context: []
	};

	let loadingSuggest = false;
	let suggestions: {
		task: { name: string; checked: boolean }[];
		persona: { name: string; checked: boolean }[];
		format: { name: string; checked: boolean }[];
		tone: { name: string; checked: boolean }[];
		exemplars: { name: string; checked: boolean }[];
		context: { name: string; checked: boolean }[];
	} = {
		task: [],
		persona: [],
		format: [],
		tone: [],
		exemplars: [],
		context: []
	};
	$: console.log(suggestions);
	let suggest = () => {
		if (loadingSuggest) return;
		loadingSuggest = true;
		console.log('Suggesting...');
		fetch('/api/SuggestPrompt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				prompt: input,
				analysedPrompt: analysedPrompt,
				missingBlocks: missingBlocks
			})
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data.prompt);
				let prompt: {
					task?: string[];
					format?: string[];
					persona?: string[];
					tone?: string[];
					exemplars?: string[];
					context?: string[];
				} = data.prompt;
				if (prompt.task) {
					prompt.task?.forEach((task) => {
						suggestions.task.push({ name: task, checked: false });
					});
				}
				if (prompt.format) {
					prompt.format?.forEach((format) => {
						suggestions.format.push({ name: format, checked: false });
					});
				}
				if (prompt.persona) {
					prompt.persona?.forEach((persona) => {
						suggestions.persona.push({ name: persona, checked: false });
					});
				}
				if (prompt.tone) {
					prompt.tone?.forEach((tone) => {
						suggestions.tone.push({ name: tone, checked: false });
					});
				}
				if (prompt.exemplars) {
					prompt.exemplars?.forEach((exemplars) => {
						suggestions.exemplars.push({ name: exemplars, checked: false });
					});
				}
				if (prompt.context) {
					prompt.context?.forEach((context) => {
						suggestions.context.push({ name: context, checked: false });
					});
				}
				loadingSuggest = false;
				suggestions = { ...suggestions };
			})
			.catch((err) => {
				console.log(err);
				loadingSuggest = false;
			});
	};
	let revisedPrompt = '';
	let revise = () => {
		fetch('/api/RevisePrompt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				prompt: input,
				analysedPrompt: analysedPrompt,
				suggestions: suggestions
			})
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				revisedPrompt = data.text;
			})
			.catch((err) => {
				console.log(err);
			});
	};

	let analyzedInput = '';
</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5 text-center flex flex-col items-center">
		<!-- User enters prompt -> Function call -> App displays analysis -->
		<h2>Enter a prompt:</h2>
		<textarea bind:value={input} class="input w-72" placeholder="Enter a prompt" />
		<button
			class="btn rounded-full border"
			on:click={() => {
				analyzePrompt();
			}}
			><span> Analyze </span>
		</button>
		<h3>
			{@html analyzedInput}
		</h3>

		{#if loadingAnalyze}
			<p>Analysing...</p>
		{/if}

		{#if analyzedInput !== ''}
			<!-- Analysis -->
			<div>
				<h2>Analysis</h2>
				<ul>
					<li>
						{#if analysedPrompt.task.length !== 0}
							<b><span class="task">Task</span></b> - {analysedPrompt.task || 'No task found'}
						{/if}
					</li>
					<li>
						{#if analysedPrompt.persona.length !== 0}
							<b><span class="persona">Persona</span></b> - {analysedPrompt.persona ||
								'No persona found'}
						{/if}
					</li>
					<li>
						{#if analysedPrompt.format.length !== 0}
							<b><span class="format">Format</span></b> - {analysedPrompt.format ||
								'No format found'}
						{/if}
					</li>
					<li>
						{#if analysedPrompt.tone.length !== 0}
							<b><span class="tone">Tone</span></b> - {analysedPrompt.tone || 'No tone found'}
						{/if}
					</li>
					<li>
						{#if analysedPrompt.exemplars.length !== 0}
							<b><span class="exemplars">Exemplars</span></b> - {analysedPrompt.exemplars ||
								'No exemplars found'}
						{/if}
					</li>
					<li>
						{#if analysedPrompt.context.length !== 0}
							<b><span class="context">Context</span></b> - {analysedPrompt.context ||
								'No context found'}
						{/if}
					</li>
				</ul>
			</div>

			<div>
				<h2>Missing</h2>
				<!-- Help sections -->
				{#if analyzedInput !== ''}
					<!-- No Task -->
					{#if analysedPrompt.task.length === 0}
						<div class="flex flex-col items-center">
							<h2>No Task</h2>
							<div class="flex">
								<input bind:checked={missingBlocks.task} type="checkbox" id="task" name="task" />
								<label for="task">Suggest</label>
							</div>
						</div>
					{/if}
					<!-- No Persona -->
					{#if analysedPrompt.persona.length === 0}
						<div class="flex flex-col items-center">
							<h2>No Persona</h2>
							<div class="flex">
								<input
									bind:checked={missingBlocks.persona}
									type="checkbox"
									id="persona"
									name="persona"
								/>
								<label for="persona">Suggest</label>
							</div>
						</div>
					{/if}
					<!-- No Format -->
					{#if analysedPrompt.format.length === 0}
						<div class="flex flex-col items-center">
							<h2>No Format</h2>
							<div class="flex">
								<input
									bind:checked={missingBlocks.format}
									type="checkbox"
									id="format"
									name="format"
								/>
								<label for="format">Suggest</label>
							</div>
						</div>
					{/if}
					<!-- No Tone -->
					{#if analysedPrompt.tone.length === 0}
						<div class="flex flex-col items-center">
							<h2>No Tone</h2>
							<div class="flex">
								<input bind:checked={missingBlocks.tone} type="checkbox" id="tone" name="tone" />
								<label for="tone">Suggest</label>
							</div>
						</div>
					{/if}
					<!-- No Exemplars -->
					{#if analysedPrompt.exemplars.length === 0}
						<div class="flex flex-col items-center">
							<h2>No Exemplars</h2>
							<div class="flex">
								<input
									bind:checked={missingBlocks.exemplars}
									type="checkbox"
									id="exemplars"
									name="exemplars"
									class="inline"
								/>
								<label for="exemplars" class="inline">Suggest</label>
							</div>
						</div>
					{/if}
					<!-- No Context -->
					{#if analysedPrompt.context.length === 0}
						<div class="flex flex-col items-center">
							<h2>No Context</h2>
							<div class="flex">
								<input
									bind:checked={missingBlocks.context}
									type="checkbox"
									id="context"
									name="context"
								/>
								<label for="context">Suggest</label>
							</div>
						</div>
					{/if}
					<button
						class="border btn rounded-full"
						on:click={() => {
							suggest();
						}}>suggest</button
					>
				{/if}
			</div>
			{#if loadingSuggest}
			<p>Suggesting...</p>
			{/if}
			{#if suggestions.task.length !== 0 || suggestions.persona.length !== 0 || suggestions.format.length !== 0 || suggestions.tone.length !== 0 || suggestions.exemplars.length !== 0 || suggestions.context.length !== 0}
			<h2>Suggestions</h2>
				<div>
					<!-- Suggestions -->
					{#if suggestions.task !== undefined && suggestions.task.length !== 0}
						<h2>Suggestions</h2>
						<b><span class="task">Task</span></b>
						{#each suggestions.task as task, i}
							<div class="flex items-center">
								<input
									type="checkbox"
									id={task.name + i + ''}
									name={task.name + i + ''}
									bind:checked={suggestions.task[i].checked}
								/>
								<label for={task.name + i + ''}>{task.name}</label>
							</div>
						{/each}
					{/if}
					{#if suggestions.persona !== undefined && suggestions.persona.length !== 0}
						<b><span class="persona">Persona</span></b>
						{#each suggestions.persona as persona, i}
							<div class="flex items-center">
								<input
									type="checkbox"
									id={persona.name + i + ''}
									name={persona.name + i + ''}
									bind:checked={suggestions.persona[i].checked}
								/>
								<label for={persona.name + i + ''}>{persona.name}</label>
							</div>
						{/each}
					{/if}
					{#if suggestions.format !== undefined && suggestions.format.length !== 0}
						<b><span class="format">Format</span></b>
						{#each suggestions.format as format, i}
							<div class="flex items-center">
								<input
									type="checkbox"
									id={format.name + i + ''}
									name={format.name + i + ''}
									bind:checked={suggestions.format[i].checked}
								/>
								<label for={format.name + i + ''}>{format.name}</label>
							</div>
						{/each}
					{/if}
					{#if suggestions.tone !== undefined && suggestions.tone.length !== 0}
						<b><span class="tone">Tone</span></b>
						{#each suggestions.tone as tone, i}
							<div class="flex items-center">
								<input
									type="checkbox"
									id={tone.name + i + ''}
									name={tone.name + i + ''}
									bind:checked={suggestions.tone[i].checked}
								/>
								<label for={tone.name + i + ''}>{tone.name}</label>
							</div>
						{/each}
					{/if}
					{#if suggestions.exemplars !== undefined && suggestions.exemplars.length !== 0}
						<b><span class="exemplars">Exemplars</span></b>
						{#each suggestions.exemplars as exemplars, i}
							<div class="flex items-center">
								<input
									type="checkbox"
									id={exemplars.name + i + ''}
									name={exemplars.name + i + ''}
									bind:checked={suggestions.exemplars[i].checked}
								/>
								<label for={exemplars.name + i + ''}>{exemplars.name}</label>
							</div>
						{/each}
					{/if}
					{#if suggestions.context !== undefined && suggestions.context.length !== 0}
						<b><span class="context">Context</span></b>
						{#each suggestions.context as context, i}
							<div class="flex items-center">
								<input
									type="checkbox"
									id={context.name + i + ''}
									name={context.name + i + ''}
									bind:checked={suggestions.context[i].checked}
								/>
								<label for={context.name + i + ''}>{context.name}</label>
							</div>
						{/each}
					{/if}
				</div>
				<button
					class="btn border rounded-full mt-2"
					on:click={() => {
						revise();
					}}>Revise Prompt</button
				>
			{/if}
			{#if revisedPrompt !== ''}
				<h2>Revised Prompt</h2>
				<h3>{revisedPrompt}</h3>
				<!-- button: enter as input prompt -->
				<button
					class="btn border rounded-full"
					on:click={() => {
						input = revisedPrompt;
					}}>Enter as input prompt</button
				>
			{/if}
		{/if}
	</div>
</div>

<style lang="postcss">
	:global(span.task) {
		color: #fdffb6 !important;
	}
	:global(span.context) {
		color: #ffadad !important;
	}
	:global(span.exemplars) {
		color: #ffd6a5 !important;
	}
	:global(span.persona) {
		color: #9bf6ff !important;
	}
	:global(span.format) {
		color: #caffbf !important;
	}
	:global(span.tone) {
		color: #ffc6ff !important;
	}
</style>
