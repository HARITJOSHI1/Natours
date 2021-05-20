const express = require('express');
const tours = require('./../models/tourModel');

// const dataJson = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'UTF-8')
// );

// FEATURES OF OUR API Class:

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1. Filtering
  filter = () => {
    const queryObj = { ...this.queryString }; // shallow copy
    const excludeParams = ['page', 'sort', 'limit', 'fields'];
    excludeParams.forEach((ptr) => delete queryObj[ptr]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    queryStr = JSON.parse(queryStr);

    // To chain multiple functions on the query obj later
    this.query = this.query.find(queryStr);
    return this;
  };

  // 2. Sorting
  sort = () => {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      return this;
      // query = query.sort('(field name) (other field name ...)')
    } else {
      this.query = this.query.sort('-createdAt');
      return this;
    }
  };

  // 3. Limiting fields (projection)
  fields = () => {
    if (this.queryString.fields) {
      const fieldBy = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldBy);
      return this;
    } else {
      this.query = this.query.select('-__v'); // To exclude a field
      return this;
    }
  };

  // 4. Pagination
  page = (total) => {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    if (!this.queryString.limit) {
      this.query = this.query.limit(limit);
    }

    if (total <= skip) {
      throw new Error('Page out not found');
    }
    return this;
  };
}

// #################################################################

// FUNCTIONS

// aliasing callBack
exports.topFiveTours = async (req, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  // To continue req-res cycle for the next middleware in the stack
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const totalTours = await tours.countDocuments();
    const features = new APIfeatures(tours.find(), req.query)
      .filter()
      .sort()
      .fields()
      .page(totalTours);

    // Execute query
    const allTours = await features.query;

    // Sending the response
    res.status(200).json({
      status: 'success',
      results: allTours.length,
      data: {
        allTours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.postTour = async (req, res) => {
  try {
    const newTour = await tours.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    console.log('ERRORRRRR');
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getSingleTour = async (req, res) => {
  try {
    // const id = +req.params.id;
    const resData = await tours.findById(req.params.id);
    // let allTours = await tours.find();
    // console.log(allTours);

    // let resData = allTours.find((el, idx) => idx === id - 1);
    // resData = JSON.stringify(resData);
    // console.log(resData);

    res.status(200).json({
      status: 'success',
      data: resData,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  const id = await tours.findById(req.params.id);
  try {
    const updatedTour = await tours.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      updatedTour,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const id = req.params.id;
    const deleteTour = await tours.deleteOne({ _id: id });
    res.status(200).json({
      status: 'success',
      message: `Deleted the document with id ${id}`,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await tours.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },

      {
        $group: {
          _id: '$difficulty',
          numResult: { $sum: 1 },
          totalRatings: { $sum: '$ratingsAverage' },
          averageRating: { $avg: '$ratingsAverage' },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },

      {
        $sort: { averagePrice: -1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      stats,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Problem : Calculate the busiest month in a year passed by the user
// SOLUTION:

exports.getPlan = async (req, res) => {
  try {
    const year = req.params.year;
    const plan = await tours.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },

      {
        $group: {
          _id: { $month: '$startDates' },
          numberOfTours: { $sum: 1 },
          tours: {$push: '$name'}
        },
      },

      {
        $addFields: {month: '$_id'}
      },

      {
        $sort: {
          numberOfTours: -1
        }
      },

      {$limit: 1},

      {
        $project: {month: 1, tours: 1, _id: 0}
      }

    ]);

    if(plan.length === 0){
      throw new Error("No tour was found");
    }

    res.status(200).json({
      status: 'success',
      plan,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};
