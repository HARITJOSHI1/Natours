const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

//  Authentication route
router.post('/signup', authController.signUp);

// Login
router.post('/login', authController.login);

// Forgot password
router.post('/forgotPassword', authController.forgotPassword);

// Reset and update user password
router.patch('/resetPassword:/token', authController.resetPassword);

// CRUD 
router.route('/').get(userController.getAllUsers).post(userController.addUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
  
module.exports = router;
