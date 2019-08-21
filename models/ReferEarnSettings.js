var mongoose = require( 'mongoose' )
var referEarnSettingsSchema = new mongoose.Schema({
  targetCount: Number,
  extendedDays: Number,
  title: String,
  description: String,
  status: String,
  createdBy:String,
  createdOn: Date,
  modifiedOn: Date,
})

module.exports = mongoose.model('refer_earn_settings', referEarnSettingsSchema)