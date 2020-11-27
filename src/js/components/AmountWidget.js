import { select, settings } from '../settings.js';
import { BaseWidget } from './BaseWidget.js';

export class AmountWidget extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.amountWidget.defaultValue);
    const amountWidget = this;

    amountWidget.getElements();
    amountWidget.initActions();
    amountWidget.dom.input.value = amountWidget.correctValue;
  }

  getElements() {
    const amountWidget = this;

    amountWidget.dom.input = amountWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    amountWidget.dom.linkDecrease = amountWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    amountWidget.dom.linkIncrease = amountWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  isValid(value) {
    return (
      !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax
    );
  }

  initActions() {
    const amountWidget = this;

    amountWidget.dom.input.addEventListener('change', function () {
      amountWidget.value = amountWidget.dom.input.value;
    });
    amountWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      amountWidget.value--;
    });
    amountWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      amountWidget.value++;
    });
  }

  renderValue() {
    const amountWidget = this;

    amountWidget.dom.input.value = amountWidget.value;
  }
}
