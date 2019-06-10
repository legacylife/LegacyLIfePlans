var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var myessentialsSchema = new mongoose.Schema({
  
  ppFirstName: String,
  ppMiddleName: String,
  ppLastName: String,
  ppDateOfBirth: Date,
  ppEmails: Array,
  ppLandlineNumbers: Array,
  ppCountry: String,
  ppAddressLine1: String,
  ppAddressLine2: String,
  ppCity: String,
  ppState: String,
  ppState: String,
  ppZipCode: String,  
  
  wpWorkBusiness: String,
  wpCompanyName: String,
  wpTitlePosition: String,
  wpDepartment: String,
  wpLandlineNumbers: Array,
  wpCountry: String,
  wpContactPersonName: String,
  wpAddressLine1: String,
  wpAddressLine2: String,
  wpCity: String,
  wpState: String,
  wpZipCode: String,  
  
  ccName: String,
  ccAddressLine1: String,
  ccAddressLine2: String,
  ccZipCode: String,
  ccWorkLandlineNumbers: Array,
  ccContactPersonName: String,
  ccChurchName: String,
  ccChurchAddressLine1: String,
  ccChurchAddressLine2: String,
  ccChurchZipCode: String,
  ccChurchLandlineNumbers: String,
  ccChurchContactPersonName: String,

  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('my_essentials', myessentialsSchema)
