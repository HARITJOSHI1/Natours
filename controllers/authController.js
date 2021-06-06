const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

const signToken = (id) => {
  const t = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TIMEOUT,
  });

  return t;
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'signedUp',
    token,
    data: {
      users: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // 1. check whether email and password exists
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please enter your email or password', 401));
  }

  // 2. check whether user exist or signed up
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect user or password', 401));

  // 3. create token
  const token = signToken(user._id);

  // 4. Send response
  res.status(200).json({
    status: 'loggedIn',
    token,
  });
});

// #####################################################################

// Protecting routes middleware

exports.protect = catchAsync(async (req, res, next) => {

  // 1. Getting token and check of it if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Verify token and its payload
  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3. Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError("The user belonging to this token doesn't exist"),
      401
    );

  // 4. Check if user changed password after the token was issued
  if(freshUser.changedPassword(decoded.iat)){
    return next(new AppError("The password is changed so please login again"), 400);
  }    

  next();
});
