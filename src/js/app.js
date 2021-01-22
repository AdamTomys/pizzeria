import { Product } from './components/Product.js';
import { Cart } from './components/Cart.js';
import { select, settings, classNames } from './settings.js';
import { Booking } from './components/Booking.js';

const app = {
  initMenu() {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },

  initData() {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;
    /* send url request */
    fetch(url)
      /* if succeed convert raw json data to readable data by .json parse method */
      .then((rawResponse) => rawResponse.json())
      /* execute target method on parsedData */
      .then(function (parsedResponse) {
        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
    /* execute initMenu method */
  },

  initCart() {
    const thisApp = this;
    const cartWrapper = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartWrapper);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
    cartWrapper.addEventListener('update-cart', function (event) {
      event.preventDefault();
      app.cart.update();
    });
  },

  activatePage(pageId) {
    const thisApp = this;

    for (let link of thisApp.navlinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );

      for (let page of thisApp.pages) {
        page.classList.toggle(
          classNames.pages.active,
          page.getAttribute('id') == pageId
        );
      }
    }

    window.location.hash = '#/' + pageId;
  },

  initPages() {
    const thisApp = this;
    thisApp.pages = Array.from(
      document.querySelector(select.containerOf.pages).children
    );
    thisApp.navlinks = Array.from(document.querySelectorAll(select.nav.links));
    // thisApp.activatePage(thisApp.pages[0].id);
    let pagesMatchingHash = [];
    if (window.location.hash.length > 2) {
      const idFromHash = window.location.hash.replace('#/', '');
      pagesMatchingHash = thisApp.pages.filter(function (page) {
        return page.id == idFromHash;
      });
      thisApp.activatePage(
        pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id
      );
    }
    for (let link of thisApp.navlinks) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        let href = link.getAttribute('href');
        const pageId = href.replace('#', '');
        thisApp.activatePage(pageId);
      });
    }
  },

  initBooking() {
    const thisApp = this;
    const bookingWrapper = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingWrapper);
  },

  init() {
    const thisApp = this;

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  }
};

app.init();

// eslint-disable-next-line no-unused-vars
// function validateRequirements(textbox) {
//   if (textbox.value === '') {
//     textbox.style.background = '#ff6b6b';
//     textbox.setCustomValidity('Your phone number is required');
//   } else if (textbox.validity.typeMismatch) {
//     textbox.setCustomValidity('not match');
//   } else {
//     textbox.setCustomValidity('');
//   }

//   return true;
// }
