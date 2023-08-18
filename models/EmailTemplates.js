var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var emailTemplateSchema = new mongoose.Schema({
  type: String,
  code: String,
  //templateCode: String,// this key not in used
  title: String,
  mailSubject: String,
  mailBody: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('email_templates', emailTemplateSchema)
