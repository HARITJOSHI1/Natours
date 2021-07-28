// const url = require('url');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverView = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async(req, res) => {
  // const {query, pathname} = url.parse(req.url);
  // const endpoint = pathname.split('/')[2];
  const tour = await Tour.findOne({slugs: req.params.slug}).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  res.status(200).render('tour', {
    title: tour.name,
    tour
  });
});
