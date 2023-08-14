const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModle');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Factory = require('./handlerFactory');
const { async } = require('regenerator-runtime');

//built the upload by multerFilter and multerStorage
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! please upload only images', 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.auploeadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourPhoto = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) {
    return next();
  }
  // 1)CoverImage
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`; // to be send to db by the updateOne middleware
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2)images
  req.body.images = [];
    await Promise.all(
        req.files.images.map(
            //we use map not forEach because in foreach we cant wait anything we just work the cb not waiting any thing wiht map we will await a lot of promisec one for every file
            async (file, currentIndex) => {
                const fileName = `tour-${req.params.id}-${Date.now()}-${currentIndex + 1 }.jpeg`; //we need it to push it to req.body.images
          
                await sharp(file.buffer)
                  .resize(2000, 1333)
                  .toFormat('jpeg')
                  .jpeg({ quality: 90 })
                  .toFile(`public/img/tours/${fileName}`);
          
                req.body.images.push(fileName);
              }
            )
        
    )
  next();
});

//aggregation pipeline for Calc the statstic of our project
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: 'ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});
// this is a real bessence problem we want to know tha best month in given year
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { numTourStarts: -1 } },
  ]);
  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});
//get the tours that distance between my location(latlng) and it is (distance)in unit
//tours-within/:distance/center/:center/unit/:unit
//tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lng, lat] = latlng.split(',').map((el) => (el = el * 1));
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // convert distance to radian unit
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng ',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }, //mongodb take the radius in radian unit
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
// بحسب المسافه من نقطه معينه  الي النقاط الاخري بتاعت الرحلات
exports.getDistances = catchAsync(async (req, res, next) => {
  const { lnglat, unit } = req.params;
  const [lng, lat] = lnglat.split(',').map((el) => (el = el * 1));
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng ',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance', //this stage must be the first
        distanceMultiplier: multiplier,
      },
    }, //to convert to km
    { $project: { distance: 1, name: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

// Tour Handlers
exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price';
  req.query.fields = 'name duration ratingsAverage price summary description';
  next();
};
exports.getAllTours = Factory.getAll(Tour);
exports.getTour = Factory.getOne(Tour, { path: 'reviews' });
exports.createTour = Factory.createOne(Tour);
exports.updateTour = Factory.updateOne(Tour);
exports.deleteTour = Factory.deleteOne(Tour);
