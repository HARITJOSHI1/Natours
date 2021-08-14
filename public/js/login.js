import axios from "axios";

const email = document.getElementById('email');
const pwd = document.getElementById('password');
const form = document.querySelector('.form');

export const login = async (email, password) => {
  try {
    const { data: res } = await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    target(res, '/');
  } catch (err) {
    console.log(err.message);
  }
};

const target = (res, path) => {
  console.log(res);
  if (res.status === 'loggedIn') {
    alert('Logged in successfully');
    window.setTimeout(() => {
      location.assign(path);
    }, 1500);
  }
};

form.addEventListener('submit', function (event) {
  event.preventDefault();
  login(email.value, pwd.value);
});
