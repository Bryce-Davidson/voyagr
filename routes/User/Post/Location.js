const express = require('express');
const router = express.Router();

// MODELS
const Location = require('../../../models/Location/LocationSchema')

//  DEV ---------------------------------------------------------------

// Show all locations
router.get('/', (req, res, next) => {
  Location.find({}).then(data => res.send(data))
    .catch(err => console.log(err))
});

// APP ----------------------------------------------------------------

router.post('/newlocation', (req, res, next) => {
  const {coordinates, name } = req.body
  // SWITCH from [lat, long] to [long, lat]
  coordinates.reverse();
  Location.create({
    "name": name,
    "location": {
      "type": "Point",
      "coordinates": coordinates
    }
  })
  .then(location => res.send(location))
  .catch(err => {
    console.log(err)
    res.send(err)
  })
});

module.exports = router;