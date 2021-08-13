const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController'); 
const authController = require('../controllers/authController');

router.use(authController.isLoggedIn);

router.get('/', viewController.getOverView);
router.get('/tour/:slug', authController.protect, viewController.getTour);
router.get('/login', viewController.getLogin);

module.exports = router;
