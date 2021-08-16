import axios from 'axios';
import { renderAlert } from './alert';

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
    renderAlert('error', 'Incorrect password or email');
  }
};

const target = (res, path) => {
  console.log(res);
  if (res.status === 'loggedIn') {
    renderAlert('success', 'Logged in successfully');
    window.setTimeout(() => {
      location.assign(path);
    }, 1500);
  }
};

export const logout = async () => {
  try {
    const { data: res } = await axios({
      method: 'GET',
      url: 'http://localhost:8000/api/v1/users/logout',
    });

    if (res.status === 'loggedOut') {
      location.assign('/');
    }
  } catch (err) {
    renderAlert(
      'error',
      'There was an error is log out. Please try again later'
    );
  }
};
