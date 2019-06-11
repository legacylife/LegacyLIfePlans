var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var personalIdProofSchema = new mongoose.Schema({  
  customerId: String,
  documentType:String,
  socialSecurityNumber:String,
  locationSocialSecurityCard:String,
  licenseNumber:String,
  nonDriverIDNumber:String,
  DoDIDNumber:String,
  placeOfBirth:String,
  countryOfIssue:String,
  DBN:String,
  fileNumber:String,
  state:String,
  passportNumber:String,
  locationDriverLicense:String,
  locationDoDID:String,
  expirationDate:String,
  locationPassport:String,
  LocationWorkPermitVisa:String,  
  idProofDocuments:Array,
  comments:String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('personal_id_proof', personalIdProofSchema)
