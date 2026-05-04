class Notify {
	constructor(container) {
		this.lang = {
			from: notifyFrom,
		};

		this.container = document.querySelector(container);
		this.items = document.createElement('ul');
		this.items.classList.add('notifications__items');
		this.container.appendChild(this.items);
	}

	create({ name, address, desc, img, time }) {
		const html = `
                  <div class="notifications__item__img">
                      <img src="${img}" alt="prize-img" sizes="" srcset="">
                  </div>
                  <div class="notifications__item__content">
                      <div class="notifications__item__content__header">
                          <span class="notifications__item-name">${name}</span>
                          ${this.lang.from}
                          <span class="notifications__item-address">${address}</span>
                      </div>
                      <div class="notifications__item__content__desc">
                          ${desc}
                      </div>
                      <div class="notifications__item__content__bottom">
                          <div class="notifications__item__time">
                              ${time}
                          </div>
                          <div class="notifications__item__icons">
                              <img src="./assets/notification-ok.png" alt="">
                          </div>
                      </div>
                  </div>
                  <div class="notifications__item__btn">
                      <img class="notifications__item__btn-close" src="./assets/notifications-close.png" height="15px" width="15px" alt="">
                  </div>
                `;
		const item = document.createElement('li');
		item.classList.add('notifications__item', 'showNoty');
		item.innerHTML = html;
		item.addEventListener('click', e => e.currentTarget.remove());
		return item;
	}
	send(obj) {
		const item = this.create(obj);
		this.items.prepend(item);
		return item;
	}

	hide(element) {
		setTimeout(() => {
			element.classList.remove('showNoty');
			element.classList.add('hiddenNoty');
			setTimeout(() => {
				element.remove();
			}, 1500);
		}, 7500);
	}
}

const notify = new Notify('.notifications');
const timer = ms => {
	return new Promise((res, rej) => {
		setTimeout(() => res(), ms);
	});
};

const random = (min, max) => Math.round(min + Math.random() * (max - min));
const timeoutMs = 20000;

notifyData.forEach((el, i) => {
	timer(i ? random(60000, 180000) : timeoutMs).then(() => {
		const item = notify.send(el);
		notify.hide(item);
	});
});
