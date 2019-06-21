var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var devicePasswordsSchema = new mongoose.Schema({
  customerId: String,
  deviceList: String,
  deviceName: String,
  username:String,
  password:String,
  passwordPatternDocuments:Array,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('device_password', devicePasswordsSchema)
