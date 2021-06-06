const express = require('express');
const morgan = require('morgan');
const app = express();
const tourRoute = require('./routes/tourRoutes');
const userRoute = require('./routes/userRoutes');
const AppError = require('./utils/AppError');
const Errors = require('./utils/Errors');

// APP MIDDLEWARE

// Environment setup
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use(express.json());

// Mounting the router
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);


// Handling unknown routes
app.all('*', function (req, res, next) {
  const err = new AppError(`Cannot find ${req.originalUrl} on this server`, 404);
  next(err);
});

// middleware to call error func()
app.use(Errors);

// Exporting app
module.exports = app;
