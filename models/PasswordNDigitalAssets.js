var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var devicePasswordsSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,
  deviceList: String,
  deviceName: String,
  username:String,
  passwordType:String,
  password:String,
  pin:String,
  passwordPattern:String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('device_password', devicePasswordsSchema)
