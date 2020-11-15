/* eslint-disable no-prototype-builtins */
/* eslint-disable no-console */
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
{
  // eslint-disable-next-line no-unused-expressions
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product'
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]'
      }
    }
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active'
    }
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    )
    /* Handlebars.compile przekształca szablon HTML pobrany za pomocą selektora
    select.templateOf.menuProduct, czyli #template-menu-product, na funkcję, która
    przyjmuje jeden argument (obiekt, z którego szablon ma pobrac dane do uzupełnienia
      wyznaczonych pól) */
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
      console.log('Product', product);
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
      product.accordionTrigger = product.element.querySelector(select.menuProduct.clickable);
      product.form = product.element.querySelector(select.menuProduct.form);
      product.formInputs = product.form.querySelectorAll(select.all.formInputs);
      product.cartButton = product.element.querySelector(select.menuProduct.cartButton);
      product.priceElem = product.element.querySelector(select.menuProduct.priceElem);
      product.imageWrapper = product.element.querySelector(select.menuProduct.imageWrapper);
      product.amountWidgetElem = product.element.querySelector(select.menuProduct.amountWidget);
    }
    
    initAccordion() {
      const product = this;
      /* find the clickable trigger (the element that should react to click) */
      // const productHeader = product.element.querySelector(select.menuProduct.clickable);
      /* START: click event listener to trigger */
      product.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for evet */
        event.preventDefault();
        /* toggle active class on element of thisProduct */
        product.element.classList.add(classNames.menuProduct.wrapperActive);
        /* find all active products */
        let activeProducts = document.querySelectorAll('article.active');
        /* START LOOP: for each active product */
        for(let eachProduct of activeProducts) {
          /* START: if the active product isn't the element of thisProduct */
          if(eachProduct != product.element) {
            /* remove class active for the active product */
            eachProduct.classList.remove(classNames.menuProduct.wrapperActive);
          }
        }
      });
      
      // const product = this;
      // const productHeader = product.element.querySelector('header');
      // productHeader.addEventListener('click', function(event) {
      //   event.preventDefault();
      //   const clickedElement = this;
      //   let clickedProduct = clickedElement.parentNode; 
      //   if(!clickedProduct.classList.contains('active') && clickedProduct == product.element) {
      //     clickedProduct.classList.add('active');
      //     const allActiveArticles = document.querySelectorAll('article.active');
      //     for(let eachArticle of allActiveArticles) {
      //       if(eachArticle != product.element) {
      //         eachArticle.classList.remove('active');
      //       }
      //     }
      //     return;
      //   }
      //   if(clickedProduct.classList.contains('active') && clickedProduct == product.element) {
      //     clickedProduct.classList.remove('active');
      //   };
      // });
    }
    
    initOrderForm() {
      const product = this;
      product.form.addEventListener('submit', function(event) {
        event.preventDefault();
        product.processOrder();
      });
      for(let input of product.formInputs) {
        input.addEventListener('change', function() {
          product.processOrder();
        });
      }
      product.cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        product.processOrder();
      });
    }
    
    processOrder() {
      const product = this;
      const formData = utils.serializeFormToObject(product.form);
      // console.log('formData', formData);
      let price = product.data.price;
      /* START LOOP: each param in this product */
      for(const paramId in product.data.params) {
        // console.log('paramId', paramId);
        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = product.data.params[paramId];
        /* START LOOP: for each optionId in param.options */
        for(const optionId in param.options) {
          // console.log('optionId', optionId);
          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];
          // console.log('option', option);
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          // console.log(formData[paramId].indexOf(optionId));
          // console.log(optionSelected);
          /* START IF: if option is selected and option is not default */
          if(optionSelected && !option.default) {
          /* add price of option to variable price */
            price = price + option.price;
          /* END IF: if option is selected and option is not default */
          /* START ELSE IF: if option is not selected and option is default */
          } else if (!optionSelected && option.default) {
          /* deduct price of option from price */
            price = price - option.price;
          /* END ELSE IF: if option is not selected and option is default */
          }
          if(optionSelected) {
            let images = product.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
            for(let image of images) {
              image.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            let images = product.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
            for(let image of images) {
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      price *= product.amountWidget.value;
      product.priceElem.innerHTML = price;
    }
    
    initAmountWidget() {
      const product = this;
      product.amountWidget = new AmountWidget(product.amountWidgetElem);
      product.amountWidgetElem.addEventListener('updated', function(event) {
        event.preventDefault();
        product.processOrder();
      });
    }
  }
  
  class AmountWidget{
    constructor(element) {
      const widget = this;
      
      widget.getElements(element);
      widget.input.value = settings.amountWidget.defaultValue;
      console.log(widget.value);
      widget.setValue(widget.input.value);
      widget.initActions();
      
      console.log('AmountWidget', widget);
      console.log('constructor arguments', element);
    }
    
    getElements(element) {
      const widget = this;
      
      widget.element = element;
      widget.input = widget.element.querySelector(select.widgets.amount.input);
      widget.linkDecrease = widget.element.querySelector(select.widgets.amount.linkDecrease);
      widget.linkIncrease = widget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    
    setValue(value) {
      const widget = this;
      
      const newValue = parseInt(value);
      
      /* TODO: Add validation */
      if(newValue != widget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        widget.value = newValue;
        widget.announce();
        widget.input.value = widget.value;
      }
    }
    
    initActions() {
      const widget = this;
      
      widget.input.addEventListener('change', function() {
        console.log('change');
        widget.setValue(widget.input.value);
      });
      widget.linkDecrease.addEventListener('click', function(event) {
        event.preventDefault();
        widget.setValue(widget.value - 1);
      });
      widget.linkIncrease.addEventListener('click', function(event) {
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

  const app = {
    initMenu() {
      const thisApp = this;
      // console.log('thisApp.data: ', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData() {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init() {
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    }
  };

  app.init();
}
