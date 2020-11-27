export class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const baseWidget = this;

    baseWidget.dom = {};
    baseWidget.dom.wrapper = wrapperElement;
    baseWidget.correctValue = initialValue;
  }

  get value() {
    const baseWidget = this;
    return baseWidget.correctValue;
  }

  set value(value) {
    const baseWidget = this;

    const newValue = baseWidget.parseValue(value);

    if (newValue != baseWidget.correctValue && baseWidget.isValid(newValue)) {
      baseWidget.correctValue = newValue;
      baseWidget.announce();
    }

    baseWidget.renderValue();
  }

  parseValue(value) {
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value);
  }

  renderValue() {
    // eslint-disable-next-line no-unused-vars
    const baseWidget = this;
    // console.log(baseWidget.value);
  }

  announce() {
    const baseWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });

    baseWidget.dom.wrapper.dispatchEvent(event);
  }
}
