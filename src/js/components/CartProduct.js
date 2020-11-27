import { select } from '../settings.js';
import { AmountWidget } from './AmountWidget.js';

export class CartProduct {
  constructor(menuProduct, element) {
    const cartProduct = this;
    cartProduct.id = menuProduct.id;
    cartProduct.name = menuProduct.name;
    cartProduct.totalPrice = menuProduct.totalPrice;
    cartProduct.singlePrice = menuProduct.singlePrice;
    cartProduct.amount = menuProduct.amount;
    cartProduct.params = JSON.parse(JSON.stringify(menuProduct.choosenParams));

    cartProduct.getElements(element);
    cartProduct.initAmountWidget();
    cartProduct.initActions();
  }

  getElements(element) {
    const cartProduct = this;

    cartProduct.dom = {};
    cartProduct.dom.wrapper = element;
    cartProduct.dom.amountWidget = element.querySelector(
      select.cartProduct.amountWidget
    );
    cartProduct.dom.price = element.querySelector(select.cartProduct.price);
    cartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    cartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
  }

  initAmountWidget() {
    const cartProduct = this;
    cartProduct.amountWidget = new AmountWidget(cartProduct.dom.amountWidget);
    cartProduct.amountWidget.value = cartProduct.amount;
    cartProduct.dom.amountWidget.addEventListener('updated', function (event) {
      event.preventDefault();
      cartProduct.amount = cartProduct.amountWidget.value;
      cartProduct.price = cartProduct.singlePrice * cartProduct.amount;
      cartProduct.dom.price.innerHTML = cartProduct.price;
      // app.cart.update();
      const cartUpdateEvent = new CustomEvent('update-cart', {
        bubbles: true,
        detail: {
          product: cartProduct
        }
      });
      cartProduct.dom.wrapper.dispatchEvent(cartUpdateEvent);
    });
  }

  removeProduct() {
    const cartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: cartProduct
      }
    });

    cartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions() {
    const cartProduct = this;

    cartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
      console.log('EDIT');
    });
    cartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      cartProduct.removeProduct();
    });
  }

  getDataToOrder() {
    const cartProduct = this;

    const productOrderData = {};
    productOrderData.id = cartProduct.id;
    productOrderData.amount = cartProduct.amount;
    productOrderData.singlePrice = cartProduct.singlePrice;
    productOrderData.totalPrice = cartProduct.totalPrice;
    productOrderData.params = cartProduct.params;

    return productOrderData;
  }
}
