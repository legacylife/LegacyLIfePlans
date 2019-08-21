var express = require('express')
var router = express.Router()
var request = require('request')
const mongoose = require('mongoose')
var async = require('async')
const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const MarkDeceased = require('../models/MarkAsDeceased.js')


function viewDeceased(req, res) {
    let { query } = req.body;
    let fields = {}
    if (req.body.fields) {
      fields = req.body.fields
    }
    MarkDeceased.findOne(query, fields, function (err, deceasedList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess(deceasedList))
      }
    })
  }


function addExecutor(req, res) {
    let paramData = req.body;



}


function removeExecutor(req, res) {
    let paramData = req.body;



}

function sendExecutorMail(emailId,toName,legacyHolderName,template) {
    let serverUrl = constants.clientUrl + "/customer/signin";
  emailTemplatesRoute.getEmailTemplateByCode(template).then((template) => {
    if (template) {
      template = JSON.parse(JSON.stringify(template));
      let body = template.mailBody.replace("{ExecutorName}",toName);
      body = body.replace("{LegacyHolderName}",legacyHolderName);
      body = body.replace("{SERVER_LINK}",serverUrl);
      const mailOptions = {
        to: 'pankajk@arkenea.com',//emailId,
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
router.post("/viewDeceaseDetails", viewDeceased)
router.post("/addAsExecutor", addExecutor)
router.post("/removeAsExecutor", removeExecutor)
module.exports = router