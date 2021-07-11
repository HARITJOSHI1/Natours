const mongoose = require('mongoose');
const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getTopReviews = catchAsync(async (req, res) => {
  // const topReviews = await Review.find({ ratings: { $gt: 3 } }).limit(10);
  // const response = { status: 'success', topReviews };
  // if (topReviews.length === 0) response.topReviews = "No reviews available";
  // res.status(200).json(response);

  const topReviews = await Review.find().sort('-createdAt');
  const response = { status: 'success', topReviews };
  if (topReviews.length === 0) response.topReviews = "No reviews available";
  res.status(200).json(response);

});

exports.postReview = catchAsync(async (req, res, next) => {
  const TOUR_ID = req.params.id;
  const USER_ID = req.user._id;

  const tour = await Tour.findById(TOUR_ID);
  const user = await User.findById(USER_ID);

  if (!user || !tour)
    return next(new AppError('User or tour does not exist', 400));

  req.body.tour = TOUR_ID;
  req.body.user = USER_ID;

  await Review.create(req.body);
  const foundReview = await Review.find({ tour: TOUR_ID })
    .select('-__v')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    review: foundReview,
  });
  next();
});
