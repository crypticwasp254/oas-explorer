export const scrollTrigger = (selector, options = {}) => {
	let els = document.querySelectorAll(selector);
	// @ts-ignore
	els = Array.from(els);

	els.forEach((el) => {
		addObserver(el, options);
	});
};

const addObserver = (el, options) => {
	let observer = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('fadeInDown');
				observer.unobserve(entry.target);
			}
		});
	}, options);

	observer.observe(el);
};
