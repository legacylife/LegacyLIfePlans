var express = require('express')
var router = express.Router()
var FreeTrailPeriodSetting = require('./../models/FreeTrialPeriodSettings')
const { isEmpty } = require('lodash')
const resFormat = require('./../helpers/responseFormat')
const resMessage = require('./../helpers/responseMessages')

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
  FreeTrailPeriodSetting.count(query, function(err, freeTrialCount) {
    if(freeTrialCount) {
      totalRecords = freeTrialCount
    }
    FreeTrailPeriodSetting.find(query, fields, function(err, freeTrialPeriodList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ freeTrialPeriodList, totalRecords}))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

//function to update global settings
function update(req, res) {
  FreeTrailPeriodSetting.updateOne({ _id: req.body._id },{ $set: req.body} ,(err, updateFreeTrailPeriodSetting)=>{
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      let message = resMessage.data( 607, [{key: '{field}',val: 'Free trial period settings'}, {key: '{status}',val: 'updated'}] )
      res.send(resFormat.rSuccess(message))
    }
  })
}

//function get details of global settings
function view(req, res) {
  const { query, fields } = req.body
  FreeTrailPeriodSetting.findOne(query, fields , function(err, freeTrialPeriodDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(freeTrialPeriodDetails))
    }
  })
}

//function get details of global settings
function getDetails(req, res) {
  FreeTrailPeriodSetting.findOne( {}, {} , function(err, freeTrialPeriodDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(freeTrialPeriodDetails))
    }
  })
}

//router.post("/create", create)
router.post("/list", list)
router.post("/update", update)
router.post("/view", view)
router.get("/getdetails", getDetails)

module.exports = router