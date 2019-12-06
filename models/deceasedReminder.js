var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")
/*
For deceased user subscription ends, system sent an email to executor / admin.
*/
var deceasedSchema = new mongoose.Schema({
  customerId:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  subscriptionEndDate:String,
  deceasedReminder : [{
    //lockoutLegacyDate: String,
    //reminderCount:String,
    executorId:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},    
    adminId:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},    
    reminderDate:Date,
    mailStatus: String
    // reminders:[{      
    //   reminderDate:Date,
    //   mailStatus: String
    // }]
  }],
 // remaining: String,
  createdOn: Date
})

module.exports = mongoose.model('deceased_reminder_emails',deceasedSchema)
