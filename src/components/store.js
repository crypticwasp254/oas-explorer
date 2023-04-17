import { writable } from 'svelte/store';

const source = writable('');
const specification = writable({});

export { source, specification };
