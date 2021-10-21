var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    post_user: { type: String }
}, { collection: "forum" });

var models = mongoose.model("addPost", schema);

module.exports = models;