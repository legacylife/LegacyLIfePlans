var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var productSchema = new mongoose.Schema({
  userId: String,
  productName: String,
  productCode: String,
  quantity: Number,
  makeCost: Number,
  sellCost: Number,
  currency: String,
  totalSell: { type: Number, default: 0 },
  deals: Array,
  status: String,
  createdOn: Date,
  modifiedOn: Date,
})


module.exports = mongoose.model('products', productSchema)
