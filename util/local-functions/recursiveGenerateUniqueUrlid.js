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

return new Promise((resolve, reject) => {
    if(this.days.length === 0) {
      reject(new Error('No days in trip'))
    }
    this.days.forEach((dayid, index) => {
      Day.findByIdAndUpdate(dayid, {'settings.private': status})
      .catch(reject);
      if(index == this.days.length - 1)
        resolve(this);
    })
  })