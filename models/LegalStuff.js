var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var legalStuffSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,
  subFolderName: String,
  typeOfDocument: String,
  documents: Array,
  comments: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('legal_stuff', legalStuffSchema)