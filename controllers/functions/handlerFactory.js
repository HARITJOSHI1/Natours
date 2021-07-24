const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const APIfeatures = require('../APIFeatureClass');
const Review = require('../../models/reviewModel');

exports.deleteDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const deleteDoc = await Model.findByIdAndDelete({ _id: id });

    if (!deleteDoc) {
      const err = new AppError(
        `Could not find any document with that ID ${req.params.id}`,
        404
      );
      return next(err);
    }

    res.status(200).json({
      status: 'success',
      message: `Deleted the document with id ${id}`,
    });
  });

exports.readSingleOrAll = (Model, a = 'all') => {
  if (a === 'single') {
    return catchAsync(async (req, res, next) => {
      const resData = await Model.findById(req.params.id)
        .populate('reviews')
        .select('-active');

      if (!resData) {
        const err = new AppError(
          `Could not find any document with that ID ${req.params.id}`,
          404
        );
        return next(err);
      }

      res.status(200).json({
        status: 'success',
        data: resData,
      });
    });
  } else {
    return catchAsync(async (req, res) => {
      const totalDocs = await Model.countDocuments();
      let fil = {};
      if (req.params.id) fil = {tour: req.params.id};
      const features = new APIfeatures(Model.find(fil), req.query)
        .filter()
        .sort()
        .fields()

      // Execute query

      let allDocs;
      if (Model === Review) allDocs = await features.query.sort('-createdAt');
      else allDocs = await features.query;

      // Sending the response
      res.status(200).json({
        status: 'success',
        results: allDocs.length,
        allDocs,
      });
    });
  }
};

exports.postData = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.updateData = (Model) =>
  catchAsync(async (req, res, next) => {
    const toBeUpdated = await Model.findById(req.params.id);
    const doc = await Model.findByIdAndUpdate(toBeUpdated, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      const err = new AppError(
        `Could not find any document with that ID ${req.params.id}`,
        404
      );
      return next(err);
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
