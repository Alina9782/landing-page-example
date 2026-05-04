import { contentWrapper, popupWrapper } from './__script.js';

export const shortAnimDuration = parseInt(
	getComputedStyle(document.documentElement).getPropertyValue('--anim-duration-short'),
	10
); // value in ms, e.g. 400
export const longAnimDuration = parseInt(
	getComputedStyle(document.documentElement).getPropertyValue('--anim-duration-long'),
	10
); // value in ms, e.g. 600

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export const preloadedImages = new Map();

export function preloadTemplateImages() {
	const templates = document.querySelectorAll('template');

	templates.forEach(template => {
		const images = template.content.querySelectorAll('img');
		images.forEach(img => {
			const image = new Image();
			image.src = img.src;
			preloadedImages.set(img.src, image);
		});
	});
}

export function insertTemplate(templateId, options = {}) {
	const { method = 'prepend', container = contentWrapper } = options;

	const template = document.getElementById(templateId);
	const content = template.content.cloneNode(true);

	const images = content.querySelectorAll('img');
	images.forEach(img => {
		if (preloadedImages.has(img.src)) {
			img.src = preloadedImages.get(img.src).src;
		}
	});

	if (method === 'prepend') {
		container.prepend(content);
	} else if (method === 'append') {
		container.append(content);
	} else if (method === 'replace') {
		container.innerHTML = '';
		container.append(content);
	}
}

export function insertPopupTemplate(templateId, options = {}) {
	insertTemplate(templateId, { container: popupWrapper, ...options });
}

export async function clearContentWrapper(duration = shortAnimDuration) {
	document.body.classList.add('close-anim');
	await wait(duration);
	contentWrapper.innerHTML = '';
	document.body.classList.remove('close-anim');
}

export function observeElementVisibility(container, durationMs, callback, minPixels = 500, minRatio = 0.5) {
	if (!container || typeof callback !== 'function') return;

	let totalVisibleTime = 0;
	let isVisible = false;
	let timeoutId = null;

	const observer = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				const visibleHeight = entry.intersectionRect.height;
				const visibleRatio = entry.intersectionRatio;

				// Condition: At least `minRatio` of the element is visible OR `minPixels` is visible
				if (visibleRatio >= minRatio || visibleHeight >= minPixels) {
					if (!isVisible) isVisible = true;

					if (timeoutId === null) {
						timeoutId = setInterval(() => {
							totalVisibleTime += 100; // Increment time by 100ms
							if (totalVisibleTime >= durationMs) {
								callback(); // Execute the callback
								observer.disconnect(); // Stop observing
								clearInterval(timeoutId); // Stop counting
							}
						}, 100);
					}
				} else {
					// Reset timer if the element is no longer visible
					isVisible = false;
					clearInterval(timeoutId);
					timeoutId = null;
				}
			});
		},
		{ threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
	);

	observer.observe(container);
}
