var mongoose = require( 'mongoose' )
var constants = require("../config/constants")

var TrusteeSchema = new mongoose.Schema({
  customerId: String,
  firstName: String,
  lastName: String,
  email: {
    type: String,
    // unique: true,
    required: true
  },
  relation : String,
  messages:Array,
  userAccess:Object,
  trustCustomerId: String,
  profilePicture: String,
  filesCount: String,
  folderCount: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('addTrustee', TrusteeSchema)
