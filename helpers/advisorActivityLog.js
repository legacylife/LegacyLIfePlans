const constants = require('./../config/constants')
const mongoose = require('mongoose')
const AdvisorActivityLog = require('./../models/AdvisorActivityLog.js')
const User = require('./../models/Users')



const updateActivityLog = (customerId, advisorId, sectionName, hiredAdvisorRefId ="", trusteeName = "", adminData = []) => {
  return new Promise(function (resolve, reject) {

    User.findOne({ _id: customerId }, { firstName: 1, lastName: 1, profilePicture: 1 }, function (err, userList) {

      if (err) {
        let result = { "message": "Something Wrong!" }
        resolve("error");
      } else {
        var advisorLog = new AdvisorActivityLog();
        advisorLog.customerId = customerId;
        advisorLog.advisorId = advisorId;
        advisorLog.createdOn = new Date();
        advisorLog.modifiedOn = new Date();
        advisorLog.createdby = customerId;
        advisorLog.modifiedby = customerId;
        if(userList.profilePicture){
        advisorLog.customerProfileImage = userList.profilePicture;
        }
        advisorLog.customerFirstName = userList.firstName;
        advisorLog.customerLastName = userList.lastName;
        advisorLog.sectionName = sectionName;
        advisorLog.actionTaken = "";

        if (sectionName == 'hired') {
          advisorLog.actionTaken = "Pending";
          advisorLog.activityMessage = " has requested to hire you";
          advisorLog.hiredAdvisorRefId = hiredAdvisorRefId;
        }

        if(adminData && adminData.adminId){
          advisorLog.actionTaken = "Active";
          advisorLog.activityMessage = " has been to hired you";
          advisorLog.hiredAdvisorRefId = hiredAdvisorRefId;
        }

        if (sectionName == 'contact') {
          advisorLog.activityMessage = " contacted you";
        }

        if (sectionName == 'trustee') {          
          advisorLog.activityMessage = " added "+ trusteeName + " as a trustee";
        }

        advisorLog.save({}, function (err, newEntry) {
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
module.exports = { updateActivityLog }
