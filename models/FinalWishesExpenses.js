var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var finalWishesExpensesSchema = new mongoose.Schema({
  customerId: String,
  customerLegacyId: String,
  customerLegacyType: String,

  haveFuneralHome:{ type: String, default:'No' },
  funeralHome:String,
  funeralDirector:String,
  address:String,
  phoneNumber:String,
  havePreNeedContract:{ type: String, default:'No' },
  preneedContractLocation:String,
  haveGuarantee:{ type: String, default:'No' },
  prepaidFuneralServices:Array,
  havePriceList:{ type: String, default:'No' },
  totalAmountPay:String,
  haveToPayOnDeath:{ type: String, default:'No' },
  account:String,
  amountInAccount:String,
  financialInstitution:String,

  havePooled:{ type: String, default:'No' },
  pooledAccount:String,
  pooledAmount:String,
  pooledInsuranceCompany:String,
  ContactInfo:String,
  documents:Array,
  comments:String,
  additionalInstructions:String,

  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('finalWishesExpenses', finalWishesExpensesSchema)
