const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour field  must be provided'],
    unique: true,
    trim: true,
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
  },

  price: {
    type: Number,
    required: [true, 'A price field  must be provided'],
  },

  ratingsAverage: {
    type: Number,
    default: 4.4,
  },

  ratingsQuantity: {
    type: Number,
    default: 0,
  },

  priceDiscount: {
    type: Number,
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
    selected: false
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

tourSchema.pre('save', function(){
  console.log(this);
});

// ------------------------------------------------

/* 

2. POST:
    post middleware will be called after .save() or .create() right
    after inserting the document to the database and we will have 
    access to it so to tweak it

*/

tourSchema.post('save', function(){
  console.log(this);
});

// ####################################################################

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
