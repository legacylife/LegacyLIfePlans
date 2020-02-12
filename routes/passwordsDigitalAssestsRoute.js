var express = require('express')
var router = express.Router()
var passport = require('passport')
var request = require('request')
var jwt = require('express-jwt')
const mongoose = require('mongoose')
var async = require('async')
var crypto = require('crypto')
var fs = require('fs')
var nodemailer = require('nodemailer')
const { isEmpty, cloneDeep } = require('lodash')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const PDA = require('./../models/PasswordNDigitalAssets.js')
const EMedia = require('./../models/ElectronicMedia.js')
const DigitalPublications = require('./../models/DigitalPublications.js')
const actitivityLog = require('./../helpers/fileAccessLog')
const Trustee = require('./../models/Trustee.js')
const commonhelper = require('./../helpers/commonhelper')
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})
function patternUpdate(req, res) {
  
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  if(query._id){
    PDA.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details  added';
          if (custData.deviceList){
            resText = 'details updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Pending';   
          if(custData.status!=''){
            proquery.status = custData.status;
          }
          proquery.modifiedOn = new Date();
          PDA.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              //let result = { "message": "Password pattren "+resText+" successfully","newEntry":updatedDetails }
              let message = resMessage.data( 607, [{key:'{field}',val:"Password Pattern Details"},{key:'{status}',val: resText}] )
              let result = { "message": message, "newEntry":updatedDetails }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "Password Details "+resText, message, folderName, subFolderName )
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let result = { "message": "No record found." }
          res.send(resFormat.rError(result));
        }
      }
    })
  } else { 
            let { proquery } = req.body;
            var insert = new PDA();
            insert.customerId = query.customerId;
            insert.passwordPattern = proquery.passwordPattern;
            insert.status = 'Pending';
            insert.createdOn = new Date();
            insert.modifiedOn = new Date();
            insert.save({$set:proquery}, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        //let result = { "message": "Password pattren added successfully!","newEntry":newEntry }
        let message = resMessage.data( 607, [{key:'{field}',val:"Password Pattern Details"},{key:'{status}',val: 'added'}] )
        let result = { "message": message, "newEntry":newEntry }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "Password Details Added", message, folderName, subFolderName )
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function DeviceList(req, res) {
  let { fields, offset, query,trusteeQuery, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  PDA.countDocuments(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    PDA.find(query, fields, async function (err, deviceList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        let totalTrusteeRecords = 0;
        if(deviceList.length>0){
          totalTrusteeRecords = await commonhelper.customerTrustees(trusteeQuery)
        }
         res.send(resFormat.rSuccess({ deviceList,totalRecords,totalTrusteeRecords}))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function deviceFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;

  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  var logData = {}
  logData.fileName = proquery.deviceName;
  logData.folderName = 'password-assets';
  logData.subFolderName = 'devices';

  if(query._id){
    PDA.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details  added';
          if (custData.deviceName){
            resText = 'details updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          PDA.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              //let result = { "message": "Device "+resText+" successfully" }
              let message = resMessage.data( 607, [{key:'{field}',val:"Device Details"},{key:'{status}',val: resText}] )
              let result = { "message": message }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "Device Details "+resText, message, folderName, subFolderName )
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let result = { "message": "No record found." }
          res.send(resFormat.rError(result));
        }
      }
    })
  } else { 
            let { proquery } = req.body;
            var insert = new PDA();
            insert.customerId = proquery.customerId;
            insert.customerLegacyId = proquery.customerLegacyId;
            insert.customerLegacyType = proquery.customerLegacyType;
            insert.deviceName = proquery.deviceName;
            insert.pin = proquery.pin;
            insert.deviceList = proquery.deviceList;            
            insert.username = proquery.username;
            insert.passwordType = proquery.passwordType;
            if(proquery.passwordPattern){
              insert.passwordPattern = proquery.passwordPattern;
            }                        
            insert.password = proquery.password;        
            insert.status = 'Active';
            insert.createdOn = new Date();
            insert.modifiedOn = new Date();
            insert.save({$set:proquery}, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "Passwords Digital & Assests";  
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = proquery.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        //let result = { "message": "Device added successfully!" }
        let message = resMessage.data( 607, [{key:'{field}',val:"Device Details"},{key:'{status}',val: 'added'}] )
        let result = { "message": message }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "Device Details Added", message, folderName, subFolderName )
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function viewDevice(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  PDA.findOne(query, fields, function (err, deviceList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(deviceList))
    }
  })
}

function deletedevice(req, res) {
  let { query } = req.body;
  let fields = { }
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  PDA.findOne(query, fields, function (err, deviceInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      PDA.update({ _id: deviceInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(deviceInfo._id);
          //let result = { "message": "Record deleted successfully!" }
          let message = resMessage.data( 607, [{key:'{field}',val:"Device Details"},{key:'{status}',val: 'deleted'}] )
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Device Details", message, folderName, subFolderName )
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function electronicMediaFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  var logData = {}
  logData.fileName = constants.ElectronicMediaLists[proquery.mediaType];
  logData.folderName = 'password-assets';
  logData.subFolderName = 'elecronic-media';

  if(query._id){
    EMedia.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details  added';
          if (custData.mediaType){
            resText = 'details updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          EMedia.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);
              //let result = { "message": "Electronic media "+resText+" successfully" }
              let message = resMessage.data( 607, [{key:'{field}',val:"Electronic Media Details"},{key:'{status}',val: resText}] )
              let result = { "message": message }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "Electronic Media Details "+resText, message, folderName, subFolderName )

              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let result = { "message": "No record found." }
          res.send(resFormat.rError(result));
        }
      }
    })
  } else { 
            let { proquery } = req.body;
            var insert = new EMedia();
            insert.customerId = proquery.customerId;
            insert.customerLegacyId = proquery.customerLegacyId;
            insert.customerLegacyType = proquery.customerLegacyType;
            insert.mediaType = proquery.mediaType;
            insert.username = proquery.username;
            insert.password = proquery.password;        
            insert.comments = proquery.comments;    
            insert.status = 'Active';
            insert.createdOn = new Date();
            insert.modifiedOn = new Date();
            insert.save({$set:proquery}, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "Passwords Digital & Assests";  
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }
        
        logData.customerId = proquery.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);
        //let result = { "message": "Electronic media added successfully!" }
        let message = resMessage.data( 607, [{key:'{field}',val:"Electronic Media Details"},{key:'{status}',val: 'added'}] )
        let result = { "message": message }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "Electronic Media Details Added", message, folderName, subFolderName )

        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function electronicMediaList(req, res) {
  let { fields, offset, query,trusteeQuery, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  EMedia.countDocuments(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    EMedia.find(query, fields, async function (err, electronicMediaList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        let totalTrusteeRecords = 0;
        if(totalRecords>0){
          totalTrusteeRecords = await commonhelper.customerTrustees(trusteeQuery)
        }
        res.send(resFormat.rSuccess({ electronicMediaList,totalRecords,totalTrusteeRecords}))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function electronicMediaviewDevice(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  EMedia.findOne(query, fields, function (err, EMList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(EMList))
    }
  })
}

function viewElectronicMedia(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  EMedia.findOne(query, fields, function (err, EMList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(EMList))
    }
  })
}

function deleteElectronicMedia(req, res) {
  let { query } = req.body;
  let fields = { }
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  EMedia.findOne(query, fields, function (err, ElectronicMediaInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      EMedia.update({ _id: ElectronicMediaInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(ElectronicMediaInfo._id);
          //let result = { "message": "Record deleted successfully!" }
          let message = resMessage.data( 607, [{key:'{field}',val:"Electronic Media Details"},{key:'{status}',val: 'deleted'}] )
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Electronic Media Details Deleted", message, folderName, subFolderName )
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function digitalPublicationFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  var logData = {}
  logData.fileName = proquery.title;
  logData.folderName = 'password-assets';
  logData.subFolderName = 'digital-publication';

  if(query._id){
    DigitalPublications.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details added';
          if (custData.title){
            resText = 'details updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          DigitalPublications.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);
              //let result = { "message": "Electronic media "+resText+" successfully" }
              let message = resMessage.data( 607, [{key:'{field}',val:"Digital Publication details"},{key:'{status}',val: resText}] )
              let result = { "message": message }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "Digital Publication details "+resText, message, folderName, subFolderName )

              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let result = { "message": "No record found." }
          res.send(resFormat.rError(result));
        }
      }
    })
  } else { 
            let { proquery } = req.body;
            var insert = new DigitalPublications();
            insert.customerId = proquery.customerId;
            insert.customerLegacyId = proquery.customerLegacyId;
            insert.customerLegacyType = proquery.customerLegacyType;
            insert.title = proquery.title;
            insert.username = proquery.username;
            insert.password = proquery.password;        
            insert.comments = proquery.comments;    
            insert.status = 'Active';
            insert.createdOn = new Date();
            insert.modifiedOn = new Date();
            insert.save({$set:proquery}, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "Passwords Digital & Assests";  
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }
        
        logData.customerId = proquery.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);
        //let result = { "message": "Electronic media added successfully!" }
        let message = resMessage.data( 607, [{key:'{field}',val:"Digital Publication Details"},{key:'{status}',val: 'added'}] )
        let result = { "message": message }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "Digital Publication Details Added", message, folderName, subFolderName )

        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function digitalPublicationList(req, res) {
  let { fields, offset, query,trusteeQuery, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  DigitalPublications.countDocuments(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    DigitalPublications.find(query, fields,async function (err, electronicMediaList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        let totalTrusteeRecords = 0;
        if(electronicMediaList.length>0){
          totalTrusteeRecords = await commonhelper.customerTrustees(trusteeQuery)
        }
        res.send(resFormat.rSuccess({ electronicMediaList,totalRecords,totalTrusteeRecords}))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function viewDigitalPublication(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  DigitalPublications.findOne(query, fields, function (err, EMList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(EMList))
    }
  })
}

function deleteDigitalPublication(req, res) {
  let { query } = req.body;
  let fields = { }
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  DigitalPublications.findOne(query, fields, function (err, ElectronicMediaInfo) {
    console.log("asaHDKJhasdkhj >>>>"+ElectronicMediaInfo)
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      DigitalPublications.update({ _id: ElectronicMediaInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(ElectronicMediaInfo._id);
          //let result = { "message": "Record deleted successfully!" }
          let message = resMessage.data( 607, [{key:'{field}',val:"Digital Publication Details"},{key:'{status}',val: 'deleted'}] )
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Digital Publication Details Deleted", message, folderName, subFolderName )
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

router.post("/pattern-submit", patternUpdate)
router.post("/view-device-details", viewDevice)
router.post("/deviceListing", DeviceList)
router.post("/device-form-submit",deviceFormUpdate)
router.post("/delete-device", deletedevice)

router.post("/electronicMediaListing", electronicMediaList)
router.post("/view-electronicMedia-details", viewElectronicMedia)
router.post("/electronic-media-form-submit",electronicMediaFormUpdate)
router.post("/view-electronic-media-details", electronicMediaviewDevice)
router.post("/delete-electronicMedia", deleteElectronicMedia)

router.post("/digital-publication-listing", digitalPublicationList)
router.post("/view-digital-publication-details", viewDigitalPublication)
router.post("/digital-publication-form-submit",digitalPublicationFormUpdate)
router.post("/delete-digital-publication", deleteDigitalPublication)
module.exports = router