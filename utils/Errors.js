const AppError = require('./AppError');

// Database related errors
const handleCastErrorDB = (e) => {
  return new AppError(`Invalid id with value ${e.value}`, 400);
};

const handleValidatorErrorDB = (e) => {
  return new AppError(`${e.errors.name.value} field is ambigous`, 400);
};

const handleDuplicateErrorDB = (e) => {
  return new AppError(
    `${e.errors.name.properties.path} field is required`,
    400
  );
};

const handleInvalidJsonWebToken = (e) => {
  return new AppError(e.message, 401);
};

const handleTokenExpire = (e) => {
  return new AppError(
    'Your token has already expired! Please login again',
    401
  );
};

const setDevErr = (err, req, res) => {
  //  A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) Rendered website
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong !',
    msg: err.message,
  });
};

const setProdErr = (err, req, res) => {
  
  //  A) API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(500).json({
        status: err.status,
        message: err.message,
      });
    }

    return res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went wrong !',
    });
  }

  //  B) Rendered website
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  console.log(err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

// Handle all errors
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    setDevErr(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message

    if (error.kind === 'ObjectId') {
      error = handleCastErrorDB(error);
    }

    if (error._message === 'Tour validation failed') {
      error = handleValidatorErrorDB(error);
    }

    if (error.kind === 'User defined') {
      error = handleDuplicateErrorDB(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleInvalidJsonWebToken(error);
    }

    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpire();
    }

    setProdErr(error, req, res);
  }
  next();
};
