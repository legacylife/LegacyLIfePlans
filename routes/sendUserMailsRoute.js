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
const s3 = require('./../helpers/s3Upload')
const actitivityLog = require('./../helpers/fileAccessLog')
const SendUserEmails = require('./../models/SendUserEmails.js')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplates = require('./emailTemplatesRoute.js')
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function FormSubmit(req, res) {
      let { query } = req.body;
      let { proquery } = req.body;
   
      var insert = new SendUserEmails();
      insert.customerId = ObjectId(query.customerId);
      insert.advisorId = ObjectId(query.advisorId);
      insert.name = proquery.name;
      insert.email = proquery.email;  
      insert.message = proquery.message;           
      insert.status = 'Active';
      insert.createdOn = new Date();
      insert.modifiedOn = new Date();   
      insert.save({$set:proquery}, function (err, newEntry) {
    if (err) {
       res.send(resFormat.rError(err))
    } else {


      let fields = { _id: 1, firstName: 1, username: 1}
      User.findOne({ _id: query.advisorId }, fields, function (err, userDetails) {
        if (err) {
          res.status(401).send(resFormat.rError(err))
        } else {
          let inviteByName = proquery.name;
          let emailRef = proquery.email;  
          let comment = proquery.message;  
          let inviteToName = userDetails.firstName;
          let AdvisorEmailId = userDetails.username;

          sendAdvisorMail(AdvisorEmailId,emailRef,inviteToName,inviteByName,comment);   
          let message = resMessage.data( 607, [{key:'{field}',val:"Email"}, {key:'{status}',val:'sent'}] )
          //Update activity logs
          allActivityLog.updateActivityLogs( query.customerId, query.advisorId, "Email To Advisor", message,'Advisor Details') 
          let result = { "message":message }
          res.status(200).send(resFormat.rSuccess(result))
        }       
      })
     }
   })
}

function sendAdvisorMail(emailId,emailRef,inviteToName,inviteByName,comment) {
  let serverUrl = constants.clientUrl + "/customer/signin";
  emailTemplates.getEmailTemplateByCode("SendMailToAdvisor").then((template) => {
    if (template) {
      template = JSON.parse(JSON.stringify(template));
      let body = template.mailBody.replace("{inviteToName}",inviteToName);
      body = body.replace("{emailRef}",emailRef);
      body = body.replace("{inviteByName}",inviteByName);
      body = body.replace("{comment}",comment);
      body = body.replace("{SERVER_LINK}",serverUrl);
      const mailOptions = {
        to: emailId,
        subject: template.mailSubject,
        html: body
      }
      sendEmail(mailOptions);
      return true;
    } else {
      return false;
    }
  })
}

function contactUs(req, res){
  let { query } = req.body;
  let fromEmail = query.email;
  let message = query.message;

  emailTemplates.getEmailTemplateByCode("SendContactQuery").then((template) => {
    if (template) {
      template = JSON.parse(JSON.stringify(template));
      let body = template.mailBody.replace("{email}",fromEmail);
      body = body.replace("{message}",message);
      const mailOptions = {
        to: "subodh@arkenea.com",
        subject: template.mailSubject,
        html: body
      }
      sendEmail(mailOptions);
    } 
  })
  
  let result = { "message":"Your query has been submitted successfully, we will contact you shortly" }
  res.status(200).send(resFormat.rSuccess(result))
}

router.post("/form-submit", FormSubmit)
router.post("/contact-us", contactUs)
module.exports = router