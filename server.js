const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log("UNCAUGHT EXCEPTION", err.name, err.message);
  process.exit(1);
});

const app = require('./app');

// Setting the config file
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
  .then((con) => console.log('Database sucessfully connected'));

// Starting the server
const server = app.listen(process.env.PORT, (req, res) => {
  console.log('Listening on port ' + process.env.PORT);
});

process.on('unhandledRejection', (err) => {
  console.log("UNHANDLED REJECTION", err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
})