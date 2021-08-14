import '@babel/polyfill';
import {login} from "./login";

const email = document.getElementById('email');
const pwd = document.getElementById('password');
const form = document.querySelector('.form');

form.addEventListener('submit', function (event) {
  event.preventDefault();
  login(email.value, pwd.value);
});
