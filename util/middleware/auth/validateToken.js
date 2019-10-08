const { SECRET } = require('../../../config/keys');
const jwt = require('jsonwebtoken');

module.exports = async function(req, res, next) {
    // MAKE SURE TOKEN IS FROM US
    jwt.verify(req.token, SECRET, {}, (err, authData) => {
        if(err) {
            return res.status(403).json({msg: "Unauthorized token"})
        } else {
            req.user = authData.user;
            return next();
        }
    })
}