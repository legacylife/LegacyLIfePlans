var express = require('express')
var router = express.Router()
var Cms = require('./../models/Cms.js')
var constants = require('./../config/constants')
var jwt = require('express-jwt')
var Q = require('q')
const resFormat = require('./../helpers/responseFormat')
const { isEmpty } = require('lodash')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

//function to update cms page content
function update(req, res) {
  console.log(req.body)
  Cms.updateOne({ _id: req.body._id },{ $set: req.body} ,(err, updateCms)=>{
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess('Content page has been updated'))
    }
  })
}

//function to get list of cms pages
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
  Cms.count(query, function(err, cmsCount) {
    if(cmsCount) {
      totalRecords = cmsCount
    }
    Cms.find(query, fields, function(err, cmsList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ cmsList, totalRecords}))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

//function get details of page
function view (req, res) {
  console.log(req.body)
  const  query  = req.body
  Cms.findOne(query , function(err, cmsDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(cmsDetails))
    }
  })
}

// Function to get cms page by code
function getCmsByCode (code) {
  var deferred = Q.defer()
  Cms.findOne({code: code}, (err, cms) => {
    if (err) {
      deferred.reject(err);
    }
    if (cms) {
      deferred.resolve(cms);
    } else {
      deferred.resolve();
    }
  })
  return deferred.promise;
}


router.post("/update", update)
router.post("/list", list)
router.post("/view", view)
router.getCmsByCode = getCmsByCode

module.exports = router
