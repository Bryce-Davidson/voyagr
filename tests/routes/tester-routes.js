var express                   = require('express');
var router                    = express.Router();
const Location                = require('../../models/Location/LocationSchema')
const User                    = require('../../models/User/UserSchema');
const Trip                    = require('../../models/Trip/TripSchema');

// TEST ROUTES ----------------------------------------------------------------

router.route('/search')
  .get((req, res, next) => {
    let filter = req.body.filter;
    Trip.find(filter)
      .then(docs => {
        res.send(docs)
      })
      .catch(next)
  })

router.route('/searchtrips')
  .post((req, res, next) => {
    let query = req.query.q;
    Trip.find({
      $text: { $search: query }
    }, { score: { $meta: "textScore" } }
    ).sort( { score: { $meta: "textScore" } } )
    .then(q => {
      console.log(q); 
      res.send(q)
    })
    .catch(next)
  });

router.route('/sessionlogger')
    .get((req, res, next) => {
        res.send(req.session)
      });

router.route('/finduser')
    .get((req, res, next) => {
      User.findById(req.session.passport.user)
      .then(user => {
        res.send(user)
      })
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