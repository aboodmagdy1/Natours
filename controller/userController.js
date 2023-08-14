const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const User = require('../models/userModle');
const AppError = require('./../utils/AppError');
const Factory = require('./handlerFactory');
const { request } = require('express');
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

exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto =catchAsync(
  async(req, res, next) => {
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    if (!req.file) {
      return next();
    }
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`);
  
    next();
  }
)

exports.createUser = catchAsync(async(req, res, next) => {
  const user =await User.create(req.body)
  res.status(200).json({
    status: 'success',
    user
  });
})
//for admin
exports.getAllUsers = Factory.getAll(User);
exports.getUser = Factory.getOne(User);

//do not update password with this method
exports.updateUser = Factory.updateOne(User);
exports.deleteUser = Factory.deleteOne(User);

//for normal user if he logged in (protect middleware)
const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((field) => {
    if (allowedFields.includes(field)) return (newObj[field] = obj[field]);
  });
  return newObj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//update user data not password (line accunt ....)
exports.updateMe = catchAsync(async (req, res, next) => {
  //1)Create error if user POSTed password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'this route is not for password updates ,please go to  /updateMyPassword route ',
        400
      )
    );
  }
  //2)filter out unwanted fields name s that are not allowed to be updated
  const filterdBody = filterObject(req.body, 'email', 'name');
  if (req.file) filterdBody.photo = req.file.filename; //this line to update the photo url in db

  //3)update user documentation
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { updatedUser },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
