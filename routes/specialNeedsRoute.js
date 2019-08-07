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
const Trustee = require('./../models/Trustee.js')
const commonhelper = require('./../helpers/commonhelper')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function specialNeedsSubmit(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;

  var logData = {}
  logData.fileName = proquery.title;
  logData.folderName = 'specialneeds';
  logData.subFolderName = proquery.folderName;

  if(query._id ){
    SpecialNeeds.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;  
          proquery.modifiedOn = new Date();
          SpecialNeeds.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let result = { "message": "Special Needs details have been updated successfully!" }
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
    var snObj = new SpecialNeeds();
    snObj.customerId = from.customerId;
    snObj.customerLegacyId = proquery.customerLegacyId;
    snObj.customerLegacyType = proquery.customerLegacyType;
    snObj.title = proquery.title;
    snObj.folderName = proquery.folderName;
    snObj.comments = proquery.comments;
    snObj.status = 'Active';
    snObj.createdOn = new Date();
    snObj.modifiedOn = new Date();
    snObj.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        
        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "Special Needs";  
          sendData.customerId = from.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }
        
        logData.customerId = from.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let result = { "message": "Special Needs details have been added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function getSpecialNeedsList(req, res) {
  let { fields, offset, query,trusteeQuery, order, limit, search } = req.body
  SpecialNeeds.find(query, function (err, specialNeedsList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      let totalTrusteeRecords = 0;
      if(specialNeedsList.length>0){
        Trustee.count(trusteeQuery, function (err, TrusteeCount) {
          if (TrusteeCount) {
            totalTrusteeRecords = TrusteeCount
          }
          res.send(resFormat.rSuccess({specialNeedsList,totalTrusteeRecords }))
        })
      }else{
        res.send(resFormat.rSuccess({specialNeedsList,totalTrusteeRecords }))
      } 
    }
  }).sort(order).skip(offset).limit(limit)
}

function viewSpecialNeeds(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  SpecialNeeds.findOne(query, fields, function (err, scData) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(scData))
    }
  })
}

function deleteSpecialNeeds(req, res) {
  let { query } = req.body;
  let fields = { }
  SpecialNeeds.findOne(query, fields, function (err, profileInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      SpecialNeeds.update({ _id: profileInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(profileInfo._id);
          let result = { "message": "Record deleted successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

router.post("/special-needs", specialNeedsSubmit)
router.post("/special-needs-list", getSpecialNeedsList)
router.post("/view-special-needs", viewSpecialNeeds)
router.post("/delete-special-needs", deleteSpecialNeeds)

module.exports = router