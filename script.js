'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  id = (Date.now() + '').slice(-10);
  date = new Date();

  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(distance, duration, coords, cad) {
    super(distance, duration, coords);
    this.cadence = cad;
    this.pace = this.clacPace();
  }

  clacPace() {
    //min/km
    return this.duration / this.distance;
  }
}

class Cycling extends Workout {
  type = 'cyclying';
  constructor(distance, duration, coords, elavationGain) {
    super(distance, duration, coords);
    this.elavationGain = elavationGain;
    this.speed = this.clacSpeed();
  }

  clacSpeed() {
    //km/hr
    return this.distance / (this.duration / 60);
  }
}

class App {
  #map;
  #markerE;
  workoutArr = [];
  html;
  constructor() {
    this.workoutArr.push(13);

    this.#getPosition();

    this.#getLocalStorage();

    form.addEventListener('submit', this.#newWorlout.bind(this));

    inputType.addEventListener('change', this.#toggleElevationField);

    containerWorkouts.addEventListener(
      'click',
      this.#center_the_map.bind(this)
    );
  }

  #getPosition() {
    navigator.geolocation.getCurrentPosition(
      this.#loadMap.bind(this),
      this.alert
    );
  }

  #loadMap(position) {
    console.log(this);
    console.log('bye');
    console.log(position);
    const { longitude } = position.coords;
    const { latitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    if (this.workoutArr !== null) {
      this.workoutArr.forEach(element => {
        L.marker([element.coords])
          .addTo(this.#map)
          .bindPopup(
            L.popup({
              maxWidth: 200,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: `${type}-popup`, //class name
            })
          )
          .setPopupContent(this.#formatDiscription(element)) //content
          .openPopup();
      });
    }

    //on is same as addEventListener
    this.#map.on('click', this.#showForm.bind(this));
  }
  #showForm(e) {
    this.#markerE = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  #toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  #newWorlout(event) {
    event.preventDefault();

    const checkIfNum = function (...values) {
      console.log(values);
      return values.every(val => Number.isFinite(val));
    };

    const checkIfpositive = function (...values) {
      console.log(values);
      return values.every(val => val >= 0);
    };

    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const cadence = +inputCadence.value;
    const elevation = +inputElevation.value;

    const { lat, lng } = this.#markerE.latlng;
    let obj;

    //check if data is valid
    //if workout running create ruuning onject
    if (type === 'running') {
      // const run = new Running();
      if (
        !checkIfNum(distance, duration, cadence) ||
        !checkIfpositive(distance, duration, cadence)
      ) {
        return;
      }
      obj = new Running(distance, duration, [lat, lng], cadence);
    }

    //if workout cycling create cycling onject

    if (type === 'cycling') {
      // const run = new Running();
      if (
        !checkIfNum(distance, duration, elevation) ||
        !checkIfpositive(distance, duration)
      ) {
        return;
      }
      obj = new Running(distance, duration, [lat, lng], elevation);
    }

    //add new object to workout arr
    console.log(obj);
    this.workoutArr.push(obj);
    console.log(obj);
    this.#renderul(obj);

    //render workout on map as marker
    //show list on left

    //hide form and clear input field
    this.#hide_form();

    /**
     * e{
     * latlang : {lat:6382, lng:8439,}
     * .,
     * .,
     * }
     */

    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup', //class name
        })
      )
      .setPopupContent('GYM') //content
      .openPopup();

    this.#setLocalStorage();
  }
  //
  alert() {
    console.log('got some promblem');
  }

  #formatDiscription(obj) {
    //Running on April 14
    return `${obj.type} on ${months[obj.date.getMonth()]}`;
  }

  #hide_form() {
    inputCadence.value,
      inputDistance.value,
      inputDuration.value,
      (inputElevation.value = '');

    form.classList.add('hidden');
    form.style.display = 'none';
    setTimeout(function () {
      form.style.display = 'grid';
    }, 10);
  }

  #renderul(obj) {
    html = `
    <li class="workout workout--running" data-id=${obj.id}>
      <h2 class="workout__title">${this.#formatDiscription(obj)}</h2>
      <div class="workout__details">
        <span class="workout__icon">${type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
        <span class="workout__value">${obj.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${obj.duration}</span>
        <span class="workout__unit">min</span>
      </div>
    `;

    if (obj.type === 'running') {
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${obj.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${obj.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>
      `;
    } else {
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${obj.speed}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${obj.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>
      `;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  #center_the_map(e) {
    const workout_ele = e.target.closest('.workout');
    if (!workout_ele) return;
    console.log(workout_ele.dataset.id);

    const workout_obj = this.workoutArr.find(function (ele) {
      if (ele.id === workout_ele.dataset.id) {
        return ele;
      }
    });

    this.#map.setView(workout_obj.coords, 13);
  }

  #setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.workoutArr));
  }

  #getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    this.workoutArr = data;

    if (!data) return;

    this.workoutArr.forEach(element => {
      this.#renderul(element);
    });
  }

  #clearLocalStrorage() {
    localStorage.clear();
  }
}

const mapty = new App();

// form.classList.remove('hidden');
