const Trip      = require('../../models/Trip/TripSchema');
const shortid   = require('shortid');

module.exports = async function recursiveGenerateUniqueUrlid(slug) {
    let urlid = shortid.generate();
    Trip.find({'meta.urlid': urlid, slug})
        .then(trip => {
            if(!trip) {
                return urlid
            } else {
                return genUniqueId(slug);
            }
        })
}