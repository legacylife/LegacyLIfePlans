var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var legalStuffSchema = new mongoose.Schema({
  customerId: String,
  subFolderName: String,
  typeOfDocument: String,
  subFolderDocuments: Array,
  comments: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('legal_stuff', legalStuffSchema)
