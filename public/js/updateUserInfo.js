import axios from 'axios';

export const updateUserInfo = async (formData) => {
  const { data } = await axios.patch(
    '/api/v1/users/updateMe',
    formData
  );

};

export const updatePassword = async (pass, repass, currPass) => {
  const { data } = await axios.patch(
    '/api/v1/users/updatePassword',
    { password: pass, passConfirm: repass, currPass }
  );
};
