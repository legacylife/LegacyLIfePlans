var express = require('express')
var router = express.Router()
var Cms = require('./../models/Cms.js')
var customerCms = require('./../models/CustomerCms.js')
var advisorCms = require('./../models/AdvisorCms.js')
var constants = require('./../config/constants')
var jwt = require('express-jwt')
var Q = require('q')
const resFormat = require('./../helpers/responseFormat')
const User = require('./../models/Users')
const { isEmpty } = require('lodash')
const resMessage  = require('./../helpers/responseMessages')
var auth = jwt({secret: constants.secret,userProperty: 'payload'})
var async = require('async');

//function to update cms page content
function customerUpdate(req, res) {
  let { query, proquery } = req.body;

  if(req.body._id){
    customerCms.updateOne({ _id: req.body._id },{ $set: query} ,(err, updateCms)=>{
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        updateCms = {_id:req.body._id};
        let result = { "message": 'Content page has been updated',"newrecord": updateCms }
        res.send(resFormat.rSuccess(result))
      }
    })
  }else{    
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
async function list(req, res) {
  let { query } = req.body
  let custCmsList = await customerCms.find(query,{_id:1,pageFor:1,status:1,modifiedOn:1});
  let advCmsList = await advisorCms.find(query,{_id:1,pageFor:1,status:1,modifiedOn:1});
  let customerCmsList = custCmsList.concat(advCmsList);
  res.send(resFormat.rSuccess({ customerCmsList }))
}

//function get details of page
function viewdetails (req, res) {
  const  query  = req.body
  customerCms.findOne(query , function(err, cmsDetails) {
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

//function to update cms page content for advisor landing
function advisorUpdate(req, res) {
  let { query, proquery } = req.body;
  if(req.body._id){
    advisorCms.updateOne(proquery,{ $set:query} ,(err, updateCms)=>{
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        updateCms = {_id:req.body._id};
        let result = { "message": 'Content page has been updated',"newrecord": updateCms }
        res.send(resFormat.rSuccess(result))
      }
    })
  }else{
  let insert_obj = query;
  let advCmsDetails = new advisorCms(insert_obj)
  advCmsDetails.save(function(err, newrecord) {
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

//function get details of page
function viewAdvisordetails (req, res) {
  const  query  = req.body.query;
  const  location  = req.body.location;
  advisorCms.findOne(query ,async function(err, cmsDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
    let usersData = {};
    if(location.longitude && location.latitude){
        await User.aggregate([
          {"$geoNear": { 
            "near" : {
              "type": 'Point',    
              "coordinates": [location.longitude,location.latitude] 
            }, 
            "distanceField": 'distance', 
            //"maxDistance": 2000000, 
            "query":{"userType": "advisor","status":"Active"},
            "includeLocs":'coordinates', 
            "limit": 20, 
            "spherical" :true
          }},
          {"$sort":{"distance":-1}}      
        ], async function (err, usersData) {
          if(err) {
            console.log(err);console.log(JSON.stringify(res));
          }else{
            if(usersData.length>0){
            }else{
              usersData = await User.find({"userType": "advisor","status":"Active"},{});
            }
            let result = {cmsDetails:cmsDetails,usersData:usersData,"message":"data fetch successfully!"}
            res.send(resFormat.rSuccess(result))
          }
         });
      }else{
        let result = {cmsDetails:cmsDetails,usersData:usersData,"message":"data fetch successfully!"}
        res.send(resFormat.rSuccess(result))
      }    
    }
  })
}

router.post("/update", customerUpdate)
router.post("/advisorUpdate", advisorUpdate)
router.post("/list", list)
router.post("/view", viewdetails)
router.post("/advisorView", viewAdvisordetails)
router.getCmsByCode = getCmsByCode

module.exports = router
