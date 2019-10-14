var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var executorSchema = new mongoose.Schema({
  userType: String,
  customerId: String,
  userType: String,
  trustId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  advisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deceased : {
    status: String,
    lockoutLegacyDate: String,
    reminderCount:String,
    reminders:[{      
      reminderDate:Date,
      mailStatus: String
    }]
  },
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('mark_executor',executorSchema)
