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
const timeCapsule = require('./../models/TimeCapsule.js')
const s3 = require('./../helpers/s3Upload')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function timeCapsulesList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  timeCapsule.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    timeCapsule.find(query, fields, function (err, timeCapsuleList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ timeCapsuleList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function timeCapsulesFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  if(query._id){
    timeCapsule.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details  added';
          if (custData.name){
            resText = 'details updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          timeCapsule.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "Time capsules "+resText+" successfully" }
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
            var insert = new timeCapsule();
            insert.customerId = query.customerId;
            insert.name = proquery.name;  
            insert.status = 'Active';
            insert.createdOn = new Date();
            insert.modifiedOn = new Date();
            insert.save({$set:proquery}, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        let result = { "message": "Time capsules added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}
function viewtimeCapsules(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  timeCapsule.findOne(query, fields, function (err, timeCapsuleList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(timeCapsuleList))
    }
  })
}

function deletetimeCapsules(req, res) {
  let { query } = req.body;
  let fields = { }
  timeCapsule.findOne(query, fields, function (err, timeCapsuleInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      timeCapsule.update({ _id: timeCapsuleInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { "message": "Record deleted successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

router.post("/view-timeCapsule-details", viewtimeCapsules)
router.post("/timeCapsuleListing", timeCapsulesList)
router.post("/timeCapsule-form-submit", timeCapsulesFormUpdate)
router.post("/delete-timeCapsule", deletetimeCapsules)
module.exports = router