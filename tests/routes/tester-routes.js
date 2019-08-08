const passport                = require('../../config/passport');
var express                   = require('express');
var router                    = express.Router();
const Location                = require('../../models/Location/LocationSchema')
const User                    = require('../../models/User/UserSchema');

// TEST ROUTES ----------------------------------------------------------------

router.route('/sessionlogger')
    .get((req, res, next) => {
        res.send(req.session)
      });

router.route('/getuserfromlocation')
.get((req, res, next) => {
  const {name} = req.body;
  Location.find({name})
    .populate('user', '-local.password')
    .then(data => {
      res.send(data[0].user)
    })
});

module.exports = router;