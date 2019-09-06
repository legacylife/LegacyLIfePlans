var mongoose = require( 'mongoose' )
var coachCornerSchema = new mongoose.Schema({
  title: String,
  description:Number,
  category:Object,
  image:String,
  totalView:Number,
  customerStatus: String,
  status: String,
  createdBy:String,
  createdOn: Date,
  modifiedOn: Date,
  modifiedBy: String
})

module.exports = mongoose.model('coach_corner', coachCornerSchema)