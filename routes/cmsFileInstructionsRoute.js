var express = require('express')
var router = express.Router()
var CmsFileInst = require('./../models/CmsFileInstructions.js')
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
  CmsFileInst.updateOne({ _id: req.body._id },{ $set: req.body} ,(err, updateCms)=>{
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess('File/Folder instructions content has been updated'))
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
  CmsFileInst.countDocuments(query, function(err, cmsCount) {
    if(cmsCount) {
      totalRecords = cmsCount
    }
    CmsFileInst.find(query, fields, function(err, cmsList) {
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
  const  {query}  = req.body;
  CmsFileInst.findOne(query , function(err, cmsDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {     
      let result = { "message": "Records found","cmsDetails":cmsDetails }
      res.send(resFormat.rSuccess(result))
    }
  })
}

router.post("/update", update)
router.post("/list", list)
router.post("/view", view)

module.exports = router
