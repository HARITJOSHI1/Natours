// Payment
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Model
const Tours = require('../models/tourModel');

// Error Handlers
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the selected tour/product
  const tour = await Tours.findById(req.params.tourID);

  // 2) Create a stripe session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
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
