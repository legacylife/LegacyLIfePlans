var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var finalWishesSchema = new mongoose.Schema({
  customerId: String,
  subFolderName: String,
  Calendar: String,
  subFolderDocuments: Array,
  comments: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('final_wishes', finalWishesSchema)
