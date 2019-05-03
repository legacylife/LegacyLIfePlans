var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var cmsSchema = new mongoose.Schema({
  pageFor: String,
  pageCode: String,
  pageTitle: String,
  pageBody: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('cms_pages', cmsSchema)
