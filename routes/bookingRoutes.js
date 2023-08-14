const express = require('express');
const bookingRouter = express.Router({mergeParams:true});
const bookingsController = require('../controller/bookingController');
const authController = require('../controller/authController');

bookingRouter.use(authController.protect);

bookingRouter.get(
  '/checkout-session/:tourId',
  bookingsController.getCheckOutSession
);

bookingRouter.use(authController.restrictTo('admin', 'lead-guide'));

bookingRouter
  .route('/')
  .get(bookingsController.getAllBookings)
  .post(bookingsController.createBooking);

bookingRouter
  .route('/:id')
  .get(bookingsController.getBooking)
  .patch(bookingsController.updateBooking)
  .delete(bookingsController.deleteBooking);

module.exports = bookingRouter;
