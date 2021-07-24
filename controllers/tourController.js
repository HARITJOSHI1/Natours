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

// GeoSpatial handler
exports.getWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // distance in radians
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please specify the longitude and latitude of where you live',
        400
      )
    );
  }

  // console.log(distance, latlng, unit);

  const found = await tours.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: found.length,
    data: {
      found,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multipler = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please specify the longitude and latitude of where you live',
        400
      )
    );
  }

  // console.log(distance, latlng, unit);
  const distances = await tours.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },

        distanceField: 'distance',
        distanceMultiplier: multipler
      },
    },

    {
      $project: {
        distance: 1,
        name: 1
      }
    }

  ]);

  res.status(200).json({
    status: 'success',
    data: distances
  });
});

