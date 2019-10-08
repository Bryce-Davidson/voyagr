const { SECRET } = require('../../../config/keys');
const jwt = require('jsonwebtoken');

module.exports = async function validateToken(req, res, next) {
    if(req.token) {
        jwt.verify(req.token, SECRET, {}, (err, authData) => {
            if(err) {
                return res.status(401).json({msg: "Unauthorized token"})
            } else {
                req.user = authData.user;
                return next();
            }
        })
    } else next();
}