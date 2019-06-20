var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var petsSchema = new mongoose.Schema({
  customerId: String,
  name: String,
  petType: String,
  veterinarian : String,
  dietaryConcerns:String,
  documents:Array,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('pets', petsSchema)
