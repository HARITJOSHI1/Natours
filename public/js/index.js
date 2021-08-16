import '@babel/polyfill';
import { login, logout } from './login';

// import { displayMap } from './mapbox';

const email = document.getElementById('email');
const pwd = document.getElementById('password');
const form = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');
// const locations = document.getElementById('map').dataset.locations;

// if(locations){
//     displayMap(locations);
// }

if(logOutBtn){
   logOutBtn.addEventListener('click', logout)
}

if (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    login(email.value, pwd.value);
  });
}
