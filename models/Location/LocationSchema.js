const mongoose              = require('mongoose');
const { pointSchema }       = require('../Geoschema-Types/GeoSchemas');
const arrayLengthVal      = require('../validators/array-length-validator');

const LocationSchema = new mongoose.Schema({
  name: {type: String, required: true},
  slug: {type: String, index: true, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', immutable: true},
  trips: [{type: mongoose.Schema.Types.ObjectId, ref: 'Trip'}],
  days: [{type: mongoose.Schema.Types.ObjectId, ref: 'Day'}],
  description: String,
  typeOfLocation: {type: String, required: true},
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
    urlid: {type: String, required: true, index: true, immutable: true},
    created: { type : Date, default: Date.now, immutable: true },
    viewCount: {type: Number, default: 0},
    likes: {type: Number, default: 0},
    numberOfComments: {type: Number, default: 0},
    numberOfShares: {type: Number, default: 0}
  },
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
  budget: {
    currency: {type: String, required: true, uppercase: true},
    lowerBound: Number,
    upperBound: Number,
    middleBound: Number
  }
});

// VIRTUALS -------------------------------------------------

// use the virtual setter method here in order to call the instance set. this will
// not triger any middleware


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

LocationSchema.pre('update', async function updateMiddleBound(next) {
  if (this._conditions['budget.upperBound'] || this._conditions['budget.lowerBound']) {
    this.update({},{ $set: { 'budget.middleBound': this._conditions } });
  }

})

LocationSchema.pre('findOne', function autoPopUser(next) {
  this.populate('user', 'local.username photos.profile'); 
  next();
});

var Location = mongoose.model("Location", LocationSchema);

module.exports = Location;