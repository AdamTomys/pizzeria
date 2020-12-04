import { BaseWidget } from './BaseWidget.js';
import { settings, classNames, select } from '../settings.js';
import { utils } from '../utils.js';

export class HourPicker extends BaseWidget {
  constructor(wrapper, allTables) {
    super(wrapper, settings.hours.open);
    const hourPickerWidget = this;

    hourPickerWidget.tables = allTables;

    hourPickerWidget.dom.input = hourPickerWidget.dom.wrapper.querySelector(
      select.widgets.hourPicker.input
    );
    hourPickerWidget.dom.output = hourPickerWidget.dom.wrapper.querySelector(
      select.widgets.hourPicker.output
    );

    hourPickerWidget.initPlugin();
    hourPickerWidget.value = hourPickerWidget.dom.input.value;
  }

  initPlugin() {
    const hourPickerWidget = this;
    rangeSlider.create(hourPickerWidget.dom.input);

    hourPickerWidget.dom.input.addEventListener('input', function () {
      for (let table of hourPickerWidget.tables) {
        table.classList.remove(classNames.booking.tableChoosen);
      }
      hourPickerWidget.value = hourPickerWidget.dom.input.value;
    });
  }

  parseValue(value) {
    return utils.numberToHour(value);
  }

  // eslint-disable-next-line no-unused-vars
  isValid(value) {
    return true;
  }

  renderValue() {
    const hourPickerWidget = this;
    hourPickerWidget.dom.output.innerHTML = hourPickerWidget.value;
  }
}
