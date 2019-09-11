const { keysContainString } = require('../../util/local-functions/instance-validation');

module.exports = async function(update) {
    return new Promise((resolve, reject) => {
    if (keysContainString('meta', update))
        return reject({
            msg: 'Unable to update on immutable path "meta".',
            code: 'Immutable'
        });
    if (keysContainString('slug', update))
        return reject({
            msg: 'Unable to update on immutable path "slug".',
            code: 'Immutable'
        });
    else 
        return resolve(update)
    })
}