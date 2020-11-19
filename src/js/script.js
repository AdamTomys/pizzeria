/* eslint-disable no-prototype-builtins */
/* eslint-disable no-console */
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
{
  // eslint-disable-next-line no-unused-expressions
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product'
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart'
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select'
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]'
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]'
      }
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]'
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]'
    }
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active'
    },
    cart: {
      wrapperActive: 'active'
    }
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9
    },
    cart: {
      defaultDeliveryFee: 20
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    )
  };

  class Product {
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
        app.cart.add(product);
      });
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

  class AmountWidget {
    constructor(element) {
      const widget = this;

      widget.getElements(element);
      widget.input.value = settings.amountWidget.defaultValue;
      widget.setValue(widget.input.value);
      widget.initActions();
    }

    getElements(element) {
      const widget = this;

      widget.element = element;
      widget.input = widget.element.querySelector(select.widgets.amount.input);
      widget.linkDecrease = widget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      widget.linkIncrease = widget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
    }

    setValue(value) {
      const widget = this;

      const newValue = parseInt(value);

      /* TODO: Add validation */
      if (
        newValue != widget.value &&
        newValue >= settings.amountWidget.defaultMin &&
        newValue <= settings.amountWidget.defaultMax
      ) {
        widget.value = newValue;
        widget.announce();
        widget.input.value = widget.value;
      }
    }

    initActions() {
      const widget = this;

      widget.input.addEventListener('change', function () {
        widget.setValue(widget.input.value);
      });
      widget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        widget.setValue(widget.value - 1);
      });
      widget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        widget.setValue(widget.value + 1);
      });
    }

    announce() {
      const widget = this;

      const event = new Event('updated');
      widget.element.dispatchEvent(event);
    }
  }

  class Cart {
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

    initActions() {
      const cart = this;
      cart.dom.toggleTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        cart.toggleCart();
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
      console.log(cart.products);
      for (let eachProduct of cart.products) {
        cart.subtotalPrice += eachProduct.singlePrice * eachProduct.amount;
        cart.totalNumber += eachProduct.amount;
      }
      cart.totalPrice = cart.subtotalPrice + cart.deliveryFee;

      console.log(cart.totalNumber, cart.subtotalPrice, cart.totalPrice);

      for (let key of cart.renderTotalsKeys) {
        for (let elem of cart.dom[key]) {
          console.log(cart);
          console.log(cart[key]);
          elem.innerHTML = cart[key];
        }
      }
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const cartProduct = this;
      cartProduct.id = menuProduct.id;
      cartProduct.name = menuProduct.name;
      cartProduct.totalPrice = menuProduct.totalPrice;
      cartProduct.singlePrice = menuProduct.singlePrice;
      cartProduct.amount = menuProduct.amount;
      cartProduct.params = JSON.parse(
        JSON.stringify(menuProduct.choosenParams)
      );

      cartProduct.getElements(element);
      cartProduct.initAmountWidget();
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
      cartProduct.dom.amountWidget.addEventListener('updated', function (
        event
      ) {
        event.preventDefault();
        cartProduct.amount = cartProduct.amountWidget.value;
        cartProduct.price = cartProduct.singlePrice * cartProduct.amount;
        cartProduct.dom.price.innerHTML = cartProduct.price;
        app.cart.update();
      });
    }
  }

  const app = {
    initMenu() {
      const thisApp = this;
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData() {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initCart() {
      const thisApp = this;
      const cartWrapper = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartWrapper);
    },

    init() {
      const thisApp = this;

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    }
  };

  app.init();
}
