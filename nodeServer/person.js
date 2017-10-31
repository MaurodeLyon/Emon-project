var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PersonSchema = new Schema({
    name: String,
    password: String
});

module.exports = mongoose.model('Person', PersonSchema);