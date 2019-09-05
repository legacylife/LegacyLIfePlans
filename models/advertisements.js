var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var advertisementsSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userType: String,
  fromDate: String,
  toDate: String,
  zipcodes: String,
  message: String,
  adminReply:Array,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})
//adminReply:-  cost: String,stripePaymentLink: String,token: String,zipcodes: String, createdOn: Date,
module.exports = mongoose.model('advertisements', advertisementsSchema)
