const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
  review: String,
  ratings: {
    type: Number,
    max: [5, 'Please choose a rating between 0 - 5'],
    min: [0, 'Please choose a rating between 0 - 5'],
    default: 0,
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

// To avoid duplicate reviews made by the same user on the same tour
reviewSchema.index({tour: 1, user: 1}, {unique: true});

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

// Static method
reviewSchema.statics.calcAverageRating = async function (id) {
  const stats = await this.aggregate([
    { $match: { tour: id } },
    {
      $group: {
        _id: '$tour',
        nReviews: { $sum: 1 },
        avgRating: { $avg: '$ratings' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(id, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(id, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};


reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
