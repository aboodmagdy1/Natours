const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactory');
const APIFeatures = require('../utils/apiFeatures');

exports.getAll = (Modle) =>
  catchAsync(
    async (
      req,
      res,
      next //tours is the resource here so will send all the info
    ) => {
      let filter = {}; //filter object to get a review of specific tour ( nested routes)
      if (req.params.tourId) filter = { tour: req.params.tourId };
      if (req.params.userId) filter = { user: req.params.userId };

      const features = new APIFeatures(Modle.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const docs = await features.query;
      res
        .status(200)
        .json({ status: 'success', result: docs.length, data:  docs  });
    }
  );

exports.getOne = (Modle, popOptions) =>
  catchAsync(
    async (
      req,
      res,
      next //doc is the resource here so will send all the info
    ) => {
      let query = Modle.findById(req.params.id);
      if (popOptions) query = query.populate(popOptions);
      const doc = await query;

      if (!doc) {
        return next(new AppError('This document ID is not Found', 404));
      } //if the id is not exist
      res.status(200).json({
        status: 'success',
        data: { data: doc },
      });
    }
  );

exports.createOne = (Modle) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Modle.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { data: newDoc },
    });
  });

exports.updateOne = (Modle) =>
  catchAsync(async (req, res, next) => {
    const doc = await Modle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('This document ID is not Found', 404));
    } //if the id is not exist

    res.status(200).json({ status: 'success', data: { data: doc } });
  });

exports.deleteOne = (Modle) =>
  catchAsync(async (req, res, next) => {
    const doc = await Modle.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('This document ID is not Found', 404));
    } //if the id is not exist

    res.status(204).json({ status: 'success' });
  });
