var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var obituarySchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,
  check: String,
  prepareTo: String,
  photos: String,
  documents: Array,
  media: String,
  sentTo: String,
  information: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('obituary',obituarySchema)
