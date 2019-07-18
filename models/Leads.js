var mongoose = require( 'mongoose' )
var constants = require("../config/constants")

var LeadsSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  advisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('leads', LeadsSchema)