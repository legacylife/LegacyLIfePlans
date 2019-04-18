var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var globalSettingSchema = new mongoose.Schema({

  key: String,
  value: String,
  name: String,
  description: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date,
})


module.exports = mongoose.model('global_settings', globalSettingSchema)
