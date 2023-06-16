import { writable } from 'svelte/store';

const source = writable('');
const specification = writable({
    tags: []
});

export { source, specification };
