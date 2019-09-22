module.exports = async function(res, path) {
    return res.status(403).json({ msg: `Unable to update on immutable path ${path}.` });
}

