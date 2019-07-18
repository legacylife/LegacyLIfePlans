var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var emergencyContactsSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,
  name: String,
  relationship: String,
  address: String,
  phone:String,
  mobile:String,
  emailAddress:String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('emergency_contacts', emergencyContactsSchema)
