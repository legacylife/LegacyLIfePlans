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
const s3 = require('./../helpers/s3Upload')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

// Function to activate advisor
function activateAdvisor (req, res) {
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

      var params = { status: upStatus, token : tokens, signupApprovalDate : date }
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
function rejectAdvisor (req, res) {
  console.log("request body >>>>>>", req.body)
  let  query  = {"_id" : req.body._id};
  let fields = { id: 1, username: 1, status: 1 }
  User.findOne(query, fields, function (err, userList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var date = new Date() 
      upStatus = 'Reject';
      approveRejectReason =  req.body.approveRejectReason;   

      var params = { status: upStatus, signupApprovalDate : date, approveRejectReason : approveRejectReason }
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

module.exports = router
