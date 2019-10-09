var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var digitalPublicationsSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,
  title: String,
  username:String,
  password:String,
  comments:String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('digital_publications', digitalPublicationsSchema)
