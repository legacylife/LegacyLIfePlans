var express = require('express')
var router = express.Router()
var passport = require('passport')
var GlobalSetting = require('./../models/GlobalSettings')
var States = require('./../models/States')
var constants = require('./../config/constants')
var jwt = require('express-jwt')
var States =  require('./../models/States')
const { isEmpty } = require('lodash')
const resFormat = require('./../helpers/responseFormat')

//function to create new record for global settings
function create (req, res) {

  var globalSetting = new GlobalSetting()
  globalSetting.key = req.body.key
  globalSetting.value = req.body.value
  globalSetting.name = req.body.name
  globalSetting.description = req.body.description
  globalSetting.status = req.body.status
  globalSetting.createdOn = new Date()
  globalSetting.save(function(err, newrecord) {
    if (err) {
      res.status(500).send(resFormat.rError(err))
    }
    res.send(resFormat.rSuccess('Global settings have been created'))
  })
}


//function to update global settings
function update(req, res) {

    GlobalSetting.update({ _id: req.body._id },{ $set: req.body} ,(err, updateGlobalSetting)=>{
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess('Global settings have been updated'))
    }
  })
}

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
  GlobalSetting.count(query, function(err, globalCount) {
    if(globalCount) {
      totalRecords = globalCount
    }
    GlobalSetting.find(query, fields, function(err, globalList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ globalList, totalRecords}))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

//function get details of global settings
function view(req, res) {
  const { query, fields } = req.body
  GlobalSetting.findOne(query, fields , function(err, globalDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(globalDetails))
    }
  })
}

//function get details of global settings from url param
function details(req, res) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(user))
    }
  })
}

//function to return list of cities and states
function cityStateList(req, res) {
  States.find({ status: "Active"}, function(err, states){
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(states))
    }
  })
}


router.post("/create", create)
router.post("/update", update)
router.post("/list", list)
router.post("/view", view)
router.get("/cityStateList", cityStateList)

module.exports = router
