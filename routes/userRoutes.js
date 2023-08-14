// the sequence of middleware is important

const express = require('express');
const userControllers = require('../controller/userController');
const authController = require('../controller/authController');
const bookingRouter = require('./bookingRoutes');

const userRouter = express.Router({mergeParams:true});

userRouter.post('/signup', authController.signUp);
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.logout);
userRouter.post('/forgetPassword', authController.forgetPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword); //because it modifies the password

userRouter.use(authController.protect);

userRouter.patch('/updateMyPassword', authController.updatePassword);
userRouter.get('/me', userControllers.getMe, userControllers.getUser);
userRouter.patch(
  '/updateMe',
  userControllers.uploadUserPhoto,
  userControllers.resizeUserPhoto,
  userControllers.updateMe
  );
  userRouter.delete('/deleteMe', userControllers.deleteMe);
  
  userRouter.use(authController.restrictTo('admin'));
  
  userRouter.use('/:userId/bookings',bookingRouter)
userRouter
  .route('/')
  .get(userControllers.getAllUsers)
  .post(userControllers.createUser);
userRouter
  .route('/:id')
  .get(userControllers.getUser)
  .patch(userControllers.updateUser)
  .delete(authController.restrictTo('admin'), userControllers.deleteUser);

module.exports = userRouter;
