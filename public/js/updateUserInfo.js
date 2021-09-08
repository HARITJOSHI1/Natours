import axios from 'axios';

export const updateUserInfo = async (formData) => {
  const { data } = await axios.patch(
    'http://localhost:8000/api/v1/users/updateMe',
    formData
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
