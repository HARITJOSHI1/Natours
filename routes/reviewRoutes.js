const express = require('express');
const reviewController = require('../controllers/reviewController');
const authcontroller = require('../controllers/authController');
const router = express.Router({mergeParams: true});

router.route('/').get(reviewController.getTopReviews).post(authcontroller.protect, reviewController.postReview);

module.exports = router;
