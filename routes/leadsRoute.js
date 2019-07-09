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
const User = require('../models/Users')
var constants = require('../config/constants')
const resFormat = require('../helpers/responseFormat')
const emailTemplates = require('./emailTemplatesRoute.js')
const lead = require('../models/Leads.js')
ObjectId = require('mongodb').ObjectID;

const actitivityLog = require('../helpers/fileAccessLog')
const sendEmail = require('../helpers/sendEmail')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function leadsList(req, res) {
  console.log('asdasdasd')
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
  lead.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    lead.find(query, fields, function (err, leadList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ leadList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit).populate('customerId')
  })
}

function leadUpdate(req, res) {
  let { query } = req.body;
   lead.findOne(query, function (err, leadData) {      
    if (err) {
      let result = { "message": "Something Wrong!" }
      res.send(resFormat.rError(result));
    } else {
      if (!leadData) {
        var insert = new lead();
        insert.customerId = query.customerId;
        insert.advisorId = query.advisorId;
        insert.status = 'Active';
        insert.createdOn = new Date();
        insert.modifiedOn = new Date();
        insert.save({$set:query}, function (err, newEntry) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { "message": "Leads added successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
      }
    }
  })
}

function userDetails(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  User.findOne(query, fields, function (err, userList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {

      if(userList){
       
        trust.countDocuments({trustId:userList._id}, fields, function (err, userCount) {
            if (userCount) {
             // totalUsers = userCount;
            }
        });


      }

      res.send(resFormat.rSuccess(userList))
    }
  })
}

router.post("/listing", leadsList)
router.post("/lead-submit", leadUpdate)
router.post("/get-user-details", userDetails)
module.exports = router