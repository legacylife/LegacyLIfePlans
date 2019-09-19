var express = require('express')
var router = express.Router()
var Cms = require('./../models/Cms.js')
var customerCms = require('./../models/CustomerCms.js')
var constants = require('./../config/constants')
var jwt = require('express-jwt')
var Q = require('q')
const resFormat = require('./../helpers/responseFormat')
const { isEmpty } = require('lodash')
const resMessage  = require('./../helpers/responseMessages')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

//function to update cms page content
function addUpdate(req, res) {

  let { query, proquery } = req.body;console.log('proquery',proquery)
  if(req.body._id){
    customerCms.updateOne({ _id: req.body._id },{ $set: req.body} ,(err, updateCms)=>{
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        updateCms = {_id:req.body._id};
        let result = { "message": 'Content page has been updated',"newrecord": updateCms }
        res.send(resFormat.rSuccess(result))
      }
    })
  }else{
    console.log("testimonials",query.testimonials);
    let insert_obj = {
      pageFor       : query.pageFor,
      pageTitle     : query.pageTitle,
      pagesubTitle  : query.pagesubTitle,
      middleText    : query.middleText,
      lowerText     : query.lowerText,
      bulletPoints  : query.bulletPoints,
      topBanner     : '',
      middleBanner  : '',
      lowerBanner   : '',
      quickOverview1 : {
        title : query.quickOverview1.title, 
        subTitle : query.quickOverview1.subTitle,
        videoLink : ''
      }, 
      quickOverview2 : {
        title : query.quickOverview2.title, 
        subTitle : query.quickOverview2.subTitle,
        videoLink : ''
      },  
      facts         : query.facts,
      testimonials  : query.testimonials,
      status        : 'Active',
      createdBy     : proquery.userId,
      createdOn     : new Date(),
      modifiedBy    : proquery.userId,
      modifiedOn    : new Date()
  }
  console.log("insert_obj",insert_obj);
  let customerCmsDetails = new customerCms(insert_obj)
  customerCmsDetails.save(function(err, newrecord) {
        if (err) {
          res.status(500).send(resFormat.rError(err))
        }else{
          message  = resMessage.data( 607, [{key: '{field}',val: 'Post Details'}, {key: '{status}',val: 'created'}] )
          let result = { "message": message,"newrecord": newrecord }
          res.send(resFormat.rSuccess(result))
        }
      })
  }
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
  customerCms.countDocuments(query, function(err, customerCmsCount) {
    if(customerCmsCount) {
      totalRecords = customerCmsCount
    }
    customerCms.find(query, fields, function(err, customerCmsList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ customerCmsList, totalRecords}))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

//function get details of page
function viewdetails (req, res) {
  console.log("><><>>>>>>>>",req.body)
  const  query  = req.body
  customerCms.findOne(query , function(err, cmsDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      console.log('cmsDetails>>>>>>',cmsDetails)
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


router.post("/update", addUpdate)
router.post("/list", list)
router.post("/view", viewdetails)
router.getCmsByCode = getCmsByCode

module.exports = router
