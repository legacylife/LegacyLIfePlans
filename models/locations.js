var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var locationsSchema = new mongoose.Schema({
  ZIP: String,
  City: String,
  ST: String,
})

module.exports = mongoose.model('locations_zipcodes',locationsSchema)
