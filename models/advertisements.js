var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var advertisementsSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userType: String,
  fromDate: Date,
  toDate: Date,
  zipcodes: String,
  message: String,
  adminReply:Array,
/*   adminReply: [{
    adminId: { type: mongoose.Types.ObjectId, ref: 'users' },
    status: String,
    zipcodes: Array,
    cost: String,
    message: String,
    paymentDetails : {
      inviteId: String,
      inviteItemId: String,
      status: String, //pending, done, delete, void
      createdOn: Date,
      modifiedOn: Date
    },
    createdOn: Date,
  }], */
  uniqueId: String,
  status: String,
  sponsoredStatus: String,
  createdOn: Date,
  modifiedOn: Date
})
//adminReply:-  cost: String,stripePaymentLink: String,token: String,zipcodes: String, createdOn: Date,
module.exports = mongoose.model('advertisements', advertisementsSchema)
