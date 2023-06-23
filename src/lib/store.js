import { writable } from 'svelte/store';

const source = writable('');
const specification = writable({
    tags: []
});

const tagScrollSync = writable('');

// storage
// /**@type {import('localforage')} */
const docStore = writable();
const stateStore = writable();
const currentDoc = writable();

export { source, specification, tagScrollSync, docStore, stateStore, currentDoc };
