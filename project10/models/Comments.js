const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let commentSchema = new Schema ({
    user: {type: Object},
    comment: {type: String},
    postID: {type: String},
    votes: {type: Number, default: 0}

}, { timestamps: true });

module.exports = mongoose.model("comments", commentSchema);