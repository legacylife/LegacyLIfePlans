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
const myessentials = require('./../models/myessentials.js')
const s3 = require('./../helpers/s3Upload')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function myEssentialsUpdate(req, res) {
  let { query } = req.body;
  if (query.customerId) {
    myessentials.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong! Please signin again." }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData.customerId) {
          let { proquery } = req.body;
          let { from } = req.body;
          myessentials.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "User " + from.fromname + "  have been updated successfully!" }
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let { proquery } = req.body;
          let { from } = req.body;
          var myessential = new myessentials();
          myessential.customerId = query.customerId;
          myessential.ppFirstName = proquery.ppFirstName;
          myessential.ppMiddleName = proquery.ppMiddleName;
          myessential.ppLastName = proquery.ppLastName;
          myessential.ppDateOfBirth = proquery.ppDateOfBirth;
          myessential.ppEmails = proquery.ppEmails;
          myessential.status = 'Active';
          myessential.createdOn = new Date();
          myessential.save({ $set: proquery }, function (err, newEntry) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "User " + from.fromname + "  have been updated successfully!" }
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        }
      }
    })
  } else {
    let result = { "message": "You have logout! Please signin again." }
    res.send(resFormat.rError(result));
  }
}

function myEssentialsDetails(req, res) {
  let { query } = req.body;
  if (query.customerId) {
    myessentials.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong! Please signin again." }
        res.send(resFormat.rError(result));
      } else {


        let result = { "message": "You have logout! Please signin again." }
        res.send(resFormat.rError(result));
      }
    })
  } else {
    let result = { "message": "You have logout! Please signin again." }
    res.send(resFormat.rError(result));
  }
}


function myEssentialsDetails(req, res) {
  let { query } = req.body; console.log("query", query)
  let fields = {}
  myessentials.findOne(query, fields, function (err, custData) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      let result = { custData, "message": "Get MyEssentials details successfully!" }
      res.status(200).send(resFormat.rSuccess(result))
    }
  })
}

//function to get list of essential profile details as per given criteria
function essentialProfileList(req, res) {

  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  myessentials.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    myessentials.find(query, fields, function (err, essentialList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ essentialList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

router.post("/my_essentials_req", myEssentialsUpdate)
router.post("/get_details", myEssentialsDetails)
router.post("/essential-profile-list", essentialProfileList)

module.exports = router
