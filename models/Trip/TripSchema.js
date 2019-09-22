const Day = require('../../models/Day/DaySchema');
const mongoose = require('mongoose');
const { pointSchema } = require('../Geoschema-Types/GeoSchemas');
const arrayLengthVal = require('../validators/array-length-validator');

const TripSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: [50, 'Name must be less than 50 characters'] },
  slug: { type: String, index: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  days: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Day' }],
  locations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
  description: { type: String, required: true, maxlength: [500, 'Description must be less than 500 characters'] },
  budget: {
    lowerBound: Number,
    upperBound: Number,
    middleBound: Number
  },
  countries: {
    type: [String],
    lowercase: true
  },
  settings: {
    public: { type: Boolean, required: true, default: true }
  },
  tags: {
    type: [String],
    validate: [arrayLengthVal, '{PATH} exceeds the limit of 15']
  },
  meta: {
    urlid: { type: String, required: true, index: true, immutable: true },
    created: { type: Date, default: Date.now, immutable: true},
    likes: { type: Number, default: 0, immutable: true },
    viewCount: { type: Number, default: 0, immutable: true },
    numberOfComments: { type: Number, default: 0, immutable: true },
    numberOfShares: { type: Number, default: 0, immutable: true }, 
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  photos: {
    banner: String
  }
});

// INDEXES -----------------------------------------------------

TripSchema.options.autoIndex = true;

TripSchema.index({ name: 'text', description: 'text' }, { weights: { name: 5, description: 3, } });

// METHODS ---------------------------------------------------

TripSchema.methods.changeChildStatus = async function (status) {
  return new Promise((resolve, reject) => {
    if (this.days.length === 0) {
      reject(new Error('No days in trip'))
    }
    this.days.forEach((dayid, index) => {
      Day.findByIdAndUpdate(dayid, { 'settings.private': status })
        .catch(reject);
      if (index == this.days.length - 1)
        resolve(this);
    })
  })
}

TripSchema.methods.nuke = async function () {
  // go through all days and locations in trip and remove them
}

// QUERIES  ----------------------------------------------------

// MIDDLEWARE --------------------------------------------------

TripSchema.pre('save', async function computeMiddleBound(next) {
  if (!this.isModified('budget.lowerBound') || !this.isModified('budget.upperBound')) return next();
  this.budget.middleBound = Math.round((this.budget.upperBound + this.budget.lowerBound) / 2)
  next()
});

TripSchema.pre('findOne', function autoPopUser(next) {
  this.populate('user', 'local.username photos.profile');
  next();
});

// TripSchema.pre('remove', async function(next) {
//   // delete all photos from S3
//   next()
// });

var Trip = mongoose.model("Trip", TripSchema);

module.exports = Trip;