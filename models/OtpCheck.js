var mongoose = require('mongoose')
var constants = require("./../config/constants")

var OtpCheckSchema = new mongoose.Schema({
  username: String,
  password: String,
  userType: String,
  otpCode: String,
  status: String,
  createdOn: Date
})
module.exports = mongoose.model('otp_checks', OtpCheckSchema)