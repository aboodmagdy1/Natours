const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getMyTours
} = require('../controller/viewsController');
const { isLoggedIn, protect } = require('../controller/authController');
const { createBookingCheckout } = require('../controller/bookingController');

const viewsRouter = express.Router();

viewsRouter.get('/me', protect, getAccount);
viewsRouter.post('/submit-user-data', protect, updateUserData);
viewsRouter.get('/', createBookingCheckout,isLoggedIn, getOverview); //this is the best place to make the booking doc because this is the url of success
viewsRouter.get('/tour/:tourSlug', isLoggedIn,getTour);
viewsRouter.get('/login', isLoggedIn,getLoginForm);
viewsRouter.get('/my-tours',protect,getMyTours)

module.exports = viewsRouter;
