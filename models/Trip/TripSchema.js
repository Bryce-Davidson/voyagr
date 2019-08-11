var mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  name: {type: String, required: true, maxlength: [100, 'Name must be less than 100 characters']},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  days: [{type: mongoose.Schema.Types.ObjectId, ref: 'Day'}],
  locations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Location'}],
  description: {type: String, required: true, maxlength: [500, 'Description must be less than 500 characters']},
  settings: {
      private: {type: Boolean, required: true, default: false}
  },
  meta: {
      created: { type : Date, default: Date.now },
      view_count: {type: Number, default: 0},
      tags: [String],
      likes: {type: Number, default: 0},
      numberOfComments: {type: Number, default: 0},
      numberOfShares: {type: Number, default: 0}
  },
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
});

// INDEXES -----------------------------------------------------

TripSchema.options.autoIndex = true;

TripSchema.index({
  name: 'text',
  description: 'text',
}, {
  weights: {
    name: 5,
    description: 3,
  },
});

// MIDDLEWARE --------------------------------------------------

var Trip = mongoose.model("Trip", TripSchema);

module.exports = Trip;