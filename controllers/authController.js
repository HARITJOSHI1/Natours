const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const sendEmail = require('./../utils/email');

// AUTHENTICATION
const signToken = (id) => {
  const t = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TIMEOUT,
  });
  return t;
};

const sendCookie = (token, res) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  else cookieOptions.secure = false;

  res.cookie('jwt', token, cookieOptions);
};

exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);
  sendCookie(token, res);
  newUser.password = undefined;

  res.status(201).json({
    status: 'signedUp',
    token,
    data: {
      users: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // 1. check whether email and password are provided by the user or not
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please enter your email or password', 401));
  }

  // 2. check whether user exist or signed up
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  // 3. create token
  const token = signToken(user._id);
  sendCookie(token, res);

  // 4. Send response
  res.status(200).json({
    status: 'loggedIn',
    token,
  });
});

exports.isLoggedIn = async (req, res, next) => {
  // 1. Getting token and check of it if its there
  let token;
  if (req.cookies.jwt) {
    try {
      // 1. Verify token and its payload
      token = req.cookies.jwt;
      if (!token) return next();
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      // 2. Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next()
};

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
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // 2. Verify token and its payload
  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token doesn't exist"),
      401
    );
  }

  // 4. Check if user changed password after the token was issued
  // if (currentUser.changedPassword(decoded.iat)) {
  //   return next(
  //     new AppError('The password is changed so please login again'),
  //     400
  //   );
  // }

  req.user = currentUser;
  next();
});

// AUTHORIZATION
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }

    next();
  };
};

// Reset password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get the user
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with that email address.'), 404);

  // 2. Generate reset token

  // returning our reset token
  const resetToken = user.createResetPasswordToken();

  // To save the changes when certain properties are
  // updated using instance funcs()
  await user.save({ validateBeforeSave: false });

  // 3. Send it to user
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/resetPassword/${resetToken}`;

  const message = `Forgot your password ? You can submit a new request with your new password to: ${resetURL}. If you remember your password then ignore this email.`;

  // Handling errors when sending an email
  try {
    await sendEmail({
      email: req.body.email,
      subject: `Your password reset token (valid for 10 mins)`,
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token send to email !',
    });
  } catch (err) {
    user.resetToken = undefined;
    user.passResetTokenexp = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error to send the email! Please try again later.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get the user based on the reset token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetToken: hashedToken,
    passResetTokenexp: { $gt: Date.now() },
  });
  console.log(user);
  // 2. If token is expired and user doesn't exists, send the error
  if (!user) return next(new AppError('Token is invalid or expired', 400));

  // 3. Change the original password (reset) and delete reset token
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetToken = undefined;
  user.passResetTokenexp = undefined;

  await user.save();

  // 4. Log the user inside the app (send JWT)
  const token = signToken(user._id);
  sendCookie(token, res);

  res.status(200).json({
    status: 'success',
    message: 'Password is successfully updated!',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get the user from collection
  const userID = req.user._id;
  const user = await User.findById(userID).select('+password');
  if (!user) return next(new AppError('User does not exist', 401));

  // 2. Verify the posted password
  const pass = req.body.password;
  const passConfirm = req.body.passConfirm;
  if (passConfirm !== user.password) {
    return next(new AppError('Password is incorrect', 400));
  }

  // 3. Update the password
  await User.updateOne(
    { _id: user._id },
    { $set: { password: pass } },
    { new: true, runValidators: true }
  );

  // 4. Log in the user
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
    token,
  });
});
