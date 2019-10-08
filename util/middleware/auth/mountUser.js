module.exports =  async function mountUser(req, res, next) {
    // GET TOKEN FROM HEADER
    const token = req.cookies['voyagr-authorization'];
    if (typeof token !== 'undefined') {
        req.token = token;
        return next();
    } else
        next();
}