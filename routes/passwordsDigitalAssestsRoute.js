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
const actitivityLog = require('./../helpers/fileAccessLog')
const Trustee = require('./../models/Trustee.js')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})
function patternUpdate(req, res) {
  
  let { query } = req.body;
  let { proquery } = req.body;

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
              let result = { "message": "Password pattren "+resText+" successfully","newEntry":updatedDetails }
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
        let result = { "message": "Password pattren added successfully!","newEntry":newEntry }
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
  PDA.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    PDA.find(query, fields, function (err, deviceList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        let totalTrusteeRecords = 0;
        if(totalRecords>0){
          Trustee.count(trusteeQuery, function (err, TrusteeCount) {
            if (TrusteeCount) {
              totalTrusteeRecords = TrusteeCount
            }
            res.send(resFormat.rSuccess({ deviceList,totalRecords,totalTrusteeRecords}))
          })
        }else{
          res.send(resFormat.rSuccess({ deviceList,totalRecords,totalTrusteeRecords}))
        }
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function deviceFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;

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

              let result = { "message": "Device "+resText+" successfully" }
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
            insert.deviceList = proquery.deviceList;            
            insert.username = proquery.username;
            //insert.passwordPattern = proquery.passwordPattern;
            insert.password = proquery.password;        
            insert.status = 'Active';
            insert.createdOn = new Date();
            insert.modifiedOn = new Date();
            insert.save({$set:proquery}, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {

        logData.customerId = query.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let result = { "message": "Device added successfully!" }
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
          let result = { "message": "Record deleted successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


function electronicMediaFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;

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
              let result = { "message": "Electronic media "+resText+" successfully" }
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
        logData.customerId = query.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);
        let result = { "message": "Electronic media added successfully!" }
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
  EMedia.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    EMedia.find(query, fields, function (err, electronicMediaList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        let totalTrusteeRecords = 0;
        if(totalRecords>0){
          Trustee.count(trusteeQuery, function (err, TrusteeCount) {
            if (TrusteeCount) {
              totalTrusteeRecords = TrusteeCount
            }
            res.send(resFormat.rSuccess({ electronicMediaList,totalRecords,totalTrusteeRecords}))
          })
        }else{
          res.send(resFormat.rSuccess({ electronicMediaList,totalRecords,totalTrusteeRecords}))
        }
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
          let result = { "message": "Record deleted successfully!" }
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
module.exports = router