const express = require('express');
const tours = require('../models/tourModel');

// Error Handlers
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Factory functions
const factory = require('./functions/handlerFactory');

// #################################################################

// FUNCTIONS

// aliasing callBack
exports.topFiveTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  // To continue req-res cycle for the next middleware in the stack
  next();
};

exports.getAllTours = factory.readSingleOrAll(tours);
exports.getSingleTour = factory.readSingleOrAll(tours, 'single');
exports.postTour = factory.postData(tours);
exports.updateTour = factory.updateData(tours);
exports.deleteTour = factory.deleteDoc(tours);


// _________________________________________________________________

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await tours.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },

    {
      $group: {
        _id: '$difficulty',
        numResult: { $sum: 1 },
        totalRatings: { $sum: '$ratingsAverage' },
        averageRating: { $avg: '$ratingsAverage' },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    {
      $sort: { averagePrice: -1 },
    },
  ]);

  if (!stats) {
    const err = new AppError(
      `Could not find any tour with that ID ${req.params.id}`,
      404
    );
    return next(err);
  }

  res.status(200).json({
    status: 'success',
    stats,
  });
});

// ##############################################################################

// Problem : Calculate the busiest month in a year passed by the user
// SOLUTION:

exports.getPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const plan = await tours.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numberOfTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },

    {
      $addFields: { month: '$_id' },
    },

    {
      $sort: {
        numberOfTours: -1,
      },
    },

    { $limit: 1 },

    {
      $project: { month: 1, tours: 1, _id: 0 },
    },
  ]);

  if (plan.length === 0 || !plan) {
    const err = new AppError(
      `Could not find any tour with that ID ${req.params.id}`,
      404
    );
    return next(err);
  }

  res.status(200).json({
    status: 'success',
    plan,
  });
});
