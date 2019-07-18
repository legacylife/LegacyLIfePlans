var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var advisorActivityLogSchema = new mongoose.Schema({
  customerId: mongoose.Schema.Types.ObjectId,
  hiredAdvisorRefId:mongoose.Schema.Types.ObjectId,
  customerFirstName: String,
  customerLastName: String,
  customerProfileImage: String,
  advisorId: mongoose.Schema.Types.ObjectId,
  activityMessage: String,
  sectionName: String,
  actionTaken: String,
  createdOn: Date,
  modifiedOn: Date,
  createdBy: mongoose.Schema.Types.ObjectId,
  modifiedBy: mongoose.Schema.Types.ObjectId
})

module.exports = mongoose.model('advisor_activity_log', advisorActivityLogSchema)
