const mongoose = require('mongoose');
const validator = require('validator')

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour field  must be provided'],
    minLength: [2, 'A name should be greter than or equal to 2 characters'],
    maxLength: [250, 'A name should be less than or equal to 250 characters'],
    unique: true,
    trim: true,
    validate: {
      validator: function (val) {
        for(let i = 0; i < val.length; i++){
          if(Number(val[i])){
            return false;
          }
        }
        return true;
      },

      message: 'Name of a tour must be a string'
    }
  },

  duration: {
    type: Number,
    required: [true, 'A tour field must be provided'],
  },

  maxGroupSize: {
    type: Number,
    required: [true, 'A tour field must be provided'],
  },

  difficulty: {
    type: String,
    required: [true, 'A tour field must be provided'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Please select from easy, medium and difficult'
    }
  },

  price: {
    type: Number,
    required: [true, 'A price field  must be provided'],
  },

  ratingsAverage: {
    type: Number,
    default: 4.4,
    min: [0, 'Ratings should be in the range 0-5'],
    max: [5, 'Ratings should be in the range 0-5']
  },

  ratingsQuantity: {
    type: Number,
    default: 0,
  },

  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val){

        /* Can only use 'this' in validator with inserts and 
         'this' will points to the current new document NOT ON UPDATES */
        return val < this.price;
      },
      message: 'The discount value({VALUE}) is higher than the price'
    }
  },

  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour field must be provided'],
  },

  description: {
    type: String,
    trim: true,
  },

  imageCover: {
    type: String,
    required: [true, 'A tour field must be provided'],
  },

  images: {
    type: [String],
    required: [true, 'A tour field must be provided'],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
    required: [true, 'A tour field must be provided'],
    select: false
  },

  secretTour: {
    type: "Boolean",
    default: false
  },

  startDates: {
    type: [Date],
  },
},

{
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
}

);

tourSchema.virtual('durationWeeks').get(function (){
  return this.duration / 7;
});

// #######################  DOCUMENT (mongoose) MIDDLEWARE  #############################

/* 

1. PRE:
    pre middleware will be called before .save() or .create() right
    before inserting the document to the database and we will have 
    access to it so to tweak it

*/

tourSchema.pre('save', function(next){
  // console.log(this);
  next();
});

// ------------------------------------------------

/* 

2. POST:
    post middleware will be called after .save() or .create() right
    after inserting the document to the database and we will have 
    access to it so to tweak it and have access to the current document
    inserted and the next() func

*/

tourSchema.post('save', function(doc, next){
  // console.log(this);
  next();
});


// #######################  QUERY (mongoose) MIDDLEWARE  #############################

tourSchema.pre(/^find/, function(next){
  this.find({secretTour: {$ne: 'true'}});
  this.startTime = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next){
  console.log(`Query took: ${(Date.now() - this.startTime) / 1000} sec`);
  next();
});

// #######################  AGGREGATION (mongoose) MIDDLEWARE  #############################

tourSchema.pre('aggregate', function(next){
  this.pipeline().unshift(
    {
      $match: {
        secretTour: {$ne: 'true'}
      }
    }
  );

  next();
});


const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
