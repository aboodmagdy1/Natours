const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const fs = require('fs');
const morgan = require('morgan');
const { catchAsync } = require('async-handler-express');

//import routes handlers
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controller/errorController');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewsRouter = require('./routes/viewsRoutes')
var cookieParser = require('cookie-parser')


const app = express();
//Use helmet to protect HTTP Header
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      allowOrigins: ['*'],
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['*'],
        scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"],
      },
    },
  })
);
//serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//1) Global Middleware

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
console.log(process.env.NODE_ENV);

//limit requests from same api
const limiter = rateLimit({
  max: 20,
  windoMS: 60 * 60 * 1000,
  message: 'Too many requests from this Ip , please try again in a hour!',
});
app.use('/api', limiter);

//Body parser
//in this middleware we can make some options to limit the res amount of data in the body
app.use(express.json({ limit: '10kb' })); //this is a middleware to parse the incoming resquest and put the parsed data in the req.body
app.use(cookieParser());//parses the data form cookies 
app.use(express.urlencoded({extended :true,limit : '10kb'}))//parses data that comming from urlencodded form 

// Data sanitization against NOSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//test middleware 
app.use((req,res,next)=>{
  req.requestTime = new Date().toISOString()
  next()
})
// //test middleware
// app.use((req,res,next)=>{
//   console.log(req.cookies)
//   next()
// })

//2) Routes
app.use('/',viewsRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings',bookingRouter)

//catch the error
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
//the error handler
app.use(globalErrorHandler);
module.exports = app;
