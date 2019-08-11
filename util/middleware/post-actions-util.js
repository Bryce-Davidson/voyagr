const Comment = require('../../models/Comment/CommentSchema');
const User = require('../../models/User/UserSchema');

// ADD POST TO USER ------------------------------------------------

// COMMENT ON POST -------------------------------------------------

addCommentUtil = function(Model) {
    return function(req, res, next) {
        Comment.create({
                "postid": req.params.id,
                "user": req.session.passport.user,
                "body": req.body.body
        })
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
        Post.findByIdAndDelete(req.params.id)
            .then(docDeleted => {
                 res.redirect('/');
            })
            .catch(next)
    }
}

// SAVE POST TO STORY ----------------------------------------------

module.exports = { addCommentUtil, LikePostUtil, deletePostUtil };