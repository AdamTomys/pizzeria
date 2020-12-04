/* eslint-disable no-prototype-builtins */
import { classNames, settings, templates, select } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';

export class Booking {
  constructor(bookingWrapper) {
    const booking = this;

    booking.render(bookingWrapper);
    booking.initActions();
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
    booking.dom.tables = bookingWrapper.querySelectorAll(select.booking.tables);
    booking.dom.phone = bookingWrapper.querySelector(select.booking.phoneInput);
    booking.dom.address = bookingWrapper.querySelector(
      select.booking.addressInput
    );
    booking.dom.bookingButton = bookingWrapper.querySelector(
      select.booking.bookingButton
    );
  }

  initActions() {
    const booking = this;

    for (let table of booking.dom.tables) {
      table.addEventListener('click', function (event) {
        event.preventDefault();
        booking.choosenTable = this;
        booking.toggleTable(booking.choosenTable);
      });
    }

    booking.dom.bookingButton.addEventListener('click', function (event) {
      event.preventDefault();
      booking.confirmBooking();
    });
  }

  toggleTable(clickedTable) {
    const booking = this;

    if (!clickedTable.classList.contains(classNames.booking.tableChoosen)) {
      for (let table of booking.dom.tables) {
        table.classList.remove(classNames.booking.tableChoosen);
      }
      clickedTable.classList.add(classNames.booking.tableChoosen);
    } else {
      clickedTable.classList.remove(classNames.booking.tableChoosen);
    }
  }

  initWidgets() {
    const booking = this;

    booking.peopleAmount = new AmountWidget(booking.dom.peopleAmount);
    booking.hoursAmount = new AmountWidget(booking.dom.hoursAmount);
    booking.datePicker = new DatePicker(
      booking.dom.datePicker,
      booking.dom.tables
    );
    booking.hourPicker = new HourPicker(
      booking.dom.hourPicker,
      booking.dom.tables
    );
    booking.dom.wrapper.addEventListener('updated', function (event) {
      event.preventDefault();
      booking.updateDOM();
    });
  }

  confirmBooking() {
    const booking = this;

    if (!booking.hasOwnProperty('choosenTable')) {
      booking.showAlert('Mamma Mia !', 'Which table do You want to book?', 500);
      return;
    }

    const url = settings.db.url + '/' + settings.db.booking;

    const startersArray = [];
    const starters = booking.dom.wrapper.querySelectorAll(
      'input[name="starter"]'
    );
    for (const starter of starters) {
      if (starter.checked == true) {
        startersArray.push(starter.value);
      }
    }

    const payload = {
      date: booking.datePicker.value,
      hour: booking.hourPicker.value,
      table: parseInt(booking.choosenTable.getAttribute('data-table')),
      repeat: false,
      duration: booking.hoursAmount.value,
      ppl: booking.peopleAmount.value,
      starters: startersArray,
      phone: booking.dom.phone.value,
      address: booking.dom.address.value
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log(parsedResponse);
      });

    booking.getData();
    booking.updateDOM();
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
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const booking = this;

    booking.booked = {};
    for (const reservation of eventsCurrent) {
      // console.log(reservation);
      booking.makeBooked(
        reservation.date,
        reservation.hour,
        reservation.duration,
        reservation.table
      );
    }

    for (const reservation of bookings) {
      console.log(reservation);
      booking.makeBooked(
        reservation.date,
        reservation.hour,
        reservation.duration,
        reservation.table
      );
    }

    for (const reservation of eventsRepeat) {
      // console.log(reservation);
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
    booking.updateDOM();
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
  }

  updateDOM() {
    const booking = this;

    booking.date = booking.datePicker.value;
    booking.hour = utils.hourToNumber(booking.hourPicker.value);
    const bookedTables = booking.booked[booking.date][booking.hour];

    for (let table of booking.dom.tables) {
      const tableNumber = table.getAttribute(settings.booking.tableIdAttribute);
      if (
        booking.booked.hasOwnProperty(booking.date) &&
        booking.booked[booking.date].hasOwnProperty(booking.hour) &&
        bookedTables.includes(parseInt(tableNumber))
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
        table.classList.remove(classNames.booking.tableChoosen);
      }
    }
  }

  showAlert(titleText, subtitleText, topPixels) {
    if (document.getElementById('alertBox')) {
      return;
    }

    let allertObj = document
      .querySelector('.header__wrapper')
      .appendChild(document.createElement('div'));
    allertObj.id = 'alertBox';
    allertObj.style.top = topPixels + 'px';

    let imageDiv = allertObj.appendChild(document.createElement('div'));
    let descriptionDiv = allertObj.appendChild(document.createElement('div'));

    let image = imageDiv.appendChild(document.createElement('img'));
    image.src = 'images/pizzaman.png';
    image.classList.add('pizzaman');

    let msgTitle = descriptionDiv.appendChild(document.createElement('h1'));
    msgTitle.classList.add('message_title');
    msgTitle.innerText = titleText;

    let msgSubtitle = descriptionDiv.appendChild(document.createElement('h2'));
    msgSubtitle.classList.add('message_subtitle');
    msgSubtitle.innerText = subtitleText;

    let button = descriptionDiv.appendChild(document.createElement('button'));
    button.id = 'closeButton';
    button.classList.add('btn-secondary');
    button.innerText = 'Got it !';

    button.addEventListener('click', function () {
      document.querySelector('.header__wrapper').removeChild(allertObj);
    });
  }
}
