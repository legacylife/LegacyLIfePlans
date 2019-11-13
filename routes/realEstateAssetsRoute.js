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
const Busboy = require('busboy')
const User = require('../models/Users')
var constants = require('../config/constants')
const resFormat = require('../helpers/responseFormat')
const s3 = require('../helpers/s3Upload')
const actitivityLog = require('./../helpers/fileAccessLog')
const SpecialNeeds = require('./../models/SpecialNeeds.js')
const RealEstate = require('./../models/RealEstate.js')
const Vehicles = require('./../models/Vehicles.js')
const Assets = require('./../models/Assets.js')
const Trustee = require('./../models/Trustee.js')
const commonhelper = require('./../helpers/commonhelper')
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function realEstateSubmit(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;

  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  var logData = {}
  logData.fileName = constants.RealEstateType[proquery.estateType];
  logData.folderName = 'realestateassets';
  logData.subFolderName = 'real-estate';

  if(query._id ){
    RealEstate.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;  
          proquery.modifiedOn = new Date();
          RealEstate.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              //let result = { "message": "Real Estate details have been updated successfully!" }
              let message = resMessage.data( 607, [{key:'{field}',val:"Real Estate Details"},{key:'{status}',val: 'updated'}] )
              let result = { "message": message }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "Real Estate Details Updated", message, folderName, subFolderName )
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
    var realEstate = new RealEstate();
    realEstate.customerId = from.customerId;    
    realEstate.customerLegacyId = proquery.customerLegacyId;
    realEstate.customerLegacyType = proquery.customerLegacyType;
    realEstate.estateType = proquery.estateType;
    realEstate.address = proquery.address;
    realEstate.mortgageHolder = proquery.mortgageHolder;
    realEstate.accountNumber = proquery.accountNumber;
    realEstate.phoneContact = proquery.phoneContact;
    realEstate.deedLocation = proquery.deedLocation;
    realEstate.comments = proquery.comments;
    realEstate.status = 'Active';
    realEstate.createdOn = new Date();
    realEstate.modifiedOn = new Date();
    realEstate.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {

        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "Real Estates & Assets";  
          sendData.customerId = from.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = from.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        //let result = { "message": "Real Estate details have been added successfully!" }
        let message = resMessage.data( 607, [{key:'{field}',val:"Real Estate Details"},{key:'{status}',val: 'added'}] )
        let result = { "message": message }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "Real Estate Details Added", message, folderName, subFolderName )
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function getRealEstateList(req, res) {
  let { fields, offset, query, trusteeQuery, order, limit, search } = req.body
  RealEstate.find(query, async function (err, realEstateList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      let totalTrusteeRecords = 0;
      if(realEstateList.length>0){
        totalTrusteeRecords = await commonhelper.customerTrustees(trusteeQuery)
      }
      res.send(resFormat.rSuccess({realEstateList,totalTrusteeRecords}))
    }
  }).sort(order).skip(offset).limit(limit)
}

function viewRealEstate(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  RealEstate.findOne(query, fields, function (err, realEstateData) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(realEstateData))
    }
  })
}

function deleteRealEstate(req, res) {
  let { query } = req.body;
  let fields = { }
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  RealEstate.findOne(query, fields, function (err, profileInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      RealEstate.update({ _id: profileInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(profileInfo._id);
          //let result = { "message": "Record deleted successfully!" }
          let message = resMessage.data( 607, [{key:'{field}',val:"Real Estate Details"},{key:'{status}',val: 'deleted'}] )
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Real Estate Details Deleted", message, folderName, subFolderName )
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function realEstateVehicleSubmit(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;

  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  var logData = {}
  logData.fileName = proquery.model;
  logData.folderName = 'realestateassets';
  logData.subFolderName = 'real-estate-vehicle';

  if(query._id ){
    Vehicles.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;  
          proquery.modifiedOn = new Date();
          Vehicles.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              //let result = { "message": "Vehicle details have been updated successfully!" }
              let message = resMessage.data( 607, [{key:'{field}',val:"Vehicles Details"},{key:'{status}',val: 'updated'}] )
              let result = { "message": message }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "Vehicles Details Updated", message, folderName, subFolderName )
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
    var vehiclesObj = new Vehicles();
    vehiclesObj.customerId = from.customerId;
    vehiclesObj.customerLegacyId = proquery.customerLegacyId;
    vehiclesObj.customerLegacyType = proquery.customerLegacyType;
    vehiclesObj.model = proquery.model;
    vehiclesObj.year = proquery.year;
    vehiclesObj.make = proquery.make;
    vehiclesObj.titleLocation = proquery.titleLocation;
    vehiclesObj.financeCompanyName = proquery.financeCompanyName;
    vehiclesObj.accountNumber = proquery.accountNumber;
    vehiclesObj.payment = proquery.payment;
    vehiclesObj.comments = proquery.comments;
    vehiclesObj.status = 'Active';
    vehiclesObj.createdOn = new Date();
    vehiclesObj.modifiedOn = new Date();
    vehiclesObj.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {

        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "Real Estates & Assets";  
          sendData.customerId = from.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = from.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        //let result = { "message": "Vehicle details have been added successfully!" }
        let message = resMessage.data( 607, [{key:'{field}',val:"Vehicles Details"},{key:'{status}',val: 'added'}] )
        let result = { "message": message }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "Vehicles Details Added", message, folderName, subFolderName )
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}
 
function viewRealEstateVehicle(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  Vehicles.findOne(query, fields, function (err, vehiclesData) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(vehiclesData))
    }
  })
}

function getRealEstateVehiclesList(req, res) {
  let { fields, offset, query, trusteeQuery, order, limit, search } = req.body
  Vehicles.find(query, async function (err, realEstateVehiclesList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      let totalTrusteeRecords = 0;
      if(realEstateVehiclesList.length>0){
        totalTrusteeRecords = await commonhelper.customerTrustees(trusteeQuery)
      }
      res.send(resFormat.rSuccess({realEstateVehiclesList,totalTrusteeRecords}))
    }
  }).sort(order).skip(offset).limit(limit)
}

function deleteRealEstateVehicle(req, res) {
  let { query } = req.body;
  let fields = { }
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  Vehicles.findOne(query, fields, function (err, profileInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      Vehicles.update({ _id: profileInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(profileInfo._id);
          //let result = { "message": "Record deleted successfully!" }
          let message = resMessage.data( 607, [{key:'{field}',val:"Vehicles Details"},{key:'{status}',val: 'deleted'}] )
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Vehicles Details Deleted", message, folderName, subFolderName )
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function realEstateAssetsSubmit(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  var logData = {}
  logData.fileName = constants.RealEstateAssetsType[proquery.asset];
  logData.folderName = 'realestateassets';
  logData.subFolderName = 'real-estate-assets';

  if(query._id ){
    Assets.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;  
          proquery.modifiedOn = new Date();
          Assets.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              //let result = { "message": "Assets details have been updated successfully!" }
              let message = resMessage.data( 607, [{key:'{field}',val:"Assets Details"},{key:'{status}',val: 'updated'}] )
              let result = { "message": message }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "Assets Details Updated", message, folderName, subFolderName )
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
    var assetsObj = new Assets();
    assetsObj.customerId = from.customerId;
    assetsObj.customerLegacyId = proquery.customerLegacyId;
    assetsObj.customerLegacyType = proquery.customerLegacyType;
    assetsObj.asset = proquery.asset;
    assetsObj.assetNew = proquery.assetNew;
    assetsObj.assetType = proquery.assetType;
    assetsObj.assetValue = proquery.assetValue;
    assetsObj.location = proquery.location;
    assetsObj.comments = proquery.comments;
    assetsObj.status = 'Active';
    assetsObj.createdOn = new Date();
    assetsObj.modifiedOn = new Date();
    assetsObj.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "Real Estates & Assets";  
          sendData.customerId = from.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = from.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        //let result = { "message": "Assets details have been added successfully!" }
        let message = resMessage.data( 607, [{key:'{field}',val:"Assets Details"},{key:'{status}',val: 'added'}] )
        let result = { "message": message }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "Assets Details Added", message, folderName, subFolderName )
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function getRealEstateAssetsList(req, res) {
  let { fields, offset, query, trusteeQuery, order, limit, search } = req.body
  Assets.find(query, async function (err, realEstateAssetsList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      let totalTrusteeRecords = 0;
      if(realEstateAssetsList.length>0){
        totalTrusteeRecords = await commonhelper.customerTrustees(trusteeQuery)
      }
      res.send(resFormat.rSuccess({realEstateAssetsList,totalTrusteeRecords}))
    }
  }).sort(order).skip(offset).limit(limit)
}

function viewRealEstateAsset(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  Assets.findOne(query, fields, function (err, realEstateAssetsData) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(realEstateAssetsData))
    }
  })
}

function deleteRealEstateAsset(req, res) {
  let { query } = req.body;
  let fields = { }
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body
  Assets.findOne(query, fields, function (err, profileInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      Assets.update({ _id: profileInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(profileInfo._id);
          //let result = { "message": "Record deleted successfully!" }
          let message = resMessage.data( 607, [{key:'{field}',val:"Assets Details"},{key:'{status}',val: 'deleted'}] )
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Assets Details Deleted", message, folderName, subFolderName )
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


router.post("/real-estate", realEstateSubmit)
router.post("/real-estate-list", getRealEstateList)
router.post("/view-real-estate", viewRealEstate)
router.post("/delete-real-estate", deleteRealEstate)
router.post("/real-estate-vehicle", realEstateVehicleSubmit)
router.post("/view-real-estate-vehicle", viewRealEstateVehicle)
router.post("/real-estate-vehicles-list", getRealEstateVehiclesList)
router.post("/delete-real-estate-vehicle", deleteRealEstateVehicle)
router.post("/real-estate-assets", realEstateAssetsSubmit)
router.post("/real-estate-assets-list", getRealEstateAssetsList)
router.post("/view-real-estate-asset", viewRealEstateAsset)
router.post("/delete-real-estate-asset", deleteRealEstateAsset)

module.exports = router