var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var myProfessionalsSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,
  namedProfessionals: String,
  businessName: String,
  name: String,
  address:String,
  mpPhoneNumbers:Array,
  mpEmailAddress:String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('my_professionals', myProfessionalsSchema)
