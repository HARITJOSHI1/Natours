const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

///////////////////////////////////////////////
// Fetching all data
// app.get('/api/v1/tours', getAllTours);

// Sending data to server
// app.post('/api/v1/tours', postTour);

///////////////////////////////////////////////

const router = express.Router();

// Delegating to reviewRouter
router.use('/:id/reviews', reviewRouter);
router.use('/reviews', reviewRouter);

// router.param('id', tourController.checkID);
// router.use(tourController.checkData);

// Aliasing route
router
  .route('/top-5-tours')
  .get(tourController.topFiveTours, tourController.getAllTours);

// Statistics of the tour
router.route('/statistics').get(tourController.getTourStats);

// GeoSpatial Route
router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

// SOLUTION
router
  .route('/get-busy-month/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'legal-guide', 'guide'),
    tourController.getPlan
  );

// For specific tour
router
  .route('/:id')
  .get(tourController.getSingleTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'legal-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'legal-guide'),
    tourController.deleteTour
  );

// Fetching all data and sending data to server
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'legal-guide'),
    tourController.postTour
  );

module.exports = router;
