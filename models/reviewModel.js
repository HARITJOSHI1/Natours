const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  review: String,
  ratings: {
    type: Number,
    max: [5, 'Please choose a rating between 0 - 5'],
    min: [0, 'Please choose a rating between 0 - 5'],
    default: 0
  },
  createdAt: Date,
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

reviewSchema.pre('save', function (next) {
  this.createdAt = Date.now();
  next();
});

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
