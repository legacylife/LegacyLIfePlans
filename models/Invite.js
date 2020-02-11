var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var inviteSchema = new mongoose.Schema({
  //inviteById: String,
  inviteById:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},  
  inviteToId: String,
  inviteType: String,
  inviteBy: String,
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
