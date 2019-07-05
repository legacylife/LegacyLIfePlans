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
const emailTemplates = require('./emailTemplatesRoute.js')
const trust = require('./../models/Trustee.js')
ObjectId = require('mongodb').ObjectID;

const actitivityLog = require('./../helpers/fileAccessLog')
const sendEmail = require('./../helpers/sendEmail')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function trustsList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  console.log("query==> ",query)
  trust.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    trust.find(query, fields, function (err, trustList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ trustList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit).populate('trustCustomerId')
  })
}

function getUserDetails(req, res) {
  let { query } = req.body;
  trust.findOne(query, {}, function (err, trustDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      if(trustDetails){
          message = "'"+trustDetails.email+"' has already been invited as a trustee.";
          status = 'Exist';
          let result = { "code": status,"message": message }
          res.status(200).send(resFormat.rSuccess(result));
      }else{      
        let fields = {_id: 1,userType: 1, status: 1}      
        User.findOne({"username":query.email}, fields, function (err, userDetails) {
          if (err) {
            res.status(401).send(resFormat.rError(err))
          } else {
            if(userDetails && userDetails.userType=='advisor'){
              message = "You can't send invitaion '"+query.email+"' this email id is register as advisor.";
              status = 'Exist';
            }else if(userDetails && userDetails.userType=='sysadmin'){
              message = "You can't send invitaion '"+query.email+"' this email id is register as system admin.";
              status = 'Exist';           
            }else{
              message = "";       
              status = 'success';
            }              
          }          
          let result = { "code": status,"message": message,"userDetails":userDetails }
          res.status(200).send(resFormat.rSuccess(result));
        })      
      }     
    }
  }) 
}

function trustFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { extrafields } = req.body;
  clientUrl = constants.serverUrl + "/customer/signup";
  var logData = {}
  logData.fileName = proquery.firstName;
  logData.folderName = 'Trustee';
  logData.subFolderName = 'Add Trustee';

  if(query._id){
    trust.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details  added';
          if (custData.firstName){
            resText = 'details updated';
          }
          let { proquery } = req.body;   
          
          if(proquery.trustCustomerId && proquery.trustCustomerId!='0')
          proquery.status = 'Active'; 
          proquery.trustCustomerId =  ObjectId(proquery.trustCustomerId);
          proquery.modifiedOn = new Date();
          trust.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);
              
              stat = sendTrusteeMail(proquery.email,proquery.messages,proquery.folderCount,extrafields.inviteByName,proquery.firstName,clientUrl,"Reminder: ");
          
              let result = { "message": "Trustee "+resText+" successfully" }
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
            var insert = new trust();
            insert.customerId = query.customerId;
            insert.firstName = proquery.firstName;  
            insert.lastName = proquery.lastName;
            insert.relation = proquery.relation;
            insert.email = proquery.email;
            insert.messages = proquery.messages;
            insert.selectAll = proquery.selectAll;
            insert.userAccess = proquery.userAccess;
            insert.filesCount = proquery.filesCount;
            insert.folderCount = proquery.folderCount;
            insert.trustCustomerId = ObjectId(proquery.trustCustomerId);
            if(proquery.trustCustomerId)
            insert.status = 'Active';
            else
            insert.status = 'Pending';
            insert.createdOn = new Date();
            insert.modifiedOn = new Date();           
            insert.save({$set:proquery}, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {

        logData.customerId = query.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);
        
        stat = sendTrusteeMail(proquery.email,proquery.messages,proquery.folderCount,extrafields.inviteByName,proquery.firstName,clientUrl,""); 
        let result = { "message": "Trustee added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function sendTrusteeMail(emailId,comment,number,inviteByName,inviteToName,clientUrl,Remider) {
   emailTemplates.getEmailTemplateByCode("InviteTrustee").then((template) => {
    if (template) {
      template = JSON.parse(JSON.stringify(template));
      let body = template.mailBody.replace("{inviteToName}", inviteToName);                      
      body = body.replace("{number}", number);
      body = body.replace("{inviteByName}",inviteByName);
      body = body.replace("{inviteByName}",inviteByName);
      body = body.replace("{inviteByName}",inviteByName);
      body = body.replace("{inviteByName}",inviteByName);
      body = body.replace("{comment}", comment);
      body = body.replace("{LINK}", clientUrl);
      body = body.replace("{SERVER_LINK}", clientUrl);      
      const mailOptions = {
        to: 'pankajk@arkenea.com',
        subject: Remider+''+template.mailSubject,
        html: body
      }
      sendEmail(mailOptions);
      return true;
    } else {
      return false;
    }
  })
}

function trustResendInvitation(req, res) {
  let { query } = req.body;
  let { extrafields } = req.body;
  clientUrl = constants.serverUrl + "/customer/signup";
   trust.findOne(query, {}, function (err, trustDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      stat = sendTrusteeMail(trustDetails.email,trustDetails.messages,trustDetails.folderCount,extrafields.inviteByName,trustDetails.firstName,clientUrl,"Reminder: "); 
      let result = { "message": "Trustee invitation send successfully!" }
      res.status(200).send(resFormat.rSuccess(result))
    }
  }) 
}

function getTrusteeDetails(req, res) {
  let { query } = req.body;
   trust.findOne(query, {}, function (err, trustDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.status(200).send(resFormat.rSuccess(trustDetails));
    }
  }) 
}

router.post("/listing", trustsList)
router.post("/get-user", getUserDetails)
router.post("/view-details", getTrusteeDetails)
router.post("/form-submit", trustFormUpdate)
router.post("/resend-invitation", trustResendInvitation)
module.exports = router