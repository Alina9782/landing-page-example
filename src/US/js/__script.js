import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

import { actualizeDates } from './__date-actualizer.js';
import { setPreffilFrame } from './prefill.js';

const preloadedImages = new Map();

function preloadTemplateImages() {
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

document.addEventListener('DOMContentLoaded', preloadTemplateImages);

function insertTemplate(templateId) {
	const template = document.getElementById(templateId);
	const content = template.content.cloneNode(true);

	const images = content.querySelectorAll('img');
	images.forEach(img => {
		if (preloadedImages.has(img.src)) {
			img.src = preloadedImages.get(img.src).src;
		}
	});

	contentWrapper.prepend(content);
}

export const preloadedProdImgs = [];

preloadImages();
async function preloadImages() {
	[1, 2].forEach((imgType, typeIndex) => {
		const img = new Image();
		img.src = `assets/prize-${imgType}.webp`;
		preloadedProdImgs.push(img);
	});
}

export const contentWrapper = document.querySelector('.main');
export const popupWrapper = document.querySelector('#popup-wrapper');

const userQuizAnswers = [];
const shortAnimDuration = 200; //ms

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function clearContentWrapper(duration = shortAnimDuration) {
	document.body.classList.add('close-anim');
	await wait(duration);
	contentWrapper.innerHTML = '';
	document.body.classList.remove('close-anim');
}

async function useUserWinStatus() {
	initHomeLayout();

	let userWonSaves = getUserWon();
	if (userWonSaves > 0) {
		await clearContentWrapper();

		initProductPage();
		setUserWon(userWonSaves - 1);
	}
}
useUserWinStatus();

function initializeCountdown() {
	const timeCounter = document.querySelector('.time-counter');

	function updateCountdown() {
		const now = new Date();
		const endOfDay = new Date();
		endOfDay.setHours(23, 59, 59, 999);

		const diff = endOfDay - now;

		if (diff <= 0) {
			timeCounter.textContent = '00:00:00';
			return;
		}

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		timeCounter.textContent =
			String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

		requestAnimationFrame(updateCountdown);
	}

	updateCountdown();
}
initializeCountdown();

function initHomeLayout() {
	actualizeDates();

	const homeImgsSlider = new Swiper('.home-img-slider', {
		autoplay: {
			delay: 5000,
			disableOnInteraction: false,
		},
		spaceBetween: 20,
		slidesPerView: 1,
		autoHeight: true,
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
	});

	try {
		document.querySelector('.button.to-next-frame').addEventListener('click', removeHomeLayout, { once: true });
	} catch (error) {}

	async function removeHomeLayout() {
		document.querySelector('.home').classList.add('close-anim');
		await wait(250);

		await clearContentWrapper(600);

		insertTemplate('quiz-template');
		initQuizFrame();
	}
}

async function initQuizFrame() {
	const progressBar = document.querySelector('.quiz .progressbar');

	const quizQuestionsSlider = new Swiper('.quiz-question-slider', {
		allowTouchMove: false,
		effect: 'fade',
		fadeEffect: { crossFade: true },
		virtualTranslate: true,
		speed: 600,
		autoHeight: true,
	});
	const quizAnswersSlider = new Swiper('.quiz-answers-slider', {
		loop: false,
		spaceBetween: 30,
		allowTouchMove: false,
		effect: 'fade',
		fadeEffect: { crossFade: true },
		speed: 600,
		autoHeight: true,
	});
	setTimeout(() => {
		quizQuestionsSlider.updateAutoHeight(500);
		quizAnswersSlider.updateAutoHeight(500);
	}, 250);

	//AnswersSlider controls the QuestionSlider
	quizAnswersSlider.controller.control = quizQuestionsSlider;

	//Handle click on quiz-answers groups
	let clickedLastSlide = false;
	const quizSlidesArr = document.querySelectorAll('.quiz-answers-slider .swiper-slide');
	for (let i = 0; i < quizSlidesArr.length; i++) {
		quizSlidesArr[i].addEventListener('click', async e => {
			if (!e.target.classList.contains('button') || clickedLastSlide) return;
			userQuizAnswers.push({
				questionId: e.target.closest('.swiper-slide').dataset.slideindex,
				answerText: e.target.textContent.trim(),
			});

			const progressPercentage = ((i + 1) / quizSlidesArr.length) * 100;
			progressBar.style.setProperty('--progress-width', `${progressPercentage}%`);

			if (i !== quizSlidesArr.length - 1) {
				quizAnswersSlider.slideNext();
			} else {
				clickedLastSlide = true;

				// document.querySelector('.home').classList.add('close-anim');
				window.scrollTo({ top: 0, behavior: 'smooth' });
				await wait(250);

				await clearContentWrapper(600);
				initLoader();
			}
		});
	}
}

async function initLoader() {
	insertTemplate('loader-template');

	const loadingMessagesArr = document.querySelectorAll('.loading .load-step');
	const progressBar = document.querySelector('#progressbar');

	const MIN_DELAY = 1500;
	const MAX_DELAY = 3500;

	function getRandomDelay() {
		return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
	}

	function fadeOutAndReplaceImage(img, newSrc) {
		img.style.transition = 'opacity 0.1s';
		img.style.opacity = '0';

		setTimeout(() => {
			img.src = newSrc;
			img.onload = () => {
				img.style.opacity = '1';
			};
		}, 300);
	}

	for (let i = 0; i < loadingMessagesArr.length; i++) {
		const delay = getRandomDelay();
		await new Promise(resolve => setTimeout(resolve, delay));

		const progressPercent = Math.round(((i + 1) / loadingMessagesArr.length) * 100);
		if (progressBar) progressBar.style.setProperty('--progress-width', `${progressPercent}%`);

		const step = loadingMessagesArr[i];
		const img = step.querySelector('img');
		if (img) {
			img.classList.remove('_spinning');
			fadeOutAndReplaceImage(img, 'assets/loading-completed.svg');
		}

		if (i + 1 < loadingMessagesArr.length) {
			loadingMessagesArr[i + 1].classList.remove('_hidden');
		}
	}

	await wait(250);
	await clearContentWrapper(600);

	insertTemplate('pre-product-page-template');
	try {
		document.querySelector('.button.to-next-frame').addEventListener(
			'click',
			async () => {
				await clearContentWrapper(600);
				initProductPage();
			},
			{ once: true }
		);
	} catch (error) {}
}

export async function initProductPage() {
	insertTemplate('product-page-template');

	const prodSlider = new Swiper('.prod-slider', {
		autoplay: {
			delay: 5000,
			disableOnInteraction: false,
		},
		spaceBetween: 20,
		slidesPerView: 1,
		autoHeight: true,
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
	});

	let activeTypeIndex = 0;
	let stockCounters = [18, 14, 9];

	initChoosingTypes();
	initStockCounter();
	initSpoiler();

	function initChoosingTypes() {
		const typesArr = document.querySelectorAll('#select-types > button');

		typesArr.forEach((type, typeIndex) => {
			type.addEventListener('click', () => {
				typesArr.forEach(t => t.classList.remove('active'));
				type.classList.add('active');

				// Get the selected color
				const selectedColor = type.getAttribute('data-color');
				
				// Update the color-name span
				const colorNameElement = document.querySelector('#color-name');
				if (colorNameElement) {
					colorNameElement.textContent = selectedColor;
				}

				// Update chosenColor (used in go() function)
				chosenColor = selectedColor;

				// Map color to image set number (White=1, Black=2, Grey=3)
				const colorMap = { 'Olive/Black': 1, 'Carbonite': 2, 'Bone': 3};
				const imageSetNumber = colorMap[selectedColor] || 1;

				// Update all slider images to the correct color variant
				const sliderImages = document.querySelectorAll('.prod-slider .swiper-slide img');
				sliderImages.forEach((img, imgIndex) => {
					img.src = `assets/prize-${imageSetNumber}-${imgIndex + 1}.webp`;
				});

				// Always start with the first slide
				prodSlider.slideTo(0, 600);
				prodSlider.updateAutoHeight(600);

				// Set the stock counter value based on selected color
				const counterElement = document.querySelector('#stock-counter');
				if (counterElement && stockCounters[typeIndex] !== undefined) {
					counterElement.textContent = `(${stockCounters[typeIndex]})`;

					activeTypeIndex = typeIndex;
				}
			});
		});
	}

	function initStockCounter() {
		const counterElement = document.querySelector('#stock-counter');
		if (!counterElement) return;

		const diffdelay = 5000; //ms

		function initNewTimeout() {
			if (!counterElement) return;

			const currentValue = parseInt(counterElement.textContent.replace(/[()]/g, ''), 10);
			if (isNaN(currentValue) || currentValue <= 1) return;

			const decrement = Math.floor(Math.random() * 5) + 1;
			if (currentValue - decrement <= 1) {
				counterElement.textContent = '(1)';
				return;
			}
			counterElement.textContent = `(${currentValue - decrement})`;
			document.querySelector('#product-page-template').content.querySelector('#stock-counter').textContent = `(${
				currentValue - decrement
			})`;

			stockCounters[activeTypeIndex] = currentValue - decrement;

			// Recursively call initNewTimeout after a random delay
			setTimeout(initNewTimeout, Math.floor(Math.random() * (30000 - diffdelay + 1)) + diffdelay);
		}

		// Start the recursive timer
		setTimeout(initNewTimeout, Math.floor(Math.random() * (30000 - diffdelay + 1)) + diffdelay);
	}

	function initSpoiler() {
		const spoilers = document.querySelectorAll('.spoiler');

		spoilers.forEach(spoiler => {
			const header = spoiler.querySelector('.spoiler__header');
			const toggle = spoiler.querySelector('.spoiler__toggle');
			const content = spoiler.querySelector('.spoiler__content');

			header.addEventListener('click', function () {
				const isActive = content.classList.contains('active');

				if (isActive) {
					content.classList.remove('active');
					toggle.classList.remove('active');
					spoiler.classList.remove('active');
				} else {
					content.classList.add('active');
					toggle.classList.add('active');
					spoiler.classList.add('active');
				}
			});
		});
	}

	try {
		document.querySelector('.button.to-next-frame').addEventListener(
			'click',
			async () => {
				document.querySelector('.product-page').classList.add('close-anim');
				await clearContentWrapper(600);
				initCongratsPage();
			},
			{ once: true }
		);
	} catch (error) {}
}

export function initCongratsPage() {
	insertTemplate('congrats-page-template');

	try {
		document.querySelector('.back-button').addEventListener(
			'click',
			async () => {
				try {
					document.querySelector('.congrats-page').classList.add('close-anim');
					await clearContentWrapper(600);
					initProductPage();
				} catch (error) {}
			},
			{ once: true }
		);
	} catch (error) {}

	try {
		document.querySelector('.to-next-frame').addEventListener(
			'click',
			async () => {
				// await saveCongratsTemplateLayout();

				document.querySelector('.congrats-page').classList.add('close-anim');
				await clearContentWrapper(600);
				setPreffilFrame();

				//insert next frame
			},
			{ once: true }
		);
	} catch (error) {
		console.log(error);
	}

	const imgsSlider = new Swiper('.imgs-slider', {
		spaceBetween: 20,
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		autoHeight: true,
		autoplay: {
			delay: 5000,
			disableOnInteraction: false,
		},
	});

	initCongratsDigitCounter();

	function initCongratsDigitCounter() {
		const counters = document.querySelectorAll('.digit-counter__count');
		const minusButtons = document.querySelectorAll('.digit-counter__minus');
		const plusButtons = document.querySelectorAll('.digit-counter__plus');

		// Перевірка та обробка кліків на кнопках "minus"
		minusButtons.forEach(function (button, index) {
			button.addEventListener('click', function () {
				if (parseInt(counters[index].textContent) > 0) {
					counters[index].textContent = parseInt(counters[index].textContent) - 1;
					updateButtonStates();
				}
			});
		});

		// Перевірка та обробка кліків на кнопках "plus"
		plusButtons.forEach(function (button, index) {
			button.addEventListener('click', function () {
				if (parseInt(counters[index].textContent) < 5 && !button.classList.contains('disabled')) {
					counters[index].textContent = parseInt(counters[index].textContent) + 1;
					updateButtonStates();
				}
			});
		});

		// Функція для оновлення стану кнопок
		function updateButtonStates() {
			const submitBtn = document.querySelector('.button.to-next-frame');
			let totalCount = 0;
			counters.forEach(function (counter) {
				totalCount += parseInt(counter.textContent);
			});

			if (totalCount >= 5) {
				submitBtn.removeAttribute('disabled');
			} else {
				submitBtn.setAttribute('disabled', true);
			}

			counters.forEach(function (counter, index) {
				if (parseInt(counter.textContent) <= 0) {
					minusButtons[index].classList.add('disabled');
				} else {
					minusButtons[index].classList.remove('disabled');
				}

				if (parseInt(counter.textContent) >= 5 || totalCount >= 5) {
					plusButtons[index].classList.add('disabled');
				} else {
					plusButtons[index].classList.remove('disabled');
				}
			});
		}
	}

	function saveCongratsTemplateLayout() {
		const digitCountersToSave = document.querySelector('.congrats-page .choose-products').cloneNode(true);
		const buttonToSave = document.querySelector('.congrats-page .buttons-row').cloneNode(true);

		document.querySelector('#congrats-page-template').content.querySelector('.choose-products').innerHTML =
			digitCountersToSave.innerHTML;
		document.querySelector('#congrats-page-template').content.querySelector('.buttons-row').innerHTML =
			buttonToSave.innerHTML;
	}
}
