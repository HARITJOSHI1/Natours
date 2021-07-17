const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const factory = require('./functions/handlerFactory');

function requiredUpdateObj(obj, ...allowedData) {
  const temp = {};
  Object.keys(obj).forEach((p) => {
    if (allowedData.includes(p)) {
      temp[p] = obj[p];
    }
  });
  return temp;
}

exports.getId = (req, res, next) => {
  if(!req.params.id) req.params.id = req.user.id;
  next();
}

exports.getAllUsers = factory.readSingleOrAll(User);
exports.getUser = factory.readSingleOrAll(User, 'single');
exports.createUser = factory.postData(User);
exports.updateUser = factory.updateData(User);
exports.deleteUser = factory.deleteDoc(User);
exports.getMe = factory.readSingleOrAll(User, 'single');

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


exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {active: false});
  res.status(204).json({
    status: "success",
    message: 'User is deleted successfully',
  });
});
