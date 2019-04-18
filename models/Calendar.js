var mongoose = require( 'mongoose' )

var calendarSchema = new mongoose.Schema({
  userId: String,
  emailClientId: String,
  title: String,
  subject: {
    type: String, //task, call, meeting, deadline, email, lunch
    default: "task"
  },
  when: {
      "end_time": String,
      "start_time": String
  },
  description: String,
  location: String,
  htmlLink: String,
  owner: {},
  organizer: {},
  participants:[{
    "comment": String,
    "email": String,
    "displayName": String,
    "responseStatus": String
  }],
  linkedDeal: String,
  linkedPerson: String,
  linkedOrg: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})


module.exports = mongoose.model('calendar', calendarSchema)
