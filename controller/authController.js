const Email = require('../utils/email');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModle');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const userRouter = require('../routes/userRoutes');
const { async } = require('regenerator-runtime');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 1000
    ),
    //  this mean that we can't manipulate cookies in the browser in any way
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  //remove the password form the outpot
  user.password = undefined;
  res.status(statusCode).json({ status: 'success', token, data: user });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createAndSendToken(newUser, 201, res);
});

//loging in  the user as soon as he sign up
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createAndSendToken(user, 200, res);
});
exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
});

//protecting routes(auth routes)
exports.protect = catchAsync(async (req, res, next) => {
  //1)Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  //check if token is sent with req
  if (!token) {
    return next(
      new AppError('You are not Logged in , please log in to have access', 401)
    );
  }

  //2)Verfication token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3)check if user is still exists (it's possible that the user is deleted from the DB  we check this case)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('the user belonging to this token no longer exists', 401)
    );
  }

  //4)Check if user changed password after the taken was issued(created)
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password , please login again!', 401)
    );
  }

  req.user = currentUser; //pass it to the next middleware to work on it
  res.locals.user = currentUser; //for rendering pug pages
  next(); //if all steps is good go to the next middleware
});
//for rendering pages , no errors !(check if the user logged in  and pass it to the pug to render (req.locals))
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    //1)Verfication token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    //2)check if user is still exists (it's possible that the user is deleted from the DB  we check this case)
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    //4)Check if user changed password after the taken was issued(created)
    if (currentUser.changePasswordAfter(decoded.iat)) {
      return next();
    }
    // there is a loggend in user
    res.locals.user = currentUser;
    return next(); //if all steps is good go to the next middleware
  }
  next();
});

//restrict access to specific routes
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(' You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1)Get user based on the Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no use with this email ', 404));
  }

  //2)Generate the random reset token (reset code )and save it in the DB to make the verify on it when user input it and submit
  const resetToken = user.createPasswordResetToken(); // not encrypted this is the original one
  await user.save({ validateBeforeSave: false }); //to avoid the errors that rise from the validation handler

  // 3)send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined);
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email, please try agiain later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)Get the user based on the token
  hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2)if the token has not expired and there is user , set the password
  if (!user) {
    return next(new AppError('the token is invalid or has expired', 400));
  }

  //set the password if there is user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.save();
  //3)updating the passwordChangedAt preperty  pre save in the module

  //send the jwt to be used as a new token for this user (because we change the password )
  createAndSendToken(user, 200, res);
});

//in case he is logged in (we use protect method to authoriz that)
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)get user form collection        from protect
  const user = await User.findById(req.user.id).select('+password');

  //2)check if Posted current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('your current password is wrong', 400));
  }
  //3)if so , updatePassword
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4)log user in ,send JWT
  createAndSendToken(user, 200, res);
});
