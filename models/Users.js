var mongoose = require( 'mongoose' )
var uniqueValidator = require('mongoose-unique-validator')
var crypto = require('crypto')
var jwt = require('jsonwebtoken')
var constants = require("./../config/constants")

var userSchema = new mongoose.Schema({
  // Common fields
  username: {
    type: String,
    unique: true,
    required: true
  },
  userType: {
    type: String,
    required: true
  },
  hash: String,
  salt: String,
  fullName: String,
  firstName: String,
  middleName: String,
  lastName: String,
  dateOfBirth: String,
  phoneNumber: String,
  landlineNumber: String,  
  addressLine1: String,
  addressLine2: String,  
  zipcode: String,
  city : String,
  state: String,
  country: String,
  socialMediaToken: String,
  socialPlatform: { type: String, default:'Email' },   
  profilePicture: String,
  awardsYears:[{
	id: String,  
    title: String,
    year: String
  }],
  sectionAccess:Object,
  // Advisor fields
  businessName : String,
  businessType : Array, 
  yearsOfService : String, 
  industryDomain : Array, 
  bioText : String, 
  socialMediaLinks : {
      facebook : String, 
      twitter : String,
	  linkedIn : String
  }, 
  websites:[{
	id: String,  
    links: String
  }], 
  specialites:Array,
  hobbies:Array,
  websiteLinks:Array,
  businessPhonePrefix : String, 
  businessPhoneNumber : String, 
  activeLicenceHeld : Array, 
  agencyOversees : String, 
  managingPrincipleName : String, 
  advisorDocuments : Array,
  folders:Array,
  sponsoredAdvisor:String,
  // Subscription fields
  manageOtherProceducers : String, 
  howManyProducers : String, 
  subscription_detail : {
      customer_id : String, 
      plan : String, 
      start_date : Date, 
      end_date : Date
  },
  // System manage fields
  otpCode : String,
  lastLoggedInOn: {
    type: Date,
    //required: true
  }, 
  loginCount: Number,
  resetPasswordToken: String,
  resetPasswordExpiry: Date, 
  expiryDate: Date,
  stripeCustomerId: String,
  emailVerified: {
    type: Boolean,
    default: false,
    required: true
  },  
  ipAddress : String, 
  latitude : String, 
  longitude : String,     
  signupApprovalDate : Date, 
  signupArrovalStatus : String, 
  approveRejectReason : String,      
  accessToken : String,
  createdOn: Date,
  createdBy: String,  
  modifiedOn: Date,
  modifiedBy: String,
  token: String,  
  status: String,
  profileSetup: String,
  allowNotifications:String,
  allowNotifications:String
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