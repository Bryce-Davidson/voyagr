module.exports =  async function (req, res, next) {
    // GET TOKEN FROM HEADER
    const token = req.headers['authorization']
    if (typeof token !== 'undefined') {
        req.token = token;
        return next();
    } else 
        return res.status(403).json({msg: "Not authorized."})
}