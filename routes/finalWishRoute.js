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
const finalWish = require('./../models/FinalWishes.js')
const s3 = require('./../helpers/s3Upload')
const actitivityLog = require('./../helpers/fileAccessLog')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})


function finalList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  finalWish.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    finalWish.find(query, fields, function (err, wishList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ wishList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}


function wishFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let {message} = req.body;

  var logData = {}
  logData.fileName = proquery.title;
  logData.folderName = 'finalwishes';
  logData.subFolderName = proquery.subFolderName;

  if(query._id){
    finalWish.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details  added';
          if (custData.title){
            resText = 'details updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          finalWish.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let result = { "message": message.messageText+" "+resText+" successfully" }
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
            var insert = new finalWish();
            insert.customerId = query.customerId;
            insert.subFolderName = proquery.subFolderName;
            insert.title = proquery.title;
            insert.comments = proquery.comments;            
            insert.status = 'Active';
            insert.createdOn = new Date();
            insert.modifiedOn = new Date();
            insert.save({$set:proquery}, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {

        logData.customerId = query.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let result = { "message": message.messageText+" added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function viewFinalWish(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  finalWish.findOne(query, fields, function (err, wishList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(wishList))
    }
  })
}

function deleteFinalWish(req, res) {
  let { query } = req.body;
  let fields = { }
  finalWish.findOne(query, fields, function (err, wishInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      finalWish.update({ _id: wishInfo._id }, { $set: params }, function (err, updatedinfo) {
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

router.post("/view-wish-details", viewFinalWish)
router.post("/finalListing", finalList)
router.post("/wishes-form-submit", wishFormUpdate)
router.post("/delete-finalWish", deleteFinalWish)
module.exports = router