const express = require('express');
const tourController = require('./../controllers/tourController');

///////////////////////////////////////////////
// Fetching all data
// app.get('/api/v1/tours', getAllTours);

// Sending data to server
// app.post('/api/v1/tours', postTour);

///////////////////////////////////////////////

// Fetching specific data

const router = express.Router();
// router.param('id', tourController.checkID);
// router.use(tourController.checkData);

// Aliasing route
router.route('/top-5-tours').get(tourController.topFiveTours, tourController.getAllTours);

// Statistics of the tour
router.route('/statistics').get(tourController.getTourStats);

// SOLUTION
router.route('/get-busy-month/:year').get(tourController.getPlan);

// For specific tour
router
  .route('/:id')
  .get(tourController.getSingleTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

// Fetching all data and sending data to server
router.route('/').get(tourController.getAllTours).post(tourController.postTour);

module.exports = router;