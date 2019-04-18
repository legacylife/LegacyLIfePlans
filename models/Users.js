var mongoose = require( 'mongoose' )
var uniqueValidator = require('mongoose-unique-validator')
var crypto = require('crypto')
var jwt = require('jsonwebtoken')
var constants = require("./../config/constants")

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  userType: {
    type: String,
    required: true
  },
  fullName: String,
  contactNumber: String,
  companyName: String,
  companyIndustry: String,
  socialMediaToken: String,
  socialPlatform: { type: String, default:'Email' },
  hash: String,
  salt: String,
  emailVerified: {
    type: Boolean,
    default: false,
    required: true
  },
  profilePicture: String,
  lastLoggedInOn: {
    type: Date,
    required: true
  },
  emailApiCode: String,
  nylasDetails: {
    namespace_id: String,
    account_id: String,
    sid: String,
    access_token: String,
    provider: String,
    email_address: String
  },
  createdOn: Date,
  modifiedOn: Date,
  status: String,
  loginCount: Number,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  folders:[{
    id: String,
    account_id: String,
    name: String,
    display_name: String
  }],
  contactSynced: Boolean,
  dealsCreated: { type: Boolean, default: false },
  calendarSynced: Boolean,
  emailCalendarId: String,
  gmailCreds: {},
  officeCreds: {},
  emailApiType: { type: String, default: 'gmail' }, //gmail, outlook & other
  gmailUserId: String,
  mailChimp: {
    api_endpoint: String,
    access_token: String,
    login_email: String,
    login_name: String
  },
  teamId: String,
  expiryDate: Date,
  stripeCustomerId: String,
  pipelines: Array,
  lastPipelineName: String,
  coachStepsCompleted: Array,
  coachCompleted: Boolean
})

//function to set password
userSchema.methods.setPassword = (password) => {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex')
  return { salt: this.salt, hash: this.hash}
}

//function to validate password
userSchema.methods.validPassword = (password, user) => {
  if(user.salt) {
    var hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex')
    return user.hash === hash
  }
  return -1
}

//function to generate token which is signed by id and email_id with expiry
userSchema.methods.generateJwt = () => {
  var expiry = new Date()
  expiry.setDate(expiry.getDate() + 7)

  return jwt.sign({
    _id: this._id,
    username: this.username,
    fullName: this.fullName,
    exp: parseInt(expiry.getTime() / 1000),
  }, constants.secret)
}

module.exports = mongoose.model('User', userSchema)
userSchema.plugin(uniqueValidator)
