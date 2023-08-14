const crypto = require('crypto');
const mongoose = require('mongoose');
// const slugify = require('slugify')
const validator = require('validator'); // this is a package for validate stirings only by some costoem validator
const bcrypt = require('bcryptjs')
const catchAsync = require('../utils/catchAsync');

const userSchema = new mongoose.Schema({
  name: {
    type: 'String',
    required: [true, 'Please tell us your name'],
    trim: true,
  },
  email: {
    type: 'String',
    unique: true,
    required: [true, 'Please tell us your email'],
    lowercase: true,
    validate: [validator.isEmail, 'please enter a valid email'],
  },
  role: {
    type: 'String',
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  photo: { type: 'String' ,default:'default.jpg'},//make the default for the new users 
  password: {
    type: 'String',
    required: [true, 'password is required'],
    minLength: 8,
    select: false,
  }, //select :false because i don't want the password to be sended to the client when is get all users
  passwordChangedAt: Date,
  passwordConfirm: {
    type: 'String',
    required: [true, 'you should confirm your password'],
    //the validator is work only wehn create or save  return true or false
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  active: { type: Boolean, default: true, select: false },
});
// this function is run only if the password is modified
//from the json file all the passwords is test 1234
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); //الباس لو متعدلش او حد انشاء واحد جديد عدي ومتعملش حاجه

  this.password = await bcrypt.hash(this.password,12)
  this.passwordConfirm = undefined; //to avoid the error of the passwords are not the same
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // this 1 scond t o insure that the token has benn crated after the password has ben changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  //this here is point to the current query
  this.find({ active: { $ne: false } });
  next();
});
//                                              from body(not hased)           from DB (hased)
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  //return true or false
  return await bcrypt.compare(candidatePassword, userPassword);
  //compare the hashed password in the DB and the body password from the user
};

userSchema.methods.changePasswordAfter = function (jwtTimeStamp) {
  //if true this mean that the password has changed
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedTimeStamp > jwtTimeStamp;
  }
  //means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  //hashing the resetToken to  protect it form hacking the DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 20 * 60 * 1000; //the live period of this token
  console.log({ resetToken }, '           ', this.passwordResetToken);
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
