const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * Delete [Model]
 */
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

/**
 * Update [Model]
 */
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

/**
 * Create [Model]
 */
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

/**
 * Get One [Model] (defensive)
 *
 * This version:
 *  - logs the incoming id (helpful while debugging)
 *  - tries findById first, then falls back to findOne({_id: id})
 *  - preserves populate options
 */
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // Defensive debug logs — remove/replace with logger in production
    console.log('getOne called — Model:', Model.modelName, 'id:', req.params.id, 'url:', req.originalUrl);

    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    // primary attempt
    let doc = await query;

    // fallback: try a plain findOne in case findById was affected by query middleware
    if (!doc) {
      console.log('findById returned null — trying fallback findOne({_id: req.params.id})');
      doc = await Model.findOne({ _id: req.params.id }).populate(popOptions || '');
    }

    if (!doc) {
      console.log('No document found for id:', req.params.id);
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

/**
 * Get All [Model]
 */
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // Allow nested GETs (e.g. reviews on a tour)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
