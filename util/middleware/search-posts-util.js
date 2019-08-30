// Search Filter
    // within the URL the parameters we need
    // ?search_category=trip,day,locations
    // &contains=lat,long
    // &near=distance:1000@lat,long -> near=distance:1000@127.4421,41.2345
    // &tags=comma,seperated,variables
    // &min_budget &max_budget

// Sort Filter
    // most popular
    // most likes
    // most comments

const Trip        = require('../../models/Trip/TripSchema');
const Location    = require('../../models/Location/LocationSchema');
const Day         = require('../../models/Day/DaySchema');

const globalsearch = function (Model) {
    return function(req, res, next) {
        let { near, tags, text, min_budget, max_budget} = req.query
        let query = {};
        // Location Specific
        if (near && Model !== Location)
            return res.status(405).send('Near is only available for searching locations') 
        if (near && text)
            return res.status(405).send('Near cannot be combined with text, use tags to specify attributes')
        if (near) {
            let maxDistance = near.substring(near.indexOf(':') + 1, near.indexOf('@'))
            let coordinates = near.substring(near.indexOf('@') + 1).split(',').reverse()
            query.location = { $near: { $geometry: { type: 'Point', coordinates }, $maxDistance: maxDistance}}
        }
        // Global
        if (min_budget || max_budget) {
            const mb = query['budget.middleBound'] = {};
            if (min_budget) mb.$gte = min_budget;
            if (max_budget) mb.$lte = max_budget;
        }
        if (tags) { query['meta.tags'] = { $all: tags.split(',') }} 
        if (text) { query.$text = { $search: text } }

        Model.find(query)
        .then(docs => {
            delete query;
            return res.send(docs)
        }).catch(next)
    }
}

module.exports = globalsearch;