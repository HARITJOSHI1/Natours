const express = require('express');

// FEATURES OF OUR API Class:
const APIfeatures = require('./APIFeatureClass');

const tours = require('../models/tourModel');

// Error Handlers
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Errors = require('../utils/Errors');

// #################################################################

// FUNCTIONS

// aliasing callBack
exports.topFiveTours = async (req, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  // To continue req-res cycle for the next middleware in the stack
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const totalTours = await tours.countDocuments();
  const features = new APIfeatures(tours.find(), req.query)
    .filter()
    .sort()
    .fields()
    .page(totalTours);

  // Execute query
  const allTours = await features.query;

  // Sending the response
  res.status(200).json({
    status: 'success',
    results: allTours.length,
    allTours,
  });
});

exports.postTour = catchAsync(async (req, res) => {
  const newTour = await tours.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.getSingleTour = catchAsync(async (req, res, next) => {
  
  const resData = await tours.findById(req.params.id).populate('reviews');

  if (!resData) {
    const err = new AppError(
      `Could not find any tour with that ID ${req.params.id}`,
      404
    );
    return next(err);
  }

  res.status(200).json({
    status: 'success',
    data: resData,
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const toBeUpdated = await tours.findById(req.params.id);
  const updatedTour = await tours.findByIdAndUpdate(toBeUpdated, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour) {
    const err = new AppError(
      `Could not find any tour with that ID ${req.params.id}`,
      404
    );
    return next(err);
  }

  res.status(200).json({
    status: 'success',
    updatedTour,
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const deleteTour = await tours.deleteOne({ _id: id });
  
  if (!deleteTour.n) {
    const err = new AppError(
      `Could not find any tour with that ID ${req.params.id}`,
      404
    );
    return next(err);
  }

  res.status(200).json({
    status: 'success',
    message: `Deleted the document with id ${id}`,
  });
});

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
