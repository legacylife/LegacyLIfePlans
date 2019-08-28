/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 26 Aug 2019 10:00 PM
 * @description: Mongo collection schema
 */
var mongoose = require( 'mongoose' )
var activityLogsSchema = new mongoose.Schema({
  fromUserId: Object,
  toUserId:Object,
  activity:String,
  description:String,
  section:String,
  subSection:String,
  fileName:String,
  createdOn: Date,
  modifiedOn: Date,
  createdBy: Object,
  modifiedBy: Object
})

module.exports = mongoose.model('activity_logs', activityLogsSchema)