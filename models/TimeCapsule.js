var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var timeCapsuleSchema = new mongoose.Schema({
  customerId: String,
  name: String,
  documents: Array,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('time_capsule', timeCapsuleSchema)
