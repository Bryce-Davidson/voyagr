const passport                = require('../../config/passport');
var express                   = require('express');
var router                    = express.Router();

// TEST ROUTES ----------------------------------------------------------------

router.route('/sessionlogger')
    .get((req, res, next) => {
        res.send(req.session)
      });

module.exports = router;