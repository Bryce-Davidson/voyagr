var mongoose = require('mongoose');

const DaySchema = new mongoose.Schema({
  name: {type: String, required: true, maxlength: [100, 'Name must be less than 100 characters']},
  slug: {type: String, index: true, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  trips: [{type: mongoose.Schema.Types.ObjectId, ref: 'Trip'}],
  locations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Location'}],
  description: {type: String, required: true, maxlength: [500, 'Description must be less than 500 characters']},
  budget: { 
    lowerBound: Number,
    upperBound: Number,
    middleBound: Number
  },
  settings: {
      public: {type: Boolean, required: true, default: true}
    },
  meta: {
    urlid: {type: String, required: true, index: true},
    created: { type : Date, default: Date.now() },
    viewCount: {type: Number, default: 0},
    tags: [String],
    likes: {type: Number, default: 0},
    numberOfComments: {type: Number, default: 0},
    numberOfShares: {type: Number, default: 0}
    },
    photos: {
      banner: String,
      bannerpx500: String,
      bannerpx150: String
    },
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
});

// INDEXES ---------------------------------------------------

DaySchema.options.autoIndex = true;

DaySchema.index({ name: 'text', description: 'text'}, {weights: {name: 5, description: 3,}});

// MIDDLEWARE --------------------------------------------------

DaySchema.pre('findOne', function autoPopUser(next) {
  this.populate('user', 'local.username photos.profile'); 
  next();
});

DaySchema.pre('save', async function computeMiddleBound(next) {
  if(!this.isModified('budget.lowerBound') || !this.isModified('budget.lowerBound')) return next();
  this.budget.middleBound = Math.round((this.budget.upperBound + this.budget.lowerBound) / 2)
  next()
});

var Day = mongoose.model("Day", DaySchema);

module.exports = Day;