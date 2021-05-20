const express = require('express');
const morgan = require('morgan');
const app = express();
const tourRoute = require('./routes/tourRoutes');
const userRoute = require('./routes/userRoutes');

// APP MIDDLEWARE

// Environment setup
if(process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use(express.json());

// Mounting the router
app.use('/api/v1/tour', tourRoute);
app.use('/api/v1/users', userRoute);

// Exporting app
module.exports = app;