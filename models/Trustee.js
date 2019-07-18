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
  messages:String,
  selectAll : String,  
  userAccess:Object,
  trustId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filesCount: Number,
  folderCount: Number,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('addTrustee', TrusteeSchema)
