module.exports =  async function verifyToken(req, res, next) {
    const token = req.cookies['voyagr-authorization'];
    if (token) {
        req.token = token;
        return next()
    } else
        return res.status(401).json({msg: "User not logged in"})
}