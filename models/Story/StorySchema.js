const mongoose = require('mongoose');

var StorySchema = mongoose.Schema({
    name: {type: String, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, required: true},
    contents: {
        trips: [{type: mongoose.Schema.Types.ObjectId, ref: 'Trips'}],
        days: [{type: mongoose.Schema.Types.ObjectId, ref: 'Days'}],
        locations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Locations'}]
    },
    settings: {
        private: {type: Boolean, default: true}
    }
  });

module.exports = mongoose.model('User', StorySchema);