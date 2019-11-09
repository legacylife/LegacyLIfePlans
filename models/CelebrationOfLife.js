var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var celebrationOfLifeSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,
  subFolderName: String,

  eventByName:String,
  eventPlace:String,
  speakerAvailable:{ type: String, default:'No' },
  speakerName:String,
  foodNMenuItems:String,
  musicNames:String,
  groupActivities:String,
  documents: Array,
  documentLocation:String,
  mementos:String,
  paymentOptions:String,
  invitedPeople:[{
      id: String,  
      name: String,
      phoneNumber: String,
      emailId:String
  }],

  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('celebrations', celebrationOfLifeSchema)
