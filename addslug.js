const mongoose = require('mongoose');
const slugify = require('slugify');
const Tour = require('./models/tourModel');
const User = require('./models/userModel'); // <-- ADD THIS

const DB = 'mongodb+srv://Rishabh:Rishabh10@cluster0.nm3mh73.mongodb.net/natours?retryWrites=true&w=majority';

mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB connected'));

const addSlugsToExistingTours = async () => {
  try {
    const tours = await Tour.find().select('name slug'); // fetch only name & slug

    for (let tour of tours) {
      if (!tour.slug) {
        tour.slug = slugify(tour.name, { lower: true, trim: true });
        await tour.save({ validateBeforeSave: false });
      }
    }

    console.log('All existing tours now have slugs!');
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
};

addSlugsToExistingTours();
