var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var sendUserEmailsSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  advisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('sendUserEmails', sendUserEmailsSchema)
