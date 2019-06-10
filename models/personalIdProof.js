var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var personalIdProofSchema = new mongoose.Schema({  

  documentType:String,
  socialSecurityNumber:String,
  locationOfCard:String,
  comments:String,
  idProofDocuments:Array,

  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('personal_id_proof', personalIdProofSchema)
