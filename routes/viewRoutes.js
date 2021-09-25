const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController'); 
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

router.use(authController.isLoggedIn);

router.get('/', bookingController.createBookingCheckout, viewController.getOverView);
router.get('/tour/:slug', authController.protect, viewController.getTour);
router.get('/login', viewController.getLogin);
router.get('/me', authController.protect, viewController.getMe);
router.get('/my-bookings', authController.protect, viewController.getMyBookings);
// router.post('/submit-user-data', authController.protect, viewController.updateUser);

module.exports = router;
