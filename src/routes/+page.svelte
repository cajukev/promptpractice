<script lang="ts">
	import { each } from 'svelte/internal';
	import { objectUtil } from 'zod';

	interface Suggestions {
		task: { name: string; checked: boolean }[];
		persona: { name: string; checked: boolean }[];
		format: { name: string; checked: boolean }[];
		tone: { name: string; checked: boolean }[];
		exemplars: { name: string; checked: boolean }[];
		context: { name: string; checked: boolean }[];
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
		analysedPrompt = emptyPrompt;
		analyzedInput = '';

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
	let analysedPrompt: Prompt = {
		task: [],
		persona: [],
		format: [],
		tone: [],
		exemplars: [],
		context: []
	};

	let loadingSuggest = false;
	let suggestions: Suggestions = {
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
				let prompt: Prompt = data.prompt;
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
				analysedPrompt: analysedPrompt,
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
				analysedPrompt: analysedPrompt,
				missingBlocks: improvementsChecked
			})
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data.prompt);
				let prompt: Prompt = data.prompt;
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
					{#each sixBlocks as type}
						<li>
							{#if analysedPrompt[type].length !== 0}
								<b><span class={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</span></b> - {analysedPrompt[
									type
								] || 'No' + type + 'found'}
							{/if}
						</li>
					{/each}
				</ul>
			</div>

			<div class="space-y-5">
				<!-- Help sections -->
				{#if analyzedInput !== ''}
					<!-- Missing section -->
					{#if sixBlocks.some((type) => analysedPrompt[type].length === 0)}
						<h2>Missing</h2>
						{#each sixBlocks as type}
							{#if analysedPrompt[type].length === 0}
								<div class="flex flex-col items-center">
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
							class="border btn rounded-full"
							on:click={() => {
								suggest();
							}}>suggest</button
						>
						{#if loadingSuggest}
							<p>Suggesting...</p>
						{/if}
						{#if suggestions.task.length !== 0 || suggestions.persona.length !== 0 || suggestions.format.length !== 0 || suggestions.tone.length !== 0 || suggestions.exemplars.length !== 0 || suggestions.context.length !== 0}
							<h2>Suggestions</h2>
							<div>
								{#each sixBlocks as type}
									{#if suggestions[type] !== undefined && suggestions[type].length !== 0}
										<b><span class={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</span></b>
										{#each suggestions[type] as suggestion, i}
											<div class="flex items-center">
												<input
													type="checkbox"
													id={suggestion.name + i + ''}
													name={suggestion.name + i + ''}
													bind:checked={suggestions[type][i].checked}
												/>
												<label for={suggestion.name + i + ''}>{suggestion.name}</label>
											</div>
										{/each}
									{/if}
								{/each}
							</div>
						{/if}
					{/if}

					<!-- Improve section - Opposite of Missing  -->
					<h2>Improve</h2>
					{#each sixBlocks as type}
						{#if analysedPrompt[type].length !== 0}
							<div class="flex flex-col items-center">
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
						class="border btn rounded-full"
						on:click={() => {
							improve();
						}}>improve</button
					>
					{#if loadingImprove}
						Loading Improvements...
					{/if}

					{#if sixBlocks.some((type) => improvements[type].length !== 0)}
						<h2>Improvements</h2>
						<div>
							{#each sixBlocks as type}
								{#if improvements[type] !== undefined && improvements[type].length !== 0}
									<b><span class={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</span></b>
									{#each improvements[type] as improvement, i}
										<div class="flex items-center">
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

						{#if sixBlocks.some((type) => analysedPrompt[type].length !== 0 || improvements[type].length !== 0)}
							<button
								class="btn border rounded-full mt-2"
								on:click={() => {
									revise();
								}}>Revise Prompt</button
							>
						{/if}
					{/if}
				{/if}
			</div>

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
