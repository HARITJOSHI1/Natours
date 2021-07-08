const mongoose = require('mongoose');
const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

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
  const foundReview = await Review.findOne().select('-__v');

  res.status(200).json({
    status: 'success',
    review: foundReview,
  });
  next();
});
