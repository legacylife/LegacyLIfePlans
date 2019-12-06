/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 06 Sept 2019 04:00 PM
 * @summary: Coach Corner Post Model
 * @description: Model to set the collection schema for coach corner posts
 * @link : api/coach-corner-post
 */

var mongoose = require( 'mongoose' )
var coachCornerSchema = new mongoose.Schema({
  aliasName: String,
  title: String,
  description: String,
  category: { type: mongoose.Types.ObjectId, ref: 'coach_corner_category' },
  //image: String,
  //image:Array,
  image : {
    title : String,
    size : String,
    extention : String,
    tmpName : String
  }, 
  viewDetails: [{
    userId: { type: mongoose.Types.ObjectId, ref: 'users' },
    userIpAddress: String,
    viewedOn: Date,
  }],
  status: String,
  createdBy: String,
  createdOn: Date,
  modifiedOn: Date,
  modifiedBy: String
})

module.exports = mongoose.model('coach_corner_post', coachCornerSchema)