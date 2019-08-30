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


const globalsearch = function (Model) {
    return function(req, res, next) {
        let { near, tags, text, contains } = req.query
        let built = {};

        console.log(text)

        if (near) { 
        built.distance    = near.substring(near.indexOf(':') + 1, near.indexOf('@'))
        built.coordinates = near.substring(near.indexOf('@') + 1).split(',')
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