var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var insuranceSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,
  policyType: String,
  company: String,
  policyNumber: String,
  contactPerson:String,
  contactEmail:String,
  contactPhone:String,
  comments:String,
  documents:Array,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('insurance', insuranceSchema)
