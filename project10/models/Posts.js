const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let postSchema = new Schema ({
    user: {type: Object},
    title: {type: String},
    post: {},
    comments: {type: Array},
    votes: {type: Number, default: 0}

}, { timestamps: true });

module.exports = mongoose.model("posts", postSchema);