const mongoose = require('mongoose');
const dotenv = require('dotenv');
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
app.listen(process.env.PORT, () => {
  console.log('Listening on port 8000');
});
