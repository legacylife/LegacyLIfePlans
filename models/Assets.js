var mongoose = require( 'mongoose' )
var constants = require("../config/constants")

var assetsSchema = new mongoose.Schema({
  customerId: String,
  assetType: String,  
  assetValue: String,
  location: String,
  comments: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('assets', assetsSchema)