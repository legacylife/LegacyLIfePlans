var mongoose = require( 'mongoose' )
var freeTrialPeriodSettingsSchema = new mongoose.Schema({
  title: String,
  customerFreeAccessDays:Number,
  customerAftrFreeAccessDays:Number,
  advisorFreeDays:Number,
  customerStatus: String,
  advisorStatus: String,
  createdBy:String,
  createdOn: Date,
  modifiedOn: Date,
})

module.exports = mongoose.model('free_trial_period_settings', freeTrialPeriodSettingsSchema)