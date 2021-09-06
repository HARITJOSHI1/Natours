const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

//  Authentication route
router.post('/signup', authController.signUp);

// Login
router.post('/login', authController.login);

// Logout
router.get('/logout', authController.logout);

// Forgot password
router.post('/forgotPassword', authController.forgotPassword);

// Reset and update user password
router.patch('/resetPassword/:token', authController.resetPassword);

// PROTECTING ROUTES AFTER THIS POINT:
router.use(authController.protect);

// Update password
router.patch('/updatePassword', authController.updatePassword);

// #######################################################################

//                            role = User

// Get Me
router.get('/me', userController.getId, userController.getMe);

// Update Me
router.patch('/updateMe', userController.updateMe);

// Delete / Deactivate Me
router.delete('/deleteMe', userController.deleteMe);

// #########################################################################

//                            role = Admin

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(authController.protect, userController.getUser)
  .patch(authController.protect, userController.updateUser)
  .delete(authController.protect, userController.deleteUser);

// ###########################################################################

module.exports = router;
