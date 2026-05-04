export function actualizeDates() {
	const dateArr = document.querySelectorAll('[data-datype]');
	dateArr.forEach(block => {
		const shiftType = block.getAttribute('data-dateshift')
			? 'date'
			: block.getAttribute('data-monthshift')
			? 'month'
			: null;

		if (shiftType === 'month') {
			const shiftValue = parseInt(block.getAttribute('data-monthshift'));
			if (block.getAttribute('data-datype') === 'date') {
				block.textContent = getDateNMonthsAfter(shiftValue).getDate();
			} else if (block.getAttribute('data-datype') === 'month') {
				block.textContent = monthNames[getDateNMonthsAfter(shiftValue).getMonth()];
			} else if (block.getAttribute('data-datype') === 'year') {
				block.textContent = getDateNMonthsAfter(shiftValue).getFullYear();
			}
		} else {
			const shiftValue = parseInt(block.getAttribute('data-dateshift')) || 0;
			if (block.getAttribute('data-datype') === 'date') {
				block.textContent = getDateNDaysAfter(shiftValue).getDate();
			} else if (block.getAttribute('data-datype') === 'month') {
				block.textContent = monthNames[getDateNDaysAfter(shiftValue).getMonth()];
			} else if (block.getAttribute('data-datype') === 'year') {
				block.textContent = getDateNDaysAfter(shiftValue).getFullYear();
			}
		}
	});
}

const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
function getDateNDaysAfter(n) {
	const today = new Date();
	const calcDate = new Date(today);
	calcDate.setDate(today.getDate() + parseInt(n));
	return calcDate;
}

function getDateNMonthsAfter(n) {
	const today = new Date();
	const calcDate = new Date(today);
	calcDate.setMonth(today.getMonth() + parseInt(n));
	return calcDate;
}
