var mongoose = require( 'mongoose' )
var constants = require("../config/constants")

var toDosSchema = new mongoose.Schema({
  customerId: String,
  customerType: String,
  comments: String,
  status: String,
  sortOrder: Number,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('to_dos', toDosSchema)