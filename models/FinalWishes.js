var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var finalWishesSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,
  title: String,
  subFolderName: String,
  calendarDate: String,
  subFolderDocuments: Array,
  comments: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('final_wishes', finalWishesSchema)
