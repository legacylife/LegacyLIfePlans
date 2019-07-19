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
const User = require('../models/Users')
var constants = require('../config/constants')
const resFormat = require('../helpers/responseFormat')
const emailTemplates = require('./emailTemplatesRoute.js')
const lead = require('../models/Leads.js')
const trust = require('./../models/Trustee.js')
ObjectId = require('mongodb').ObjectID;

const actitivityLog = require('../helpers/fileAccessLog')
const sendEmail = require('../helpers/sendEmail')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function leadsList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }

  lead.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    lead.find(query, fields, function (err, leadList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ leadList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit).populate('customerId')
  })
}

function leadUpdate(req, res) {
  let { query } = req.body;
  lead.findOne(query, function (err, leadData) {
    if (err) {
      let result = { "message": "Something Wrong!" }
      res.send(resFormat.rError(result));
    } else {

      if (!leadData) {
        var insert = new lead();
        insert.customerId = query.customerId;
        insert.advisorId = query.advisorId;
        insert.status = 'Active';
        insert.createdOn = new Date();
        insert.modifiedOn = new Date();
        insert.save({ $set: query }, function (err, newEntry) {
          if (err) {
            res.send(resFormat.rError(err))
          } else {
            let result = { "message": "Leads added successfully!" }
            res.status(200).send(resFormat.rSuccess(result))
          }
        })
      }
    }
  })
}

function userDetails(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  User.findOne(query, fields, function (err, userList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {

      if (userList) {

        trust.countDocuments({ trustId: userList._id }, fields, function (err, userCount) {
          if (userCount) {
            // totalUsers = userCount;
          }
        });
      }

      res.send(resFormat.rSuccess(userList))
    }
  })
}


//function get details of user from url param
function userView(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  User.findOne(query, fields, function (err, userDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      //Acting as Trustee


      // trust.countDocuments({trustId:userDetails._id}, function (err, TrusteeCount) {
      //       TrusteeCounts = TrusteeCount;
      //       console.log("CNT",TrusteeCount)
      //       let result = { userDetails: userDetails, TrusteeCount: TrusteeCounts, "message": "Status Updated successfully!" }
      //       res.status(200).send(resFormat.rSuccess(result))
      // });

      trust.aggregate([
        { $match: { "trustId": userDetails._id } },
        { $group: { _id: null, filesCount: { $sum: "$filesCount" }, folderCount: { $sum: "$folderCount" }, recordCount: { $sum: 1 } } }
      ], function (err, statisticsCounts) {
        //console.log("CNT",statisticsCounts);
        filesCount = statisticsCounts[0] ? statisticsCounts[0].filesCount : 0;
        folderCount = statisticsCounts[0] ? statisticsCounts[0].folderCount : 0;
        recordCount = statisticsCounts[0] ? statisticsCounts[0].recordCount : 0;
        let result = { userDetails: userDetails, filesCount: filesCount, folderCount: folderCount, recordCount: recordCount, "message": "Status Updated successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      });
    }
  })
}

async function getLeadsCount(req, res) {
  let paramData = req.body
  let resultCount = 0
  await lead.find(paramData, function (err, data) {
      if (data != null) {
          resultCount = data.length
      }
      result = { "count": resultCount }
      res.status(200).send(resFormat.rSuccess(result))
  })
}

router.post("/listing", leadsList)
router.post("/lead-submit", leadUpdate)
router.post("/view-details", userView)
router.post("/get-leads-count", getLeadsCount)
module.exports = router