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

const updateActivityLogs = (fromUserId, toUserId, activity, activityMessage = "", section = null, subSection = null, fileName = null ) => {
  return new Promise(function (resolve, reject) {

    User.findOne({ _id: fromUserId }, { firstName: 1, lastName: 1, profilePicture: 1 }, function (err, userList) {

      if (err) {
        let result = { "message": "Something Wrong!" }
        resolve("error");
      }
      else {
        var activityLog                 = new ActivityLogs();
            activityLog.fromUserId      = typeof fromUserId === 'string' ? mongoose.Types.ObjectId(fromUserId) : fromUserId;
            activityLog.toUserId        = typeof toUserId === 'string' ? mongoose.Types.ObjectId(toUserId) : toUserId;
            activityLog.activity        = activity;
            activityLog.description     = activityMessage;
            activityLog.section         = section;
            activityLog.subSection      = subSection;
            activityLog.fileName        = fileName;
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

const cronjobsLogs = (activity, activityMessage ) => {
    return new Promise(function (resolve, reject) {
      // User.findOne({ _id: fromUserId }, { firstName: 1, lastName: 1, profilePicture: 1 }, function (err, userList) {
      //   if (err) {
      //     let result = { "message": "Something Wrong!" }
      //     resolve("error");
      //   }
      //   else {
          var activityLog                 = new ActivityLogs();
              activityLog.fromUserId      = '';
              activityLog.toUserId        = '';
              activityLog.activity        = activity;
              activityLog.description     = activityMessage;
              activityLog.section         = '';
              activityLog.subSection      = '';
              activityLog.fileName        = '';
              activityLog.createdOn       = new Date();
              activityLog.modifiedOn      = new Date();
              // activityLog.createdBy       = mongoose.Types.ObjectId(fromUserId);
              // activityLog.modifiedBy      = mongoose.Types.ObjectId(fromUserId);
  
          activityLog.save({}, function (err, newEntry) {
            if (err) {
              resolve("error");
            } else {
              resolve("success");
            }
          })
       // }
      //})
    })
  }


module.exports = { updateActivityLogs,cronjobsLogs }
