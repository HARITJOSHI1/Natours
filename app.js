// Core modules
const express = require('express');
const rateLimit = require('express-rate-limit');

// Security modules
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// App level modules
const app = express();
const tourRoute = require('./routes/tourRoutes');
const userRoute = require('./routes/userRoutes');
const AppError = require('./utils/AppError');
const Errors = require('./utils/Errors');

// ###########################################################

// GLOBAL APP MIDDLEWARE

// Turning ON Security Headers
app.use(helmet());

// Environment setup
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Body parser, reading data from req.body upto a limit
app.use(express.json({ limit: '10kb' }));

// Data Sanitization from NoSQL injection in req.body and req.params
app.use(mongoSanitize());

// Data Sanitization from XSS attacks (convert html entity into useless symbols)
app.use(xss());

// Prevention from parameter pollution (allowing some fields apart from it)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Request Limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Limit exceeded ! To many requests from this IP please try again in an hour',
});

// Apply limiter middleware in all the defined routes
app.use('/api', limiter);

// Mounting the router
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);

// Handling unknown routes
app.all('*', function (req, res, next) {
  const err = new AppError(
    `Cannot find ${req.originalUrl} on this server`,
    404
  );
  next(err);
});

// middleware to call error func()
app.use(Errors);

// Exporting app
module.exports = app;
