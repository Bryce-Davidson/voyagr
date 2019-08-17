const Comment = require('../../models/Comment/CommentSchema');
const { userCanAlter } = require('../local-functions/schemaMethods');
// SET ALL CHILDREN PRIVATE OR PUBLIC  ----------------------------


// GET FEATURED POSTS ---------------------------------------------

getFeaturedPostsUtil = function(Model) {
    return function (req, res, next) {
        const pagenation = parseInt(req.query.pagenation);
        Model.find({}).sort({'meta.view_count': -1, 'meta.numberOfComments': -1, 'meta.likes': -1})
            .where({private: false})
            .limit(pagenation)
            .then(featured => res.send(featured))
            .catch(next)
    }
}

// TEXT SEARCH POST NAMES -----------------------------------------

textSearchPostUtil = function(Model) {
    return function (req, res, next) {
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
    }
}

// COMMENT ON POST -------------------------------------------------

addCommentUtil = function(Model) {
    return function(req, res, next) {
        let comment = new Comment ({
                "postid": req.params.id,
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
    textSearchPostUtil, 
    getFeaturedPostsUtil 
};