var mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    postid: {ref: 'Location', type: mongoose.Schema.Types.ObjectId},
    user: {ref: 'User', type: mongoose.Schema.Types.ObjectId},
    body: {type: String, maxlength: [240, "Comment must be less than 240 characters"]},
    children: {type: mongoose.Schema.Types.ObjectId, ref: 'Comment'},
    meta: {
        created: { type : Date, default: Date.now },
        likes: {type: Number, default: 0}
    }
});

CommentSchema.options.autoIndex = true;

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;