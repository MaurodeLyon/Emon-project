var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MeasurementSchema = new Schema({
    timestamp: Date
});

module.exports = mongoose.model('Measurement', MeasurementSchema);