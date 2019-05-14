var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var statesSchema = new mongoose.Schema({
  state_name: String,
  short_code: String 
})

module.exports = mongoose.model('states', statesSchema)
