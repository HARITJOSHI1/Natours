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
router.patch('/resetPassword/:token', authController.resetPassword);

// Update password
router.patch('/updatePassword', authController.protect, authController.updatePassword);

// Update Me
router.patch('/updateMe', authController.protect, userController.updateMe);

// Delete / Deactivate Me
router.delete('/deleteMe', authController.protect, userController.deleteMe);


// CRUD 
router.route('/').get(userController.getAllUsers).post(userController.addUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(authController.protect, userController.updateUser)
  .delete(authController.protect, userController.deleteUser);
  
module.exports = router;
