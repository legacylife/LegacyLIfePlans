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
  selectAll : String,  
  userAccess:Object,
  trustCustomerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filesCount: String,
  folderCount: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('addTrustee', TrusteeSchema)
