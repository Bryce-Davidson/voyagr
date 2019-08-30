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
        let { near, tags, text, contains } = req.query
        let built = {};
        if (near && Model !== Location) {return res.send('Please use locations to search near, otherwise use contains') }
        if (near && Model === Location) {
            let maxDistance = near.substring(near.indexOf(':') + 1, near.indexOf('@'))
            let coordinates = near.substring(near.indexOf('@') + 1).split(',').reverse()
            built.location = { 
            $near: { 
                    $geometry: { type: 'Point', coordinates },
                    $maxDistance: maxDistance
                }
            }
        }
        if (contains && category != 'locations') {built.contains = contains.split(',')} 
        if (tags) { built['meta.tags'] = { $all: tags.split(',') }} 
        if (text) { built.$text = { $search: text } }
    
        Model.find(built)
        .then(docs => {
            res.send(docs)
        }).catch(next)
    }
}

module.exports = globalsearch;

let idea = {
    location: {
      $near: {
        $geometry: {
           type: "Point" ,
           coordinates: [ -123.46109239999998, 48.4529784]
        },
        $maxDistance: 1000,
      }
    }
 }

 let what = { location: { 
    $near: {
        $geometry: {
           type: "Point" ,
           coordinates: [ -123.46109239999998, 48.4529784]
        },
        $maxDistance: 10000,
      }
 }}

