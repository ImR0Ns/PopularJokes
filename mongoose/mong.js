var mongoose = require('mongoose');

var sch = new mongoose.Schema({
    _id: { type:String },
    username: { type: String },
    password: { type: String }
}, { collection: "users" });

var mod = mongoose.model("chestie", sch);

module.exports = mod;