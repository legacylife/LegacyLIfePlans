var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var finalWishesPlansSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,

  funaralServiceType: String,
  serviceFor: String,
  serviceForOther: String,
  isBodyPresent:{ type: String, default:'No' },
  isCasket : Array,
  deceasedWear: String,
  serviceParticipants:String,
  leaderChecked:String,
  eulogistdescription:String,









  additionalParticipants:String,
  servicesUsed:String,
  flowersUsed:String,
  
  isFloralArrangements:{ type: String, default:'No' },
  needVisualTribute:{ type: String, default:'No' },
  havePreparedVisualTribute:{ type: String, default:'No' },
  additionalPlans:String,

  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('finalWishesPlans', finalWishesPlansSchema)
