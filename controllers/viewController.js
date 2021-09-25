// const url = require('url');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
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
    user: req.user,
    tour
  });
});

exports.getLogin = catchAsync(async(req, res) => {
  res.status(200).render('login', {
    title: 'Login'
  });
});

exports.getMe = catchAsync(async(req, res) => {
  const {name, email, role, photo} = req.user;
  res.status(200).render('dashboard', {title: 'Your account', name, email, role, photo});
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIdArr = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIdArr } });

  res.status(200).render('overview', { title: 'My Bookings', tours });
});

// exports.updateUser = catchAsync(async(req, res) => {
//   console.log('UPDATING USER' + req.body);
// });