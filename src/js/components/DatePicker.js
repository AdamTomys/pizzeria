import { BaseWidget } from './BaseWidget.js';
import { utils } from '../utils.js';
import { select, settings } from '../settings.js';

export class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));
    const datePickerWidget = this;

    datePickerWidget.dom.input = datePickerWidget.dom.wrapper.querySelector(
      select.widgets.datePicker.input
    );

    datePickerWidget.initPlugin();
  }

  initPlugin() {
    const datePickerWidget = this;

    datePickerWidget.minDate = new Date(datePickerWidget.value); //extended setter in argument
    datePickerWidget.maxDate = utils.addDays(
      datePickerWidget.value,
      settings.datePicker.maxDaysInFuture
    );

    flatpickr(datePickerWidget.dom.input, {
      defaultDate: datePickerWidget.minDate,
      minDate: datePickerWidget.minDate,
      maxDate: datePickerWidget.maxDate,
      disable: [
        function (date) {
          return date.getDay() === 1;
        }
      ],
      locale: {
        firstDayOfWeek: 1
      },
      onChange: function (dateStr) {
        datePickerWidget.value = dateStr;
        console.log(datePickerWidget.value);
      }
    });
  }

  parseValue(value) {
    return value;
  }

  // eslint-disable-next-line no-unused-vars
  isValid(value) {
    return true;
  }
}
