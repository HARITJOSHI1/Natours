const express = require('express');
const reviewController = require('../controllers/reviewController');
const authcontroller = require('../controllers/authController');
const router = express.Router();

router.route('/:id').post(authcontroller.protect, reviewController.postReview);

module.exports = router;
