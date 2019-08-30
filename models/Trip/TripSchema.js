const Day                 = require('../../models/Day/DaySchema');
const mongoose            = require('mongoose');
const { pointSchema }     = require('../Geoschema-Types/GeoSchemas');

const TripSchema = new mongoose.Schema({
  name: {type: String, required: true, maxlength: [50, 'Name must be less than 50 characters']},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  days: [{type: mongoose.Schema.Types.ObjectId, ref: 'Day'}],
  locations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Location'}],
  description: {type: String, required: true, maxlength: [500, 'Description must be less than 500 characters']},
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
      private: {type: Boolean, required: true, default: true}
  },
  meta: {
      created: { type : Date, default: Date.now },
      tags: [String],
      likes: {type: Number, default: 0},
      viewCount: {type: Number, default: 0},
      numberOfComments: {type: Number, default: 0},
      numberOfShares: {type: Number, default: 0}
  },
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
  photos: {
    banner: String,
    bannerpx500: String,
    bannerpx150: String
  }
});


// INDEXES -----------------------------------------------------

TripSchema.options.autoIndex = true;

TripSchema.index({name: 'text', description: 'text'}, {weights: { name: 5, description: 3,}});

// METHODS ---------------------------------------------------

TripSchema.methods.changeChildStatus = async function(status) {
  return new Promise((resolve, reject) => {
    this.days.forEach((dayid, index) => {
      Day.findByIdAndUpdate(dayid, {'settings.private': status})
      .catch(reject)
      if(index == this.days.length - 1)
        resolve(this);
    })
  })
}

// QUERIES  ----------------------------------------------------

// MIDDLEWARE --------------------------------------------------

TripSchema.pre('save', function(next) {
  const trip = this;
  if(trip.isModified('countries')) {
    trip.countries = trip.countries.map(c => c.toLowerCase())
  }
  return next()
});

var Trip = mongoose.model("Trip", TripSchema);

module.exports = Trip;