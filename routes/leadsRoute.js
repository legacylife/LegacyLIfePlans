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


function leadUpdate(req, res) {
  let { query } = req.body;

  console.log("Here ",query)
  lead.findOne(query, function (err, leadData) {      
    if (err) {
      let result = { "message": "Something Wrong!" }
      res.send(resFormat.rError(result));
    } else {

      console.log("Here ",leadData)
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

router.post("/lead-submit", leadUpdate)
module.exports = router