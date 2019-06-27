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
const pet = require('./../models/Pets.js')
const PDA = require('./../models/PasswordNDigitalAssets.js')
const s3 = require('./../helpers/s3Upload')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function patternUpdate(req, res) {
  console.log("Asdasdasd")
  let { query } = req.body;
  let { proquery } = req.body;
  if(query._id){
    PDA.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details  added';
          if (custData.deviceList){
            resText = 'details updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Pending';   
          if(custData.status!=''){
            proquery.status = custData.status;
          }
          proquery.modifiedOn = new Date();
          PDA.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "Password pattren "+resText+" successfully" }
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
            var insert = new PDA();
            insert.customerId = query.customerId;
            insert.passwordPattern = proquery.passwordPattern;
            insert.status = 'Pending';
            insert.createdOn = new Date();
            insert.modifiedOn = new Date();
            insert.save({$set:proquery}, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        let result = { "message": "Password pattren added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}



function DeviceList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  PDA.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    PDA.find(query, fields, function (err, deviceList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({deviceList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function deviceFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  if(query._id){
    PDA.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details  added';
          if (custData.deviceName){
            resText = 'details updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          PDA.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "Device "+resText+" successfully" }
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
            var insert = new PDA();
            insert.customerId = query.customerId;
            insert.deviceName = proquery.deviceName;
            insert.deviceList = proquery.deviceList;            
            insert.username = proquery.username;
            //insert.passwordPattern = proquery.passwordPattern;
            insert.password = proquery.password;        
            insert.status = 'Active';
            insert.createdOn = new Date();
            insert.modifiedOn = new Date();
            insert.save({$set:proquery}, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        let result = { "message": "Device added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function viewDevice(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  PDA.findOne(query, fields, function (err, deviceList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(deviceList))
    }
  })
}

function deletedevice(req, res) {
  let { query } = req.body;
  let fields = { }
  pet.findOne(query, fields, function (err, petInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      pet.update({ _id: petInfo._id }, { $set: params }, function (err, updatedinfo) {
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

router.post("/pattern-submit", patternUpdate)
router.post("/view-device-details", viewDevice)
router.post("/deviceListing", DeviceList)
router.post("/device-form-submit",deviceFormUpdate)
router.post("/delete-device", deletedevice)
module.exports = router