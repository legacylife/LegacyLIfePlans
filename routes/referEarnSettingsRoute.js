var express = require('express')
var router = express.Router()
var ReferEarnSetting = require('./../models/ReferEarnSettings')
var constants = require('./../config/constants')
const { isEmpty } = require('lodash')
const resFormat = require('./../helpers/responseFormat')
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')
//function to create new record for global settings
/* function create (req, res) {
  var referEarnSetting = new ReferEarnSetting()
      referEarnSetting.key        = req.body.key
      referEarnSetting.value      = req.body.value
      referEarnSetting.name       = req.body.name
      referEarnSetting.description= req.body.description
      referEarnSetting.status     = req.body.status
      referEarnSetting.createdOn  = new Date()
      referEarnSetting.save(function(err, newrecord) {
    if (err) {
      res.status(500).send(resFormat.rError(err))
    }
    res.send(resFormat.rSuccess('Global settings have been created'))
  })
} */

//function to get list of global settings as per given criteria
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
  ReferEarnSetting.countDocuments(query, function(err, referEarnCount) {
    if(referEarnCount) {
      totalRecords = referEarnCount
    }
    ReferEarnSetting.find(query, fields, function(err, referEarnList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ referEarnList, totalRecords}))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

//function to update global settings
function update(req, res) {
  let {fromId} = req.body
  ReferEarnSetting.updateOne({ _id: req.body._id },{ $set: req.body} ,(err, updateReferEarnSetting)=>{
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      let message = resMessage.data( 607, [{key: '{field}',val: 'Refer and Earn settings'}, {key: '{status}',val: 'updated'}] )
      //Update activity logs
      let {oldstatus} = req.body
      let activity = oldstatus != req.body.status ? 'Update Referral Status' : 'Update Referral Count'
      allActivityLog.updateActivityLogs(fromId, fromId, activity, message, 'Admin Panel', 'Referral Program')
      res.send(resFormat.rSuccess(message))
    }
  })
}

//function get details of global settings
function view(req, res) {
  const { query, fields } = req.body
  ReferEarnSetting.findOne(query, fields , function(err, referEarnDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(referEarnDetails))
    }
  })
}

//function get details of global settings
function getDetails(req, res) {
  
  ReferEarnSetting.findOne( {}, {} , function(err, referEarnDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(referEarnDetails))
    }
  })
}

//router.post("/create", create)
router.post("/list", list)
router.post("/update", update)
router.post("/view", view)
router.get("/getdetails", getDetails)

module.exports = router