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
const lettersMessage = require('./../models/LettersMessages.js')
const s3 = require('./../helpers/s3Upload')
const actitivityLog = require('./../helpers/fileAccessLog')
const Trustee = require('./../models/Trustee.js')
const commonhelper = require('./../helpers/commonhelper')
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})


function LettersMessageList(req, res) {
  let { fields, offset, query, trusteeQuery, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  lettersMessage.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    lettersMessage.find(query, fields, function (err, lettersMessagesList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        let totalTrusteeRecords = 0;
        if(totalRecords){
          Trustee.count(trusteeQuery, function (err, TrusteeCount) {
          if (TrusteeCount) {
            totalTrusteeRecords = TrusteeCount
          }
          res.send(resFormat.rSuccess({lettersMessagesList,totalRecords,totalTrusteeRecords }))
        })
       }else{
        res.send(resFormat.rSuccess({lettersMessagesList,totalRecords,totalTrusteeRecords }))
       }
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function LettersMessageFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  var logData = {}
  logData.fileName = proquery.title;
  logData.folderName = 'letters-messages';
  logData.subFolderName = 'letters-messages';

  if(query._id){
    lettersMessage.findOne(query, function (err, custData) {      
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
          lettersMessage.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);
              //let result = { "message": "Letter and message "+resText+" successfully" }
              let message = resMessage.data( 607, [{key:'{field}',val:"Letter and Message details"},{key:'{status}',val: resText}] )
              let result = { "message": message }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "Letter and Message "+resText, message, folderName, subFolderName )
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let result = { "message": "No record found." }
          res.send(resFormat.rError(result));
        }
      }
    })
  } 
  else { 
    let { proquery } = req.body;
    var insert = new lettersMessage();
    insert.customerId = proquery.customerId;
    insert.customerLegacyId = proquery.customerLegacyId;
    insert.customerLegacyType = proquery.customerLegacyType;
    insert.title = proquery.title;
    insert.subject = proquery.subject;            
    insert.documents = proquery.documents;
    insert.letterBox = proquery.letterBox;
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
          sendData.sectionName = "Legacy Life Letters & Messages";  
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = query.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        //let result = { "message": "Letter and message details added successfully!" }
        let message = resMessage.data( 607, [{key:'{field}',val:"Letter and message details"},{key:'{status}',val: 'added'}] )
        let result = { "message": message }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "Letter and Message added", message, folderName, subFolderName )
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function viewLettersMessages(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  lettersMessage.findOne(query, fields, function (err, lettersMessagesList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(lettersMessagesList))
    }
  })
}

function deleteLettersMessages(req, res) {
  let { query } = req.body;
  let fields = { }
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  lettersMessage.findOne(query, fields, function (err, Info) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      lettersMessage.update({ _id: Info._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(Info._id);
          //let result = { "message": "Record deleted successfully!" }
          let message = resMessage.data( 607, [{key:'{field}',val:"Letter Messages"},{key:'{status}',val: 'deleted'}] )
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Letter Messages deleted ", message, folderName, subFolderName )
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

router.post("/view-lettersMessages-details", viewLettersMessages)
router.post("/letters-message-listing", LettersMessageList)
router.post("/letters-form-submit", LettersMessageFormUpdate)
router.post("/delete-lettersMessages", deleteLettersMessages)
module.exports = router