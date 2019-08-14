var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var inviteSchema = new mongoose.Schema({
  inviteById: String,
  inviteToId: String,
  inviteType: String,
  name: String,
  email: String,
  relation: String,
  documents:Array,
  status: String,  
  inviteCode: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('invite', inviteSchema)
