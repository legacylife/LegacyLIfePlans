var mongoose = require( 'mongoose' )
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId
var invoiceSchema = new Schema({
  userId: ObjectId,
  token: String,
  chargeId: String,
  planId: ObjectId,
  amount: Number,
  currency: String,
  billDate: Date,
  startDate: Date,
  endDate: Date,
  status: String
})


module.exports = mongoose.model('invoices', invoiceSchema)
