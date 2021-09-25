// Payment
const stripe = require('stripe')(
  'sk_test_51JY3ZpSEnWLXGl16jMZ3Y6Gxx1mAUxdczeITeHuPjOLvp8Wl05XtfvlKdMmm5onVzEwsReMoL6WBxV5Fa6ArR8f1008P9Xz5D7'
);

// Model
const Tours = require('../models/tourModel');
const Booking = require('../models/bookingModel');

// Error Handlers
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the selected tour/product
  const tour = await Tours.findById(req.params.tourID);

  // 2) Create a stripe session [Not secure!]
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tour.id}&user=${
      req.user.id
    }&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // Send the session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });
  res.redirect(`${req.protocol}://${req.get('host')}/`);
});
