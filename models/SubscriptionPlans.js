var mongoose = require( 'mongoose' )

var planSchema = new mongoose.Schema({
  planCode: String,
  planName: String,
  description: String,
  stripePlanId: String,
  amount: Number,
  duration: String,
  currency: String,
  status: String
})

module.exports = mongoose.model('subscriptionplans', planSchema)
