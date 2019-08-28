// we will only allow our user to search by one of the three models
// we will recive each element of data through the url string
// buit with queries and constructed into a mongoose query object

// Search Filter
    // within the URL the parameters we need are
    // ?search_category=trip,day,locations
    // &contains=lat,long
    // &near=distance:1000@lat,long -> near=distance:1000@127.4421,41.2345
    // &tags=comma,seperated,variables
    // &min_budget &max_budget

// Sort Filter
    // most popular
    // most likes
    // most comments

let query = req.query.q;
let filter = req.body.filter || {};
filter.$text = { $search: query }

Model.find(filter, { score: { $meta: "textScore" } })
    .where({private: false})
    .sort( { score: { $meta: "textScore" } } )
    .then(docs => {
        res.send(docs)
    })
    .catch(next)


module.exports = function (Model) {
    return function(req, res, next) {
        res.send(req.query)
    }
}