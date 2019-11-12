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
  leaderDescrption:String,
  eulogistChecked:String,
  eulogistdescription:String,   
  reflectionsChecked:String,
  reflectionsDescription:String,
  readingsChecked:String,
  readingsDescription:String,
  musiciansChecked:String,
  musiciansDescription:String,  
  pallbearersChecked:String,
  pallbearersDescription:String,
  additionalParticipants:String,
  servicesUsed:String,
  flowersUsed:String,

  isFloralArrangements:{ type: String, default:'No' },
  needVisualTribute:{ type: String, default:'No' },
  peopleInVisualTribute:String,
  havePreparedVisualTribute:{ type: String, default:'No' },
  documents: Array,
  locationOfDocuments:String,
  additionalPlans:String,

  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('finalWishesPlans', finalWishesPlansSchema)
