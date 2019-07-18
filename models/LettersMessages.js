var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var lettersMessagesSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,
  title: String,
  subject: String,
  documents: Array,
  letterBox: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date 
})

module.exports = mongoose.model('letter_messages', lettersMessagesSchema)
