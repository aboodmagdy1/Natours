const express = require('express');
const tourRouter = express.Router();
const tourControllers = require('../controller/tourController');
const authController = require('./../controller/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const bookingRouter = require('./../routes/bookingRoutes');

//nested routes
// POST /tour/323424/reviews
tourRouter.use('/:tourId/reviews', reviewRouter); // i tell express to use reviewRouters if the url match this line
tourRouter.use('/:tourId/bookings', bookingRouter); // i tell express to use bookingRouters if the url match this line

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourControllers.getToursWithin);
tourRouter
  .route('/distances/:lnglat/unit/:unit')
  .get(tourControllers.getDistances);
tourRouter
  .route('/top-5-cheap')
  .get(tourControllers.aliasTopTour, tourControllers.getAllTours);
tourRouter.route('/tour-stats').get(tourControllers.getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourControllers.getMonthlyPlan
  );

tourRouter
  .route('/')
  .get(tourControllers.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourControllers.createTour
  );

tourRouter
  .route('/:id')
  .get(tourControllers.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    tourControllers.auploeadTourImages,
    tourControllers.resizeTourPhoto,
    tourControllers.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourControllers.deleteTour
  );

module.exports = tourRouter;
