const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
const Locations = require('../Location/LocationSchema').Schema;

var userSchema = mongoose.Schema({
    local: {
      email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
      },
      password: {type: String, required: true},
      username: {type: String, required: true, unique: true}
    },
    socialMediaHandles: {
      type: Map,
      of: String
    },
    stories: [{type: mongoose.Schema.Types.ObjectId, ref: 'Story'}],
    posts: {
      trips: [{type: mongoose.Schema.Types.ObjectId, ref: 'Trips'}],
      days: [{type: mongoose.Schema.Types.ObjectId, ref: 'Days'}],
      locations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Locations'}]
    },
    photos: {
      profile: String
    }
});

userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('local.password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.local.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.local.password = hash;
      next();
    });
  });
});

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);