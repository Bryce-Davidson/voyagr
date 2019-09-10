const mongoose              = require('mongoose');
const { pointSchema }       = require('../Geoschema-Types/GeoSchemas');
const arrayLengthVal      = require('../validators/array-length-validator');

const LocationSchema = new mongoose.Schema({
  name: {type: String, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  trips: [{type: mongoose.Schema.Types.ObjectId, ref: 'Trip'}],
  description: String,
  location: {
    type: pointSchema,
    required: true
  },
  address: String,
  settings: {
    public: {type: Boolean, required: true, default: true}
  },
  tags: {
    type: [String],
    validate: [arrayLengthVal, '{PATH} exceeds the limit of 15']
  },
  meta: {
    urlid: {type: String, required: true, index: true},
    created: { type : Date, default: Date.now },
    viewCount: {type: Number, default: 0},
    likes: {type: Number, default: 0},
    numberOfComments: {type: Number, default: 0},
    numberOfShares: {type: Number, default: 0}
    },
    photos: {
      image_1: String,
      image_2: String,
      image_3: String,
      image_4: String,
      image_5: String
    },
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    typeoflocation: String,
    budget: {
      lowerBound: Number,
      upperBound: Number,
      middleBound: Number
    }
});

// QUERIES ---------------------------------------------------

LocationSchema.query.nearPoint = function(coordinates, maxDistance) {
 return this.where('location')
            .near({ center: { coordinates, type: 'Point' }, maxDistance, spherical: true })
};

// INDEXES ---------------------------------------------------

LocationSchema.options.autoIndex = true;

LocationSchema.index({ location: "2dsphere" });

LocationSchema.index({name: 'text', description: 'text'}, {weights: { name: 5, description: 3,}});

// MIDDLEWARE ------------------------------------------------

LocationSchema.pre('save', async function computeMiddleBound(next) {
  if(!this.isModified('budget.lowerBound') || !this.isModified('budget.lowerBound')) return next();
  this.budget.middleBound = Math.round((this.budget.upperBound + this.budget.lowerBound) / 2)
  next()
});

LocationSchema.pre('findOne', function autoPopUser(next) {
  this.populate('user', 'local.username photos.profile'); 
  next();
});

var Location = mongoose.model("Location", LocationSchema);

module.exports = Location;