var mongoose              = require('mongoose');
var { pointSchema }       = require('../Geoschema-Types/GeoSchemas');

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
    private: {type: Boolean, required: true, default: false}
  },
  meta: {
    created: { type : Date, default: Date.now },
    viewCount: {type: Number, default: 0},
    tags: [String],
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

var Location = mongoose.model("Location", LocationSchema);

module.exports = Location;