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
const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const finalWish = require('./../models/FinalWishes.js')
const s3 = require('./../helpers/s3Upload')
const actitivityLog = require('./../helpers/fileAccessLog')
const Trustee = require('./../models/Trustee.js')
const commonhelper = require('./../helpers/commonhelper')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')
function finalList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  finalWish.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    finalWish.find(query, fields, function (err, wishList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        let totalFuneralTrusteeRecords = 0; let totalObituaryTrusteeRecords = 0; let totalCelebrTrusteeRecords = 0;
        if(totalRecords>0){
            Trustee.find(query, function (err, trusteeList) {          
              const FuneralPlansList = trusteeList.filter(dtype => {
                return dtype.userAccess.FuneralPlansManagement == 'now'
              }).map(el => el)
               totalFuneralTrusteeRecords = FuneralPlansList.length;

              const ObituaryList = trusteeList.filter(dtype => {
                return dtype.userAccess.ObituaryManagement == 'now'
              }).map(el => el)
               totalObituaryTrusteeRecords = ObituaryList.length;

              const CelebrationList = trusteeList.filter(dtype => {
                return dtype.userAccess.CelebrationLifeManagement == 'now'
              }).map(el => el)
               totalCelebrTrusteeRecords = CelebrationList.length;
          
              res.send(resFormat.rSuccess({ wishList,totalRecords,totalFuneralTrusteeRecords,totalObituaryTrusteeRecords,totalCelebrTrusteeRecords}))      
          })
        }else{
          res.send(resFormat.rSuccess({ wishList,totalRecords,totalFuneralTrusteeRecords,totalObituaryTrusteeRecords,totalCelebrTrusteeRecords}))
        }
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function wishFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let {message} = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  var logData = {}
  logData.fileName = proquery.title;
  logData.folderName = 'finalwishes';
  logData.subFolderName = proquery.subFolderName;

  if(query._id){
    finalWish.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'added';
          if (custData.title){
            resText = 'updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          finalWish.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let rmessage = resMessage.data( 607, [{key:'{field}',val: 'Final Wish'}, {key:'{status}',val: resText}] )
              let result = { "message": rmessage }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, 'Final Wish'+resText, rmessage, folderName, subFolderName )

              //let result = { "message": message.messageText+" "+resText+" successfully" }
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
            var insert = new finalWish();
            insert.customerId = proquery.customerId;
            insert.customerLegacyId = proquery.customerLegacyId;
            insert.customerLegacyType = proquery.customerLegacyType;
            insert.subFolderName = proquery.subFolderName;
            insert.title = proquery.title;
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
          sendData.sectionName = "Final Wishes";  
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }
        
        logData.customerId = query.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let rmessage = resMessage.data( 607, [{key:'{field}',val: 'Final Wish'},{key:'{status}',val: 'added'}] )
        let result = { "message": rmessage }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, 'Final Wish added', rmessage, folderName, subFolderName )

        //let result = { "message": message.messageText+" details added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function viewFinalWish(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  finalWish.findOne(query, fields, function (err, wishList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(wishList))
    }
  })
}

function deleteFinalWish(req, res) {
  let { query } = req.body;
  let fields    = { }
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  finalWish.findOne(query, fields, function (err, wishInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      finalWish.update({ _id: wishInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(wishInfo._id);
          
          let message = resMessage.data( 607, [{key:'{field}',val:'Final wish'},{key:'{status}',val:'deleted'}] )
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Final Wish Delete", message, folderName, subFolderName )
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

router.post("/view-wish-details", viewFinalWish)
router.post("/finalListing", finalList)
router.post("/wishes-form-submit", wishFormUpdate)
router.post("/delete-finalWish", deleteFinalWish)
module.exports = router