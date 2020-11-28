/* eslint-disable no-prototype-builtins */
import { settings, templates, select } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';

export class Booking {
  constructor(bookingWrapper) {
    const booking = this;

    booking.render(bookingWrapper);
    booking.initWidgets();
    booking.getData();
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

  getData() {
    const booking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(
      booking.datePicker.minDate
    );
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(
      booking.datePicker.maxDate
    );

    const endDate = {};
    endDate[settings.db.dateEndParamKey] =
      startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent:
        settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate)
    };

    const urls = {
      booking:
        settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent:
        settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat:
        settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(function ([
        bookingsResponse,
        eventsCurrentResponse,
        eventsRepeatResponse
      ]) {
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json()
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        booking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

    console.log(params);
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const booking = this;

    booking.booked = {};
    for (const reservation of eventsCurrent) {
      console.log(reservation);
      booking.makeBooked(
        reservation.date,
        reservation.hour,
        reservation.duration,
        reservation.table
      );
    }

    console.log('EVENTSCURRENT');

    for (const reservation of bookings) {
      console.log(reservation);
      booking.makeBooked(
        reservation.date,
        reservation.hour,
        reservation.duration,
        reservation.table
      );
    }

    console.log('BOOKINGS');

    for (const reservation of eventsRepeat) {
      for (let i = 0; i < 14; i++) {
        const newDate = utils.addDays(reservation.date, i);
        const newDateStr = utils.dateToStr(newDate);
        booking.makeBooked(
          newDateStr,
          reservation.hour,
          reservation.duration,
          reservation.table
        );
      }
    }

    console.log('EVENTSREPEAT');
  }

  makeBooked(date, hour, duration, table) {
    const booking = this;

    const hourNumber = utils.hourToNumber(hour);
    if (!booking.booked.hasOwnProperty(date)) {
      booking.booked[date] = {};
    }

    for (let i = 0; i < duration; i += 0.5) {
      if (!booking.booked[date].hasOwnProperty([hourNumber + i])) {
        booking.booked[date][hourNumber + i] = [];
      }
      booking.booked[date][hourNumber + i].push(table);
    }

    console.log(booking.booked);
  }
}
