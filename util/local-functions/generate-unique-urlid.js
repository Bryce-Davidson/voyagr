const Trip      = require('../../models/Trip/TripSchema');
const shortid   = require('shortid');

module.exports = async function recursiveGenerateUniqueUrlid(slug, Model) {
    let urlid = shortid.generate();
    return await Model.find({'meta.urlid': urlid, slug})
        .then(docs => {
            if(!docs) {
                return urlid
            } else {
                return recursiveGenerateUniqueUrlid(slug, Model);
            }
        })
}