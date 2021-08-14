const AppError = require('./AppError');

// Database related errors
const handleCastErrorDB = (e) => {
  return new AppError(`Invalid id with value ${e.value}`, 400);
}

const handleValidatorErrorDB = (e) => {
  return new AppError(`${e.errors.name.value} field is ambigous`, 400);
}

const handleDuplicateErrorDB = (e) => {
  return new AppError(`${e.errors.name.properties.path} field is required`, 400);
}

const handleInvalidJsonWebToken = (e) => {
  return new AppError(e.message, 401);
}
 
const handleTokenExpire = (e) => {
  return new AppError("Your token has already expired! Please login again", 401);
}


const setDevErr = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const setProdErr = (err, res) => {
  if (!err.isOperational) {
    console.error('Error ⛔', err);
    res.status(500).json({
      status: 'failed',
      message: 'Something went wrong !',
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      error: err.message,
    });
  }
};

// Handle all errors
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    setDevErr(err, res);
  } 
  else {
    let error = {... err};

    if(error.kind === 'ObjectId'){
      error = handleCastErrorDB(error);
    }

    if(error._message === 'Tour validation failed'){
      error = handleValidatorErrorDB(error);
    }

    if(error.kind === 'User defined'){
      error = handleDuplicateErrorDB(error);
    }
    
    if(error.name === 'JsonWebTokenError'){
      error = handleInvalidJsonWebToken(error);
    }

    if(error.name === 'TokenExpiredError'){
      error = handleTokenExpire();
    }

    setProdErr(error, res);
  }
  next();
};
