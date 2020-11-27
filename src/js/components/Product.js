/* eslint-disable no-prototype-builtins */
import { select, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './AmountWidget.js';

export class Product {
  constructor(id, data) {
    const product = this;
    product.id = id;
    product.data = data;

    product.renderInMenu();
    product.getElements();
    product.initAccordion();
    product.initOrderForm();
    product.initAmountWidget();
    product.processOrder();
  }

  renderInMenu() {
    const product = this;
    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(product.data);
    /* create element using utils.createElementFromHTML */
    product.element = utils.createDOMFromHTML(generatedHTML);
    product.defaultElement = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(product.element);
  }

  getElements() {
    const product = this;
    product.accordionTrigger = product.element.querySelector(
      select.menuProduct.clickable
    );
    product.form = product.element.querySelector(select.menuProduct.form);
    product.formInputs = product.form.querySelectorAll(select.all.formInputs);
    product.cartButton = product.element.querySelector(
      select.menuProduct.cartButton
    );
    product.priceElem = product.element.querySelector(
      select.menuProduct.priceElem
    );
    product.imageWrapper = product.element.querySelector(
      select.menuProduct.imageWrapper
    );
    product.amountWidgetElem = product.element.querySelector(
      select.menuProduct.amountWidget
    );
  }

  initAccordion() {
    // const product = this;
    // /* find the clickable trigger (the element that should react to click) */
    // // const productHeader = product.element.querySelector(select.menuProduct.clickable);
    // /* START: click event listener to trigger */
    // product.accordionTrigger.addEventListener('click', function (event) {
    //   /* prevent default action for evet */
    //   event.preventDefault();
    //   /* toggle active class on element of thisProduct */
    //   product.element.classList.add(classNames.menuProduct.wrapperActive);
    //   /* find all active products */
    //   let activeProducts = document.querySelectorAll('article.active');
    //   /* START LOOP: for each active product */
    //   for (let eachProduct of activeProducts) {
    //     /* START: if the active product isn't the element of thisProduct */
    //     if (eachProduct != product.element) {
    //       /* remove class active for the active product */
    //       eachProduct.classList.remove(classNames.menuProduct.wrapperActive);
    //     }
    //   }
    // });

    const product = this;
    const productHeader = product.element.querySelector('header');
    productHeader.addEventListener('click', function (event) {
      event.preventDefault();
      const clickedElement = this;
      let clickedProduct = clickedElement.parentNode;
      if (
        !clickedProduct.classList.contains('active') &&
        clickedProduct == product.element
      ) {
        clickedProduct.classList.add('active');
        const allActiveArticles = document.querySelectorAll('article.active');
        for (let eachArticle of allActiveArticles) {
          if (eachArticle != product.element) {
            eachArticle.classList.remove('active');
          }
        }
        return;
      }
      if (
        clickedProduct.classList.contains('active') &&
        clickedProduct == product.element
      ) {
        clickedProduct.classList.remove('active');
      }
    });
  }

  initOrderForm() {
    const product = this;
    product.form.addEventListener('submit', function (event) {
      event.preventDefault();
      product.processOrder();
    });
    for (let input of product.formInputs) {
      input.addEventListener('change', function () {
        product.processOrder();
      });
    }
    product.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      product.processOrder();
      const addToCartEvent = new CustomEvent('add-to-cart', {
        bubbles: true,
        detail: {
          product: product
        }
      });
      product.element.dispatchEvent(addToCartEvent);
      product.setProductDefaultOptions();
    });
  }

  setProductDefaultOptions() {
    const product = this;

    product.element.innerHTML = product.defaultElement.innerHTML;
    product.getElements();
    product.initAccordion();
    product.initOrderForm();
    product.initAmountWidget();
    product.processOrder();
  }

  processOrder() {
    const product = this;
    const formData = utils.serializeFormToObject(product.form);
    product.choosenParams = {};
    /* set variable price to equal thisProduct.data.price */
    let price = product.data.price;
    /* START LOOP: each param in this product */
    for (const paramId in product.data.params) {
      /* save the element in thisProduct.data.params with key paramId as const param */
      const param = product.data.params[paramId];
      /* START LOOP: for each optionId in param.options */
      for (const optionId in param.options) {
        /* save the element in param.options with key optionId as const option */
        const option = param.options[optionId];
        const optionSelected =
          formData.hasOwnProperty(paramId) &&
          formData[paramId].indexOf(optionId) > -1;
        /* START IF: if option is selected and option is not default */
        if (optionSelected && !option.default) {
          /* add price of option to variable price */
          price = price + option.price;
          /* END IF: if option is selected and option is not default */
          /* START ELSE IF: if option is not selected and option is default */
        } else if (!optionSelected && option.default) {
          /* deduct price of option from price */
          price = price - option.price;
          /* END ELSE IF: if option is not selected and option is default */
        }
        if (optionSelected) {
          let images = product.imageWrapper.querySelectorAll(
            '.' + paramId + '-' + optionId
          );
          for (let image of images) {
            image.classList.add(classNames.menuProduct.imageVisible);
          }
          if (!product.choosenParams[paramId]) {
            product.choosenParams[paramId] = {
              label: param.label,
              options: {}
            };
          }
          product.choosenParams[paramId].options[optionId] = option.label;
        } else {
          let images = product.imageWrapper.querySelectorAll(
            '.' + paramId + '-' + optionId
          );
          for (let image of images) {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    /* set the contents of thisProduct.priceElem to be the value of variable price */
    product.singlePrice = price;
    product.totalPrice = product.singlePrice * product.amountWidget.value;
    product.priceElem.innerHTML = product.totalPrice;

    product.name = product.data.name;
    product.amount = product.amountWidget.value;
  }

  initAmountWidget() {
    const product = this;
    product.amountWidget = new AmountWidget(product.amountWidgetElem);
    product.amountWidgetElem.addEventListener('updated', function (event) {
      event.preventDefault();
      product.processOrder();
    });
  }
}
