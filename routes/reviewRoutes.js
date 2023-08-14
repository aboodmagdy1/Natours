const express = require('express');
const reviewRouter = express.Router({ mergeParams: true }); //this option make the route of reviewModle access to the params of the previous route in the url
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');

reviewRouter.use(authController.protect);

reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    bookingController.checkIfBooked,
    reviewController.createReview
  )
  .patch(reviewController.updateReview);

reviewRouter
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReview
  );

module.exports = reviewRouter;
