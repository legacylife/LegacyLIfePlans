var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var deceasedSchema = new mongoose.Schema({
  userType: String,
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trustId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  advisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  revokeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  documents:Array,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('mark_deceased',deceasedSchema)
