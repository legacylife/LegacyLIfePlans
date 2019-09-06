/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 05 Sept 2019 04:00 PM
 * @summary: Coach Corner Category Model
 * @description: Model to set the collection schema for coach corner operation
 */

var mongoose = require( 'mongoose' )
var coachCornerCategorySchema = new mongoose.Schema({
  aliasName: String,
  title: String,
  orderNo: Number,
  status: String,
  createdBy:String,
  createdOn: Date,
  modifiedOn: Date,
  modifiedBy: String
})

module.exports = mongoose.model('coach_corner_category', coachCornerCategorySchema)