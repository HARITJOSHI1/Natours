const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.getAllUsers = catchAsync(async(req, res) => {
  const allUsers = await User.find();
  res.status(200).json({
    status: 200,
    allUsers
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

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 500,
    message: 'Route is not implemented',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 500,
    message: 'Route is not implemented',
  });
};
