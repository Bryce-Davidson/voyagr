var mongoose        = require("mongoose");
var { pointSchema } = require('../Schema-Types/GeoSchemas')


const LocationSchema = new mongoose.Schema({
  name: String,
  user: String,
  blurb: String,
  location: {
    type: pointSchema,
    required: true
  },
  settings: {
    private: Boolean
  },
  meta: {
    created_at: { type : Date, default: Date.now },
    view_count: {type: Number, default: 0},
    tags: [String],
    comments: [{
          body: { type: String, maxLength: [240, "post body is too long"]}, 
          date: {type: Date, default: Date.now},
          likes: {type: Number, default: 0}
    }],
    likes: {type: Number, default: 0},
    numberOfComments: {type: Number, default: 0}
    },
    typeof: String
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