// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}

interface Suggestions {
	task: { name: string; checked: boolean }[];
	persona: { name: string; checked: boolean }[];
	format: { name: string; checked: boolean }[];
	tone: { name: string; checked: boolean }[];
	exemplars: { name: string; checked: boolean }[];
	context: { name: string; checked: boolean }[];
	[key: string]: any;
}