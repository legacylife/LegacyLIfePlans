var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var specialNeedsSchema = new mongoose.Schema({
  customerId: String,
  title: String,
  folderName: String,
  comments: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('special_needs', specialNeedsSchema)
