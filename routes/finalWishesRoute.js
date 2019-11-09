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
const obituary = require('./../models/Obituary.js')
const celebration = require('./../models/CelebrationOfLife.js')
const s3 = require('./../helpers/s3Upload')
const actitivityLog = require('./../helpers/fileAccessLog')
//const Trustee = require('./../models/Trustee.js')
const commonhelper = require('./../helpers/commonhelper')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')

async function finalList(req, res) {
  let { fields, query } = req.body

    let obituaryData =  await obituary.find(query);
    let celebrationData =  await celebration.find(query);

  res.send(resFormat.rSuccess({ obituaryData, celebrationData }))      
}

/**
 * Add / edit function for obituary form
 */
function obituaryFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId }   = req.body;
  let { toId }     = req.body;

  let { folderName }    = req.body
        folderName      = folderName.replace('/','');
  let subFolderName = '';
  var logData = {}
  logData.fileName = proquery.title;
  logData.folderName = 'finalwishes obituary';
  logData.subFolderName = '';

  if(query._id){
    obituary.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'added';
          if (custData.check){
            resText = 'updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          obituary.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
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
            var insert = new obituary();
            insert.customerId = proquery.customerId;
            insert.customerLegacyId = proquery.customerLegacyId;
            insert.customerLegacyType = proquery.customerLegacyType;
            insert.check = proquery.check;
            insert.prepareTo = proquery.prepareTo;
            insert.photos = proquery.photos;        
            insert.media = proquery.media;          
            insert.sentTo = proquery.sentTo;          
            insert.information = proquery.information;   
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
          sendData.sectionName = "Final Wishes obituary";  
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }
       
        logData.customerId = query.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let rmessage = resMessage.data( 607, [{key:'{field}',val: 'Final Wishes obituary'},{key:'{status}',val: 'added'}] )
        let result = { "message": rmessage }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, 'Final Wish obituary added', rmessage, folderName, subFolderName )

        //let result = { "message": message.messageText+" details added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

/**
 * view details function for obituary form
 */
function viewObituaryWish(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  obituary.findOne(query, fields, function (err, wishList) {
  if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(wishList))
    }
  })
}

/**
 * Add / edit function for celebration of life form form
 */
function celebrationFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId }   = req.body;
  let { toId }     = req.body;

  let { folderName }    = req.body
        folderName      = folderName.replace('/','');
  let subFolderName = '';
  var logData = {}
  logData.fileName = proquery.eventByName;
  logData.folderName = 'finalwishes celebration of life';
  logData.subFolderName = '';

  if(query._id){
    celebration.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'added';
          if (custData.eventByName){
            resText = 'updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          celebration.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
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
            var insert = new celebration();
            insert.customerId = proquery.customerId;
            insert.customerLegacyId = proquery.customerLegacyId;
            insert.customerLegacyType = proquery.customerLegacyType;

            insert.eventByName = proquery.eventByName;
            insert.eventPlace = proquery.eventPlace;
            insert.speakerAvailable = proquery.speakerAvailable;        
            insert.speakerName = proquery.speakerName;          
            insert.foodNMenuItems = proquery.foodNMenuItems;          
            insert.musicNames = proquery.musicNames; 

            insert.groupActivities = proquery.groupActivities;        
            insert.documentLocation = proquery.documentLocation;          
            insert.mementos = proquery.mementos;          
            insert.paymentOptions = proquery.paymentOptions;
            
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
          sendData.sectionName = "Final Wishes celebration of life";  
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }
       
        logData.customerId = query.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let rmessage = resMessage.data( 607, [{key:'{field}',val: 'Final Wishes celebration of life'},{key:'{status}',val: 'added'}] )
        let result = { "message": rmessage }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, 'Final Wish celebration of life added', rmessage, folderName, subFolderName )

        //let result = { "message": message.messageText+" details added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

/**
 * view details function for celebration form
 */
function viewcelebrationOfLife(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  celebration.findOne(query, fields, function (err, wishList) {
  if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(wishList))
    }
  })
}



router.post("/finalListing", finalList)
router.post("/obituary-form-submit", obituaryFormUpdate);
router.post("/view-obituary-details", viewObituaryWish);

router.post("/celebration-form-submit", celebrationFormUpdate);
router.post("/view-celebration-details", viewcelebrationOfLife);

//router.post("/delete-finalWish", deleteFinalWish)
module.exports = router