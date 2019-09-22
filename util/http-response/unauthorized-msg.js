module.exports = async function(res) {
    return res.status(401).json({msg: 'User Not Authorized.'})
}