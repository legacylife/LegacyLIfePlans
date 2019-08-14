var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var cmsFileSchema = new mongoose.Schema({
  folderName: String,
  folderCode: String,
  InstuctionBody: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('cms_file_instructions', cmsFileSchema)
