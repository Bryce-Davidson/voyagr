module.exports = async function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization']
    console.log(req.headers)
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        return next();
    } else {
        return res.status(403).json({msg: "Not authorized."})
    }
}