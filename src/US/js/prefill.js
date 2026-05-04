import { clearContentWrapper, initProductPage } from './__script';
import { insertTemplate } from './utils';

export async function setPreffilFrame() {
	await clearContentWrapper();
	insertTemplate('preffil-template');

	try {
		document.querySelector('#prev-btn').addEventListener('click', async function () {
			await clearContentWrapper();
			initProductPage();
		});
	} catch (error) {
		console.log(error);
	}
}
