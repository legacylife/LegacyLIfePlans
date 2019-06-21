var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var vehiclesSchema = new mongoose.Schema({
  customerId: String,
  model: String,
  year: String,
  make: String,
  titleLocation: String,
  financeCompanyName: String,
  accountNumber: String,
  payment: String,
  comments: String,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('vehicles', vehiclesSchema)
