import { select, classNames, settings, templates } from '../settings.js';
import { utils } from '../utils.js';
import { CartProduct } from './CartProduct.js';

export class Cart {
  constructor(element) {
    const cart = this;

    cart.getElements(element);
    cart.products = [];
    cart.deliveryFee = settings.cart.defaultDeliveryFee;
    cart.dom.delivery.innerHTML = cart.deliveryFee;

    cart.initActions();
  }

  getElements(element) {
    const cart = this;

    cart.dom = {};
    cart.dom.wrapper = element;
    cart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
    cart.dom.productList = element.querySelector(select.cart.productList);
    cart.dom.delivery = element.querySelector(select.cart.deliveryFee);
    cart.renderTotalsKeys = [
      'totalNumber',
      'totalPrice',
      'subtotalPrice',
      'deliveryFee'
    ];
    for (let key of cart.renderTotalsKeys) {
      cart.dom[key] = cart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
    cart.dom.form = element.querySelector(select.cart.form);
    cart.dom.phone = element.querySelector(select.cart.phone);
    cart.dom.address = element.querySelector(select.cart.address);
  }

  toggleCart() {
    const cart = this;
    const cartDivClassList = cart.dom.wrapper.classList;

    if (!cartDivClassList.contains(classNames.cart.wrapperActive)) {
      cartDivClassList.add(classNames.cart.wrapperActive);
    } else {
      cartDivClassList.remove(classNames.cart.wrapperActive);
    }
  }

  showEmptyBasketAlert() {
    if (document.getElementById('alertBox')) {
      return;
    }

    let allertObj = document
      .querySelector('.header__wrapper')
      .appendChild(document.createElement('div'));
    allertObj.id = 'alertBox';
    console.log(allertObj);

    let imageDiv = allertObj.appendChild(document.createElement('div'));
    let descriptionDiv = allertObj.appendChild(document.createElement('div'));

    let image = imageDiv.appendChild(document.createElement('img'));
    image.src = 'images/pizzaman.png';
    image.classList.add('pizzaman');

    let msgTitle = descriptionDiv.appendChild(document.createElement('h1'));
    msgTitle.classList.add('message_title');
    msgTitle.innerText = 'Your basket is empty !';

    let msgSubtitle = descriptionDiv.appendChild(document.createElement('h2'));
    msgSubtitle.classList.add('message_subtitle');
    msgSubtitle.innerText = 'Please add some products';

    let button = descriptionDiv.appendChild(document.createElement('button'));
    button.id = 'closeButton';
    button.classList.add('btn-secondary');
    button.innerText = 'Got it !';

    button.addEventListener('click', function () {
      document.querySelector('.header__wrapper').removeChild(allertObj);
    });
  }

  initActions() {
    const cart = this;
    cart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      cart.toggleCart();
    });
    cart.dom.productList.addEventListener('remove', function (event) {
      event.preventDefault();
      cart.remove(event.detail.cartProduct);
    });
    cart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (cart.products.length > 0) {
        cart.sendOrder();
      } else {
        cart.showEmptyBasketAlert();
      }
    });
  }

  sendOrder() {
    const cart = this;
    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: cart.dom.address.value,
      phone: cart.dom.phone.value,
      totalNumber: cart.totalNumber,
      subtotalNumber: cart.subtotalNumber,
      deliveryFee: cart.deliveryFee,
      totalPrice: cart.totalPrice,
      products: []
    };
    for (const eachProduct of cart.products) {
      const data = eachProduct.getDataToOrder();
      payload.products.push(data);
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    };

    fetch(url, options)
      .then(function (response) {
        console.log(response);
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }

  add(menuProduct) {
    const cart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    cart.dom.productList = generatedDOM;
    /* find menu container */
    const menuContainer = document.querySelector(select.cart.productList);
    /* add element to menu */
    menuContainer.appendChild(generatedDOM);
    cart.products.push(new CartProduct(menuProduct, generatedDOM));
    cart.update();
  }

  update() {
    const cart = this;
    cart.totalNumber = 0;
    cart.subtotalPrice = 0;
    for (let eachProduct of cart.products) {
      cart.subtotalPrice += eachProduct.singlePrice * eachProduct.amount;
      cart.totalNumber += eachProduct.amount;
    }
    cart.totalPrice = cart.subtotalPrice + cart.deliveryFee;

    for (let key of cart.renderTotalsKeys) {
      for (let elem of cart.dom[key]) {
        elem.innerHTML = cart[key];
      }
    }
  }

  remove(cartProduct) {
    const cart = this;

    const index = cart.products.indexOf(cartProduct);
    cart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    cart.update();
  }
}
