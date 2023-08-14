const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModle');
const Booking = require('../models/bookingModle');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Factory = require('./handlerFactory');
const User = require('../models/userModle');

exports.getCheckOutSession = catchAsync(async (req, res, next) => {
  // 1)get the booked tour
  const tour = await Tour.findById(req.params.tourId);

  //2)create the session
  const session = await stripe.checkout.sessions.create({
    //info about the session
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user._id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    //info about the product
    line_items: [
      {
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });
  //3)send the session to the client
  res.status(200).json({
    status: 'success',
    session,
  });
});

// //create booking document when user is successfuly checkout
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0])//redirect to the home page and hinde the query string
});

// make the user can review in his booked tour only 
exports.checkIfBooked = catchAsync(async (req, res, next) => {

  const bookings = await Booking.find({user:req.user.id,tour:req.body.tour})
  
  if(!bookings){
    return new AppError('You can make review Only on you booked tours',401)
  }
  next()
})


exports.getAllBookings = Factory.getAll(Booking)
exports.createBooking = Factory.createOne(Booking)
exports.getBooking = Factory.getOne(Booking)
exports.updateBooking = Factory.updateOne(Booking)
exports.deleteBooking = Factory.deleteOne(Booking)
