var express = require('express')
var router = express.Router()
var passport = require('passport')
var EmailTemplate = require('./../models/EmailTemplates.js')
var constants = require('./../config/constants')
var jwt = require('express-jwt')
var Q = require('q')
const resFormat = require('./../helpers/responseFormat')
const { isEmpty } = require('lodash')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

//function to update email template
function update(req, res) {

    EmailTemplate.update({ _id: req.body._id },{ $set: req.body} ,(err, updateEmailTemplate)=>{
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess('Email Template has been updated'))
    }
  })
}

//function to get list of email templates as per given criteria
function list(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function(key, index) {
      if(key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  EmailTemplate.count(query, function(err, templateCount) {
    if(templateCount) {
      totalRecords = templateCount
    }
    EmailTemplate.find(query, fields, function(err, templateList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ templateList, totalRecords}))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

//function get details of global settings
function view (req, res) {
  const { query, fields } = req.body
  EmailTemplate.findOne(query, fields , function(err, templateDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(templateDetails))
    }
  })
}

// Function to get emailTemplate by code
function getEmailTemplateByCode (code) {
  var deferred = Q.defer()
  EmailTemplate.findOne({code: code}, (err, emailTemplate) => {
    if (err) {
      deferred.reject(err);
    }
    if (emailTemplate) {
      deferred.resolve(emailTemplate);
    } else {
      deferred.resolve();
    }
  })
  return deferred.promise;
}


router.post("/update", update)
router.post("/list", list)
router.post("/view", view)
router.getEmailTemplateByCode = getEmailTemplateByCode

module.exports = router
