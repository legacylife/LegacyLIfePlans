var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var financesSchema = new mongoose.Schema({
  customerId: String,
  financesType: String,
  administatorName: String,
  branchLocation: String,
  financesTypeNew:String,
  accountNumber:String,
  contactEmail:String,
  contactPhone:String,
  comments:String,
  documents:Array,
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('finances', financesSchema)
