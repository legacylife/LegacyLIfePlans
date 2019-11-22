var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var finalWishesPlansSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,

  funaralServiceType: { type: String, default:'1' },
  serviceFor: String,
  serviceForOther: String,
  isBodyPresent:{ type: String, default:'No' },
  isCasket : { type: String, default:'No' },
  deceasedWear: String,

  serviceParticipants:String,
  leaderChecked:{ type: Boolean, default:false },
  leaderDescrption:String,
  eulogistChecked:{ type: Boolean, default:false },
  eulogistdescription:String,   
  reflectionsChecked:{ type: Boolean, default:false },
  reflectionsDescription:String,
  readingsChecked:{ type: Boolean, default:false },
  readingsDescription:String,
  musiciansChecked:{ type: Boolean, default:false },
  musiciansDescription:String,  
  pallbearersChecked:{ type: Boolean, default:false },
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
