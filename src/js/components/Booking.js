import { templates, select } from '../settings.js';
import { AmountWidget } from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';

export class Booking {
  constructor(bookingWrapper) {
    const booking = this;

    booking.render(bookingWrapper);
    booking.initWidgets();
  }

  render(bookingWrapper) {
    const booking = this;

    const html = templates.bookingWidget();
    booking.dom = {};
    booking.dom.wrapper = bookingWrapper;
    booking.dom.wrapper.innerHTML = html;
    booking.dom.peopleAmount = bookingWrapper.querySelector(
      select.booking.peopleAmount
    );
    booking.dom.hoursAmount = bookingWrapper.querySelector(
      select.booking.hoursAmount
    );
    booking.dom.datePicker = bookingWrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    booking.dom.hourPicker = bookingWrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
  }

  initWidgets() {
    const booking = this;

    booking.peopleAmount = new AmountWidget(booking.dom.peopleAmount);
    booking.hoursAmount = new AmountWidget(booking.dom.hoursAmount);
    booking.datePicker = new DatePicker(booking.dom.datePicker);
    booking.hourPicker = new HourPicker(booking.dom.hourPicker);
  }
}
