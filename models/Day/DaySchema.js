var mongoose = require('mongoose');

const DaySchema = new mongoose.Schema({
  name: {type: String, required: true, maxlength: [100, 'Name must be less than 100 characters']},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  trip: {type: mongoose.Schema.Types.ObjectId, ref: 'Trip'},
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

// INDEXES ---------------------------------------------------

DaySchema.options.autoIndex = true;

DaySchema.index({
  name: 'text',
  description: 'text',
}, {
  weights: {
    name: 5,
    description: 3,
  },
});

// MIDDLEWARE --------------------------------------------------

DaySchema.pre('find', function() {
  // this refers to the query object
  this.where({private: false});
});


var Day = mongoose.model("Day", DaySchema);

module.exports = Day;