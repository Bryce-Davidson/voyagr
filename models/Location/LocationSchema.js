var mongoose              = require('mongoose');
var commentSchemaNested   = require('../Comment/CommentSchema').Schema;
var { pointSchema }       = require('../Geoschema-Types/GeoSchemas');
  

const LocationSchema = new mongoose.Schema({
  name: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  trips: [{type: mongoose.Schema.Types.ObjectId, ref: 'Trip'}],
  days: [{type: mongoose.Schema.Types.ObjectId, ref: 'Day'}],
  blurb: String,
  location: {
    type: pointSchema,
    required: true
  },
  settings: {
    private: Boolean
  },
  meta: {
    created: { type : Date, default: Date.now },
    view_count: {type: Number, default: 0},
    tags: [String],
    likes: {type: Number, default: 0},
    numberOfComments: {type: Number, default: 0}
    },
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    typeoflocation: String
});

// QUERIES

LocationSchema.query.nearPoint = function(coordinates, maxDistance) {
 return this.where('location')
            .near({ center: { coordinates, type: 'Point' }, maxDistance, spherical: true })
};

LocationSchema.options.autoIndex = true;

LocationSchema.index({ location: "2dsphere" });

var Location = mongoose.model("Location", LocationSchema);

module.exports = Location;