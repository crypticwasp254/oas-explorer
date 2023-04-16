// https://web.dev/building-a-theme-switch-component/
// @ts-check
const storageKey = 'theme-preference';

const getColorPreference = () => {
	// if (localStorage.getItem(storageKey)) return localStorage.getItem(storageKey);
	// else return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	// force dark theme
	return 'dark';
};

const theme = {
	value: getColorPreference()
};

const setPreference = () => {
	localStorage.setItem(storageKey, theme.value);
	reflectPreference();
};

const reflectPreference = () => {
	// force dark theme everywhere for now
	document.firstElementChild.setAttribute('color-scheme', theme.value);
	document.querySelector('#theme-toggle')?.setAttribute('aria-label', theme.value);
};

reflectPreference();

window.onload = () => {
	// set on load so screen readers can get the latest value on the button
	reflectPreference();
};

window
	.matchMedia('(prefers-color-scheme: dark)')
	.addEventListener('change', ({ matches: isDark }) => {
		theme.value = isDark ? 'dark' : 'light';
		setPreference();
	});

// @ts-ignore
window.changeTheme = () => {
	theme.value = theme.value === 'light' ? 'dark' : 'light';
	setPreference();
};
