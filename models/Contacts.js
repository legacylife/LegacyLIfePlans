var mongoose = require( 'mongoose' )

var contactsSchema = new mongoose.Schema({
  userId: String,
  contactType: String, //Person, Organisation
  person: {
    fullName: String,
    phoneNumbers: [{
      number: String,
      fieldType: String
    }],
    emailIds: [{
      email: String,
      fieldType: String // Work, home, mobile and other
    }],
    organisationId: String
  },
  organisation: {
    name: String,
    address: String
  },
  gmailResourceName: String,
  gmailEtag: String,
  outlookId: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})


module.exports = mongoose.model('contacts', contactsSchema)
