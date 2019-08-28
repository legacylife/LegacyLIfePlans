/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 26 Aug 2019 10:00 PM
 * @description: Helper class for update the activity logs
 */
const constants = require('./../config/constants')
const mongoose = require('mongoose')
const ActivityLogs = require('./../models/ActivityLogs.js')
const User = require('./../models/Users')

const updateActivityLogs = (fromUserId, toUserId, activity, activityMessage = "", section = null, sectionId = null ) => {
  return new Promise(function (resolve, reject) {

    User.findOne({ _id: fromUserId }, { firstName: 1, lastName: 1, profilePicture: 1 }, function (err, userList) {

      if (err) {
        let result = { "message": "Something Wrong!" }
        resolve("error");
      }
      else {
        var activityLog                 = new ActivityLogs();
            activityLog.fromUserId      = fromUserId;
            activityLog.toUserId        = toUserId;
            activityLog.activity        = activity;
            activityLog.description     = activityMessage;
            activityLog.section         = section;
            activityLog.sectionId       = sectionId ? mongoose.Types.ObjectId(sectionId) : '';
            activityLog.createdOn       = new Date();
            activityLog.modifiedOn      = new Date();
            activityLog.createdBy       = mongoose.Types.ObjectId(fromUserId);
            activityLog.modifiedBy      = mongoose.Types.ObjectId(fromUserId);

        activityLog.save({}, function (err, newEntry) {
          if (err) {
            resolve("error");
          } else {
            resolve("success");
          }
        })
      }
    })
  })
}
module.exports = { updateActivityLogs }
