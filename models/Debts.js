var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var debtsSchema = new mongoose.Schema({
  customerId: String,
  debtsType: String,
  debtsTypeNew: String,
  bankLendarName: String,
  accountNumber:String,
  contactEmail:String,
  contactPhone:String,
  comments:String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('debts', debtsSchema)
