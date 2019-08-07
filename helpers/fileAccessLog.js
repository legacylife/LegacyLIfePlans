const constants = require('./../config/constants')
const mongoose = require('mongoose')
const FileActivityLog = require('./../models/FileActivityLog.js')



exports.updateActivityLog = (logData) => {
  
  return new Promise(function(resolve, reject) {
    var proquery = {};
    proquery.customerId = logData.customerId;
    proquery.fileId = logData.fileId;
    proquery.fileName = logData.fileName;
    proquery.folderName = logData.folderName;
    proquery.subFolderName = logData.subFolderName;
    proquery.createdOn = new Date();
    proquery.modifiedOn = new Date();
    proquery.createdBy = logData.customerId;
    proquery.modifiedBy = logData.customerId;

    FileActivityLog.findOne({customerId : logData.customerId, fileId :logData.fileId, folderName:logData.folderName}, {}, function (err, activityLog) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        if(activityLog){
          console.log("ids",activityLog._id)
          FileActivityLog.updateOne({ _id: activityLog._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              console.log(err)
            } else {
              resolve("success");
            }
          })
        }
        else {
          var fileactivitylog = new FileActivityLog();
          fileactivitylog.customerId = logData.customerId;
          fileactivitylog.fileId = logData.fileId;
          fileactivitylog.fileName = logData.fileName;
          fileactivitylog.folderName = logData.folderName;
          fileactivitylog.subFolderName = logData.subFolderName;
          fileactivitylog.createdOn = new Date();
          fileactivitylog.modifiedOn = new Date();
          fileactivitylog.createdBy = logData.customerId;
          fileactivitylog.modifiedBy = logData.customerId;
          console.log("proquery",proquery)
          fileactivitylog.save({ $set: proquery }, function (err, newEntry) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              resolve("success");
            }
          })
        }
      }
    })    
  })
}


exports.removeActivityLog = (removeId) => {
 return new Promise(function(resolve, reject) {
    console.log("removeId->",removeId)
    var query = { fileId: removeId };
    FileActivityLog.remove(query, function(err, obj) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        //resolve("success");
      }
    });

  })
}

// module.exports = { updateActivityLog }
// module.exports = { removeActivityLog }
