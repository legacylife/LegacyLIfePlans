var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var hireAdvisorsSchema = new mongoose.Schema({
  customerId: mongoose.Schema.Types.ObjectId,
  advisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  selectAll : String,  
  userAccess:Object,  
  filesCount: String,
  folderCount: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date,
  createdby: mongoose.Schema.Types.ObjectId,
  modifiedby: mongoose.Schema.Types.ObjectId
})

module.exports = mongoose.model('hired_advisors', hireAdvisorsSchema)
