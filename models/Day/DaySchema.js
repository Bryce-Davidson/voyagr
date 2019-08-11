var mongoose = require('mongoose');
var slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const DaySchema = new mongoose.Schema({
  slug: {type: String, slug: "name", unique: true},
  name: {type: String, required:true, maxlength: [100, 'Name must be less than 100 characters']},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  trip: {type: mongoose.Schema.Types.ObjectId, ref: 'Trip'},
  locations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Location'}],
  description: {type: String, required: true, maxlength: [500, 'Description must be less than 500 characters']},
  settings: {
      private: Boolean
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

DaySchema.index({name: 'text'});

DaySchema.options.autoIndex = true;


var Day = mongoose.model("Day", DaySchema);

module.exports = Day;