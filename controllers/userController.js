// Image uploads
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/AppError');
const factory = require('./functions/handlerFactory');
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },

//   filename: (req, file, cb) => {
//     // filename = user-uid-timestamp.jpg
//     // To avoid overwriting of images by same user or to avoid same name imgs
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

// To filter out images only while uploading
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload images only.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadImg = upload.single('photo');

// Resize images to fit app needs
exports.resizeImg = catchAsync( async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});



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
  if (!req.params.id) req.params.id = req.user.id;
  next();
};

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
  if (req.file) UpdateObj.photo = req.file.filename;

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
    message: 'User updated successfully',
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    message: 'User is deleted successfully',
  });
});
