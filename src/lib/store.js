import { writable } from 'svelte/store';

const source = writable('');
const specification = writable({
    tags: []
});

const tagScrollSync = writable('');

export { source, specification, tagScrollSync };
