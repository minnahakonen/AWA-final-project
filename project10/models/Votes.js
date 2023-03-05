const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let voteSchema = new Schema ({
    user: {type: String},
    voted: {type: String}
});

// voteSchema contains combination of the user id and the voted post id or comment id.

module.exports = mongoose.model("votes", voteSchema);
