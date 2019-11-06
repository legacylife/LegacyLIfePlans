var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")
/*
For deceased user subscription ends, system sent an email to executor / admin.
*/
var deceasedSchema = new mongoose.Schema({
  customerId:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  subscriptionEndDate:String,
  deceasedReminder : {
    //lockoutLegacyDate: String,
    reminderCount:String,
    trustId:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},    
    reminders:[{      
      reminderDate:Date,
      mailStatus: String
    }]
  },
  remaining: String,
  createdOn: Date
})

module.exports = mongoose.model('deceased_reminder_emails',deceasedSchema)
