var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var fileActivityLogSchema = new mongoose.Schema({
  customerId: String,
  fileId: String,
  fileName: String,
  folderName: String,
  subFolderName: String,
  createdOn: Date,
  modifiedOn: Date,
  createdBy: String,
  modifiedBy: String
})

module.exports = mongoose.model('file_activity_log', fileActivityLogSchema)
