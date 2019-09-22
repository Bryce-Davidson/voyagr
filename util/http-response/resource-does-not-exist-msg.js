module.exports = function(resource, res) {
    return res.status(404).json({msg: `${resource} does not exist.`})
}