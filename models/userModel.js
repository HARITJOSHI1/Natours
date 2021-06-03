const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please enter your name'],
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: [true, 'Please enter your email'],
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email address'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Please enter your password'],
    minLength: [8, 'Please enter a password more than 8 characters'],
    maxLength: [250, 'Please enter a password less than 250 characters'],
    validate: {
      validator: function (val) {
        const alphaNum = ['@', '!', '#', '[', ']', '(', ')'];
        let c = 0;
        alphaNum.forEach((i) => {
          if (val.includes(i)) c += 1;
        });
        console.log(c);
        return c ? true : false;
      },
      message: 'Please enter a strong password',
    },
  },

  passwordConfirm: {
    type: String,
    trim: true,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return val === this.password ? true : false;
      },
      message: 'Please recheck your password',
    },
  },
});

// Encrypt passwords:
userSchema.pre('save', async function(next){
  // runs if password was actually modified
  if(!this.isModified('password')) return next();

  // Hashing password with cost 12
  this.password = await bcrypt.hash(this.password, 12);   // returns promise

  // Delete passwordComfirm field
  this.passwordConfirm = undefined;
  next();
});

module.exports = mongoose.model('User', userSchema);
