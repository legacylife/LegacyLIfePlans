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
const pet = require('./../models/Pets.js')
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


function PetsList(req, res) {
  let { fields, offset, query, trusteeQuery, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  pet.countDocuments(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    pet.find(query, fields, function (err, petList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        let totalTrusteeRecords = 0;
        if(totalRecords){
          Trustee.countDocuments(trusteeQuery, function (err, TrusteeCount) {
          if (TrusteeCount) {
            totalTrusteeRecords = TrusteeCount
          }
          res.send(resFormat.rSuccess({petList,totalRecords,totalTrusteeRecords }))
        })
       }else{
        res.send(resFormat.rSuccess({petList,totalRecords,totalTrusteeRecords }))
       }
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function petsFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body

  var logData = {}
  logData.fileName = proquery.name;
  logData.folderName = 'pets';
  logData.subFolderName = 'pets';

  if(query._id){
    pet.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'added';
          if (custData.name){
            resText = 'updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          pet.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              //let result = { "message": "Pets "+resText+" successfully" }
              let message = resMessage.data( 607, [{key:'{field}',val:'Pets details'},{key:'{status}',val:resText}] )
              let result = { "message": message }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "Pets details"+resText, message, folderName, subFolderName )

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
            var insert = new pet();
            insert.customerId = proquery.customerId;
            insert.customerLegacyId = proquery.customerLegacyId;
            insert.customerLegacyType = proquery.customerLegacyType;
            insert.name = proquery.name;
            insert.petType = proquery.petType;            
            insert.veterinarian = proquery.veterinarian;
            insert.dietaryConcerns = proquery.dietaryConcerns;        
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
          sendData.sectionName = "Pets";  
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = proquery.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let message = resMessage.data( 607, [{key:'{field}',val:'Pets details'},{key:'{status}',val:'added'}] )
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "Pets details added", message, folderName, subFolderName )

        let result = { "message": message }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}
function viewPets(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  pet.findOne(query, fields, function (err, petList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(petList))
    }
  })
}

function deletePets(req, res) {
  let { query } = req.body;
  let fields = { }
  let { fileName } = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body

  pet.findOne(query, fields, function (err, petInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status:upStatus,documents:[]}
      pet.update({ _id: petInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          if(petInfo.documents.length>0){
            var fileArray = []; 
            let petsFilePath = petInfo.customerId+'/'+constants.s3Details.petsFilePath;
              async.each(petInfo.documents, async (val) => {
              await fileArray.push({"Key":petsFilePath+val.tmpName});
            })
            s3.deleteFiles(fileArray,petsFilePath);   
          }
          actitivityLog.removeActivityLog(petInfo._id);
          let message = resMessage.data( 607, [{key:'{field}',val:'Pets'},{key:'{status}',val:'deleted'}] )
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Pets deleted", message, folderName, subFolderName )
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

router.post("/view-pets-details", viewPets)
router.post("/petsListing", PetsList)
router.post("/pets-form-submit", petsFormUpdate)
router.post("/delete-pets", deletePets)
module.exports = router