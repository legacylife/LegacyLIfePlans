var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var inviteTempSchema = new mongoose.Schema({
  inviteById: String,
  documents:Array,
  status: String,  
  createdOn: Date
})

module.exports = mongoose.model('invite_temp', inviteTempSchema)
