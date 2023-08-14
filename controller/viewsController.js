const Tour = require('../models/tourModle');
const User = require('../models/userModle');
const Booking = require('../models/bookingModle');

const catchAsync = require('../utils/catchAsync');
const AppError= require('../utils/AppError')

exports.getOverview = catchAsync(async (req, res) => {
  // 1)Get tours data from collection
  const tours = await Tour.find({});
  // 2)Build template

  // 3)Render that template using tour data from step 1
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res,next) => {
  // 1)get the data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });
  


  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});
exports.getLoginForm = catchAsync(async (req, res, next) => {
  // 1)
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
      title: `log into your account`,
    });
});

exports.getAccount = catchAsync(async ( req,res,next ) => {

  res.status(200).render('account',{
    title:'Your account'
  })
})

exports.updateUserData =catchAsync(async (req,res,next) => {
  const updatedUser = await User.findByIdAndUpdate(req.user.id,{name :req.body.name,email:req.body.email},{
    new:true,
    runValidators:true
  })
    res.status(200).render('account',{
      title:'Your account',
      user:updatedUser
    })
}
)


exports.getMyTours = catchAsync(async (req,res,next) => {
  //1)find all bookings
  const bookings = await Booking.find({user:req.user._id})

  //2) Find tours with the returned id's 
    const tourIDs = bookings.map(el=>el.tour) //tour is contain only id so we don't write el.tour.id
    const tours = await Tour.find({_id:{$in:tourIDs}})

    res.status(200).render('overview',{
      tours,
      title:'My Tours'
    })
})