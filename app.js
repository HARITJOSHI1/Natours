// Core modules
const path = require('path');
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
const reviewRoute = require('./routes/reviewRoutes');
const viewRoute = require('./routes/viewRoutes');
const AppError = require('./utils/AppError');
const cookieParser = require('cookie-parser');
const Errors = require('./utils/Errors');

// ###########################################################

// GLOBAL APP MIDDLEWARE
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Setting up view templates
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Environment setup
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Body parser, reading data from req.body upto a limit
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

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
      'price',
    ],
  })
);


// Request Limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Limit exceeded ! To many requests from this IP please try again in an hour',
});

// Apply limiter middleware in all the defined routes
app.use('/', limiter);

// Mounting the router
app.use('/', viewRoute);
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews', reviewRoute);

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
