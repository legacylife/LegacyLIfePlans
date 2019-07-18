var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var realEstateSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,
  estateType: String,
  address: String,
  mortgageHolder: String,
  accountNumber: String,
  deedLocation: String,
  phoneContact: String,
  comments: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('real_estate', realEstateSchema)
 