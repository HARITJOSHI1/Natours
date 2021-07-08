////////////////////////////////////////////////////////////////

// FILE WILL RUN INDEPENDENTLY

////////////////////////////////////////////////////////////////

const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

// Connecting our database to our app
const DB_PASS = process.env.DB_PASSWORD;
const DB_STR = process.env.DATABASE.replace('<PASSWORD>', DB_PASS);
mongoose
  .connect(DB_STR, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then((con) => console.log('Database sucessfully connected [DEV-IMPORT]'));

const readTours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf8')
);

// Passing Array of object to create()
const importDev = async () => {
  try {
    await tour.create(readTours);
    console.log('Data successfully loaded !');
    process.exit(); // Brute exit
  } catch (error) {
    console.log(error.message);
  }
};

// Delete All the documents
const deleteAllTour = async () => {
  try {
    await tour.deleteMany();
    console.log('Data deleted successfully !');
    process.exit(); // Brute exit
  } catch (error) {
    console.log(error.message);
  }
};

// Dealing with process.args array (cmd)
if (process.argv[2] === '--import') {
  importDev();
} else if (process.argv[2] === '--delete') {
  deleteAllTour();
}
