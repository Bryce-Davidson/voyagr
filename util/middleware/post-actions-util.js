const Comment           = require('../../models/Comment/CommentSchema');
const { userCanAlter }  = require('../local-functions/instanceValidation');
const Trip              = require('../../models/Trip/TripSchema');
const Day               = require('../../models/Day/DaySchema');
const Location          = require('../../models/Location/LocationSchema');

// WRITE AS MANY OF THESE AS POSSIBLE IN QUERIES

// GET FEATURED POSTS ---------------------------------------------

getFeaturedPostsUtil = function(Model) {
    return function (req, res, next) {
        const pagenation = parseInt(req.query.pagenation);
        Model.aggregate([
            {$project: { 'locations': 0, 'days': 0, 'meta.tags': 0, 'settings': 0}},
            {$addFields: {
                featuredScore: { $add: [
                    { $multiply: ["$meta.likes", 2]}, 
                    { $multiply: ["$meta.numberOfShares", 3]},
                    '$meta.viewCount'
                ]}}},
            {"$sort": {'featuredScore': -1}},
            {$project: { 'featuredScore': 0}},
            {"$limit": pagenation}
          ])
        .then(featured => res.send(featured))
        .catch(next)
    }
}

// COMMENT ON POST -------------------------------------------------

addCommentUtil = function(Model) {
    let postType;
    return function(req, res, next) {
        let postid = req.params.id;
        let comment = new Comment ({
                'locationid': Model === Location ? postid : null,
                'dayid': Model === Day ? postid : null,
                'tripid': Model === Trip ? postid : null,
                "user": req.session.passport.user,
                "body": req.body.body
        });
        comment.save()
        .then(comment => {
            return Model.findByIdAndUpdate(req.params.id, {
                $inc: {'meta.numberOfComments': 1},
                $push: {comments: comment._id}
                }, {new: true})
                .then(withComment => res.send(withComment))
        }).catch(next)    
    }
}

// LIKE POST -------------------------------------------------------

LikePostUtil = function(Post) {
    return function(req, res, next) {
        Post.findByIdAndUpdate(req.params.id, {
            $inc: {'meta.likes': 1}
        }, {new: true})
        .then(likedPost => res.send(likedPost))
        .catch(next)
    }
}

// DELETE POST ----------------------------------------------------

//TODO: 
    // change the redirect to the user profile page

// redirect back to user profile
deletePostUtil = function(Post) {
    return function(req, res, next) {
        let postid = req.params.id;
        Post.findById(postid)
            .then(post => {
                if (userCanAlter(post, req.user, res)) {
                    Post.findByIdAndDelete(postid)
                        .then(docDeleted => {
                             res.redirect('/');
                        })
                        .catch(next)
                }
            })
    }
}

// SAVE POST TO STORY ----------------------------------------------

module.exports = { 
    addCommentUtil, 
    LikePostUtil, 
    deletePostUtil, 
    getFeaturedPostsUtil 
};