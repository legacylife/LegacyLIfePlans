var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var electronicMediaSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,
  mediaType: String,
  username:String,
  password:String,
  comments:String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('electronic_media', electronicMediaSchema)
