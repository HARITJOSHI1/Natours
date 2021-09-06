import axios from 'axios';

export const updateUserInfo = async (email, name) => {
  const { data } = await axios.patch(
    'http://localhost:8000/api/v1/users/updateMe',
    { name, email }
  );

  console.log(data);
};

export const updatePassword = async (pass, repass, currPass) => {
  console.log('Pass update');
  const { data } = await axios.patch(
    'http://localhost:8000/api/v1/users/updatePassword',
    { password: pass, passConfirm: repass, currPass }
  );

  console.log(data);
};
