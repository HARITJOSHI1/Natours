import '@babel/polyfill';
import { login, logout } from './login';
import { updateUserInfo, updatePassword } from './updateUserInfo';
import { bookTour } from './stripe';

// import { displayMap } from './mapbox';

const email = document.getElementById('email');
const name = document.getElementById('name');
const pwd = document.getElementById('password');
const f = document.getElementById('photo');

const currPass = document.getElementById('password-current');
const pass = document.getElementById('password');
const repass = document.getElementById('password-confirm');

const form1 = document.querySelector('.form--login');
const form2 = document.querySelector('.form-user-data');
const form3 = document.querySelector('.form-user-settings');

const logOutBtn = document.querySelector('.nav__el--logout');
const bookTourBtn = document.getElementById('book-tour');

// const locations = document.getElementById('map').dataset.locations;
// if(locations){
//     displayMap(locations);
// }

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (form1) {
  form1.addEventListener('submit', function (event) {
    event.preventDefault();
    login(email.value, pwd.value);
  });
} else if (form2) {
  form2.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', name.value);
    form.append('email', email.value);
    form.append('photo', f.files[0]);

    updateUserInfo(form);
  });
}

if (form3) {
  form3.addEventListener('submit', (e) => {
    console.log('Entered');
    e.preventDefault();
    updatePassword(pass.value, repass.value, currPass.value);
  });
}

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
