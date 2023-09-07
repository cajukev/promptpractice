<script lang="ts">
	interface Suggestion {
		name: string;
		checked: boolean;
	}

	interface Suggestions {
		task: Suggestion[];
		persona: Suggestion[];
		format: Suggestion[];
		tone: Suggestion[];
		exemplars: Suggestion[];
		context: Suggestion[];
		[key: string]: any;
	}

	interface Prompt {
		task: string[];
		persona: string[];
		format: string[];
		tone: string[];
		exemplars: string[];
		context: string[];
		[key: string]: any;
	}

	interface MissingBlocks {
		task: boolean;
		persona: boolean;
		format: boolean;
		tone: boolean;
		exemplars: boolean;
		context: boolean;
		[key: string]: any;
	}

	let sixBlocks = ['task', 'persona', 'format', 'tone', 'exemplars', 'context'];

	let emptyPrompt: Prompt = {
		task: [],
		persona: [],
		format: [],
		tone: [],
		exemplars: [],
		context: []
	};

	let missingBlocks: MissingBlocks = {
		task: false,
		persona: false,
		format: false,
		tone: false,
		exemplars: false,
		context: false
	};

	let improvementsChecked: MissingBlocks = {
		task: false,
		persona: false,
		format: false,
		tone: false,
		exemplars: false,
		context: false
	};

	let improvements: Suggestions = {
		task: [],
		persona: [],
		format: [],
		tone: [],
		exemplars: [],
		context: []
	};

	$: console.log(missingBlocks);

	let loadingAnalyze = false;
	let analyzePrompt = () => {
		if (loadingAnalyze) return;
		loadingAnalyze = true;
		reset();
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
				analyzedPrompt = data.prompt;
				transformInput(data.prompt);
			})
			.catch((err) => {
				console.log(err);
				loadingAnalyze = false;
			});
	};

	let transformInput = (prompt: Prompt) => {
		let array = sixBlocks.map((type) => {
			return { name: type, value: prompt[type] };
		});
		analyzedInput = input;
		array.forEach((element) => {
			element.value.forEach((value: string) => {
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
	let analyzedPrompt: Prompt = {
		task: [],
		persona: [],
		format: [],
		tone: [],
		exemplars: [],
		context: []
	};

	let loadingSuggest = false;
	let suggestions: Suggestions;
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
				analyzedPrompt: analyzedPrompt,
				missingBlocks: missingBlocks
			})
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data.elements);
				let prompt: Prompt = data.elements;
				sixBlocks.forEach((type) => {
					if (prompt[type]) {
						prompt[type]?.forEach((block: string) => {
							suggestions[type].push({ name: block, checked: false });
						});
					}
				});
				loadingSuggest = false;
				suggestions = { ...suggestions };
			})
			.catch((err) => {
				console.log(err);
				loadingSuggest = false;
			});
	};
	let revisedPrompt = '';
	let loadingRevise = false;
	let revise = () => {
		if (loadingRevise) return;
		loadingRevise = true;
		fetch('/api/RevisePrompt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				prompt: input,
				analyzedPrompt: analyzedPrompt,
				suggestions: suggestions,
				improvements: improvements
			})
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				revisedPrompt = data.text;
				loadingRevise = false;
			})
			.catch((err) => {
				console.log(err);
				loadingRevise = false;
			});
	};

	let loadingImprove = false;
	let improve = () => {
		if (loadingImprove) return;
		loadingImprove = true;
		console.log('Improving...');
		fetch('/api/ImprovePrompt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				prompt: input,
				analyzedPrompt: analyzedPrompt,
				missingBlocks: improvementsChecked
			})
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data.elements);
				let prompt: Prompt = data.elements;
				sixBlocks.forEach((type) => {
					if (prompt[type]) {
						prompt[type]?.forEach((block: string) => {
							improvements[type].push({ name: block, checked: false });
						});
					}
				});
				loadingImprove = false;
				improvements = { ...improvements };
			})
			.catch((err) => {
				console.log(err);
				loadingImprove = false;
			});
	};

	let analyzedInput = '';

	let promptCanBeRevised = false;
	$: promptCanBeRevised =
		(analyzedInput !== '' &&
			sixBlocks.some((type) =>
				suggestions[type].some((suggestion: Suggestion) => suggestion.checked)
			)) ||
		sixBlocks.some((type) =>
			improvements[type].some((improvement: Suggestion) => improvement.checked)
		);

	let restart = () => {
		input = revisedPrompt;
		analyzePrompt();
		reset();
	};

	let reset = () => {
		analyzedPrompt = emptyPrompt;
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
		improvements = {
			task: [],
			persona: [],
			format: [],
			tone: [],
			exemplars: [],
			context: []
		};
		revisedPrompt = '';
	};
</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5 text-center flex flex-col items-center">
		<!-- User enters prompt -> Function call -> App displays analysis -->
		<h2>What would you like your assistant to do?</h2>
		<textarea bind:value={input} class="input w-72 p-2" placeholder="Enter the prompt here" />
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
					{#each sixBlocks as type}
						<li>
							{#if analyzedPrompt[type].length !== 0}
								<b><span class={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</span></b> - {analyzedPrompt[
									type
								] || 'No' + type + 'found'}
							{/if}
						</li>
					{/each}
				</ul>
			</div>

			<div class="grid grid-flow-col gap-4">
				<!-- Help sections -->
				{#if analyzedInput !== ''}
					<!-- Missing section -->
					<div class="w-72">
						{#if sixBlocks.some((type) => analyzedPrompt[type].length === 0)}
							<h2 class="mb-2">Missing</h2>
							{#each sixBlocks as type}
								{#if analyzedPrompt[type].length === 0 || analyzedPrompt[type] === undefined}
									<div class="flex flex-col items-center space-y-2">
										<div class="flex">
											<input
												bind:checked={missingBlocks[type]}
												type="checkbox"
												id={type}
												name={type}
											/>
											<label class="ml-2" for={type}>Suggest {type}</label>
										</div>
									</div>
								{/if}
							{/each}
							<button
								class="border btn rounded-full my-3"
								on:click={() => {
									suggest();
								}}>Suggest</button
							>
							{#if loadingSuggest}
								<p>Loading...</p>
							{/if}
							{#if suggestions.task.length !== 0 || suggestions.persona.length !== 0 || suggestions.format.length !== 0 || suggestions.tone.length !== 0 || suggestions.exemplars.length !== 0 || suggestions.context.length !== 0}
								<h2 class="mb-2">Suggestions</h2>
								<div class="flex flex-col items-center space-y-2">
									{#each sixBlocks as type}
										{#if suggestions[type] !== undefined && suggestions[type].length !== 0}
											<b><span class={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</span></b
											>
											{#each suggestions[type] as suggestion, i}
												<div class="flex items-center gap-2">
													<input
														type="checkbox"
														id={suggestion.name + i + ''}
														name={suggestion.name + i + ''}
														bind:checked={suggestions[type][i].checked}
													/>
													<label class="ml-2" for={suggestion.name + i + ''}
														>{suggestion.name}</label
													>
												</div>
											{/each}
										{/if}
									{/each}
								</div>
							{/if}
						{/if}
					</div>

					<div class="w-72">
						<!-- Improve section - Opposite of Missing  -->
						{#if sixBlocks.some((type) => analyzedPrompt[type].length !== 0)}
							<h2>Improve</h2>
							{#each sixBlocks as type}
								{#if analyzedPrompt[type].length !== 0}
									<div class="flex flex-col items-center space-y-2">
										<div class="flex">
											<input
												bind:checked={improvementsChecked[type]}
												type="checkbox"
												id={type}
												name={type}
											/>
											<label class="ml-2" for={type}>Improve {type}</label>
										</div>
									</div>
								{/if}
							{/each}
							<button
								class="border btn rounded-full my-3"
								on:click={() => {
									improve();
								}}>Improve</button
							>
							{#if loadingImprove}
								<p>Loading...</p>
							{/if}

							{#if sixBlocks.some((type) => improvements[type].length !== 0)}
								<h2>Improvements</h2>
								<div>
									{#each sixBlocks as type}
										{#if improvements[type] !== undefined && improvements[type].length !== 0}
											<b><span class={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</span></b
											>
											{#each improvements[type] as improvement, i}
												<div class="flex items-center gap-2">
													<input
														type="checkbox"
														id={improvement.name + i + ''}
														name={improvement.name + i + ''}
														bind:checked={improvements[type][i].checked}
													/>
													<label for={improvement.name + i + ''}>{improvement.name}</label>
												</div>
											{/each}
										{/if}
									{/each}
								</div>
							{/if}
						{/if}
					</div>
				{/if}
			</div>
			<!-- If one of the suggestions or improvements arrays has a checked element... using the sixBLocks array -->
			{#if promptCanBeRevised}
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
						restart();
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
