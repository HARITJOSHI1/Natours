const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

function requiredUpdateObj(obj, ...allowedData) {
  const temp = {};
  Object.keys(obj).forEach((p) => {
    if (allowedData.includes(p)) {
      temp[p] = obj[p];
    }
  });
  return temp;
}

exports.getAllUsers = catchAsync(async (req, res) => {
  const allUsers = await User.find();
  res.status(200).json({
    status: 200,
    allUsers,
  });
});

exports.addUser = (req, res) => {
  res.status(500).json({
    status: 500,
    message: 'Route is not implemented',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 500,
    message: 'Route is not implemented',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError('This route is not for updating password', 400));
  }

  const UpdateObj = requiredUpdateObj(req.body, 'name', 'email');

  if (Object.keys(UpdateObj).length === 0) {
    return next(
      new AppError('The requested data is not valid for update', 400)
    );
  }

  const user = await User.findByIdAndUpdate(req.user._id, UpdateObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Name and email updated successfully',
    user,
  });
});

exports.updateUser = catchAsync(async (req, res) => {
  res.status(500).json({
    status: 500,
    message: 'Route is not implemented',
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {active: false});
  res.status(204).json({
    status: "success",
    message: 'User is deleted successfully',
  });
});

exports.deleteUser = catchAsync(async (req, res) => {
  const id = req.params.id;
  await User.findByIdAndDelete(id);
  res.status(200).json({
    status: "success",
    message: 'Account is deleted permanently',
  });
});
