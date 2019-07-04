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
// const Mailchimp = require('mailchimp-api-v3')

const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const AdvisorActivityLog = require('./../models/AdvisorActivityLog')
const HiredAdvisors = require('./../models/HiredAdvisors')
const s3 = require('./../helpers/s3Upload')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

// Function to activate advisor
function activateAdvisor(req, res) {
  console.log("request body >>>>>>", req.body)
  let { query } = req.body;
  let fields = { id: 1, username: 1, status: 1 }
  User.findOne(query, fields, function (err, userList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Active';
      var tokens = generateToken(85);
      var date = new Date()

      var params = { status: upStatus, token: tokens, signupApprovalDate: date }
      User.update({ _id: userList._id }, { $set: params }, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let clientUrl = constants.clientUrl;
          var link = "";
          var link = clientUrl + '/advisor/set-password/' + tokens;

          // Send reset password link to advisor email
          emailTemplatesRoute.getEmailTemplateByCode("ActivateUser").then((template) => {
            if (template) {
              template = JSON.parse(JSON.stringify(template));
              let body = template.mailBody.replace("{link}", link);
              const mailOptions = {
                to: userList.username,
                subject: template.mailSubject,
                html: body
              }
              sendEmail(mailOptions)
              //res.send(resFormat.rSuccess('We have set your password. Please login & use system.'))
              let result = { userId: updatedUser._id, userType: updatedUser.userType, "message": "We have set your password. Please login & use system." }
              res.status(200).send(resFormat.rSuccess(result))
            } else {
              res.status(401).send(resFormat.rError('Some error Occured'))
            }
          })
        }
      })
    }
  })
}

// Function to update reject reason for advisor
function rejectAdvisor(req, res) {

  let query = { "_id": req.body._id };
  let fields = { id: 1, username: 1, status: 1 }
  User.findOne(query, fields, function (err, userList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var date = new Date()
      upStatus = 'Rejected';
      approveRejectReason = req.body.approveRejectReason;

      var params = { status: upStatus, signupApprovalDate: date, approveRejectReason: approveRejectReason }
      User.update({ _id: userList._id }, { $set: params }, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {

          // Send reset password link to advisor email
          emailTemplatesRoute.getEmailTemplateByCode("RejectAdvisor").then((template) => {
            if (template) {
              console.log(template)
              template = JSON.parse(JSON.stringify(template));
              let body = template.mailBody;
              const mailOptions = {
                to: userList.username,
                subject: template.mailSubject,
                html: body
              }
              sendEmail(mailOptions)
              //res.send(resFormat.rSuccess('We have set your password. Please login & use system.'))
              let result = { userId: updatedUser._id, userType: updatedUser.userType, "message": "We have set your password. Please login & use system." }
              res.status(200).send(resFormat.rSuccess(result))
            } else {
              res.status(401).send(resFormat.rError('Some error Occured'))
            }
          })


        }
      })
    }
  })
}

/**
 * Function to get advisor activity log on advisor dashboard 
 */
function recentUpdateList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function(key, index) {
      if(key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  AdvisorActivityLog.countDocuments(query, function(err, logcount) {
    if(logcount) {
      totalRecords = logcount
    }
    AdvisorActivityLog.find(query, fields, function(err, logList) {	
      console.log(logList)
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ logList, totalRecords}))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

/**
 * Function to hire advisor
 */

function hireAdvisor(req, res) {

  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;

  if (query.customerId && query.advisorId) {
    HiredAdvisors.findOne(query, function (err, hireData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (hireData && hireData._id) {
          proquery.modifiedOn = new Date();
          HiredAdvisors.updateOne({ _id: hireData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              if(from.logId){
                AdvisorActivityLog.updateOne({ _id: from.logId }, { $set: {actionTaken : proquery.status} }, function (err, logDetails) {
                  if (err) {
                    res.send(resFormat.rError(err))
                  } else {
                    let result = { "message": "Request updated successfully!" }
                    res.status(200).send(resFormat.rSuccess(result))
                  }
                })
              }
              else {
                let result = { "message": "Request updated successfully!" }
                res.status(200).send(resFormat.rSuccess(result))
              }
            }
          })
        } else {
          let { proquery } = req.body;
          console.log(proquery)
          var hireadvisor = new HiredAdvisors();
          hireadvisor.status = 'pending';
          hireadvisor.customerId = query.customerId;
          hireadvisor.advisorId = query.advisorId;
          hireadvisor.createdOn = new Date();
          hireadvisor.modifiedOn = new Date();
          hireadvisor.createdby = query.customerId;
          hireadvisor.modifiedby = query.customerId;
          hireadvisor.save({ $set: proquery }, function (err, newEntry) {
            if (err) {
              res.send(resFormat.rError(err))
            } else { 

              User.findOne({_id : query.customerId}, {firstName :1, lastName :1, profilePicture : 1}, function (err, userList) {

                if (err) {
                  let result = { "message": "Something Wrong!" }
                  res.send(resFormat.rError(result));
                } else {
                  var advisorLog = new AdvisorActivityLog();
                  advisorLog.status = 'pending';
                  advisorLog.customerId = query.customerId;
                  advisorLog.advisorId = query.advisorId;
                  advisorLog.createdOn = new Date();
                  advisorLog.modifiedOn = new Date();
                  advisorLog.createdby = query.customerId;
                  advisorLog.modifiedby = query.customerId;

                  advisorLog.sectionName = "hired";
                  advisorLog.actionTaken = "pending";
                  advisorLog.customerProfileImage = userList.profilePicture;
                  advisorLog.customerFirstName = userList.firstName;
                  advisorLog.customerLastName = userList.lastName;
                  advisorLog.activityMessage = " has confirmed to hire you";

                  advisorLog.save({}, function (err, newEntry) {
                    if (err) {
                      res.send(resFormat.rError(err))
                    } else { 
                      let result = { "message": "Request sent successfully!" }
                      res.status(200).send(resFormat.rSuccess(result))
                    }
                  })
                }                
              })
            }
          })
        }
      }
    })
  } else {
    let result = { "message": "No record found." }
    res.send(resFormat.rError(result));    
  }
}

function fileupload(req, res) {
  console.log(req);
}

function generateToken(n) {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var token = '';
  for (var i = 0; i < n; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}


router.post("/activateadvisor", activateAdvisor)
router.post("/rejectadvisor", rejectAdvisor)
router.post("/fileupload", fileupload)
//router.post("/contactadvisor", contactAdvisor)
router.post("/recentupdatelist", recentUpdateList)
router.post("/hireadvisor",hireAdvisor)

module.exports = router
