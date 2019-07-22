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
const sendEmail = require('../helpers/sendEmail')

const User = require('../models/Users')
var constants = require('../config/constants')
const resFormat = require('../helpers/responseFormat')
const emailTemplates = require('./emailTemplatesRoute.js')
const lead = require('../models/Leads.js')
const trust = require('./../models/Trustee.js')
const HiredAdvisors = require('./../models/HiredAdvisors.js')
const actitivityLog = require('../helpers/fileAccessLog')

const Assets= require('./../models/Assets.js')
const Debts= require('./../models/Debts.js')
const PasswordNDigitalAssets = require('./../models/PasswordNDigitalAssets.js')
const ElectronicMedia = require('./../models/ElectronicMedia.js')
const EmergencyContacts= require('./../models/EmergencyContacts.js')
const FinalWishes= require('./../models/FinalWishes.js')
const Finances= require('./../models/Finances.js')
const Insurances= require('./../models/Insurance.js')
const LegalStuffs= require('./../models/LegalStuff.js')
const LettersMessages= require('./../models/LettersMessages.js')
const MyEssentials  = require('./../models/myessentials.js')
const MyProfessionals= require('./../models/MyProfessionals.js')
const personalIdProof= require('./../models/personalIdProof.js')
const Pets = require('./../models/Pets.js')
const RealEstate = require('./../models/RealEstate.js')
const SpecialNeeds = require('./../models/SpecialNeeds.js')
const TimeCapsule = require('./../models/TimeCapsule.js')
const Vehicles = require('./../models/Vehicles.js')

ObjectId = require('mongodb').ObjectID;
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

//get OwnLegacyFiles Count of customer
async function getOwnLegacyFilesCount(req, res){
  let groupObj = { _id : 1 , count : { $sum: 1 }} 
  let { query } = req.body
  let ownLegacyFilesCount = 0
  
  let AssetsLength = 0
  let DebtsLength = 0
  let PasswordNDigitalAssetsLength = 0
  let ElectronicMediaLength = 0
  let EmergencyContactsLength = 0
  let FinalWishesLength = 0
  let FinancesLength = 0
  let InsurancesLength = 0
  let LegalStuffsLength = 0
  let LettersMessagesLength = 0
  let MyEssentialsLength = 0
  let MyProfessionalsLength = 0
  let personalIdProofLength = 0
  let PetsLength = 0
  let RealEstateLength = 0
  let SpecialNeedsLength = 0
  let TimeCapsuleLength = 0
  let VehiclesLength = 0
  
  let AssetsData  = await Assets.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  AssetsLength = (AssetsData.length > 0 ? AssetsData[0].count : 0)
  
  let DebtsData  = await Debts.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  DebtsLength = (DebtsData.length > 0 ? DebtsData[0].count : 0)

  let PasswordNDigitalAssetsData  = await PasswordNDigitalAssets.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  PasswordNDigitalAssetsLength = (PasswordNDigitalAssetsData.length > 0 ? PasswordNDigitalAssetsData[0].count : 0)

  let ElectronicMediaData  = await ElectronicMedia.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  ElectronicMediaLength = (ElectronicMediaData.length > 0 ? ElectronicMediaData[0].count : 0)

  let EmergencyContactsData  = await EmergencyContacts.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  EmergencyContactsLength = (EmergencyContactsData.length > 0 ? EmergencyContactsData[0].count : 0)

  let FinalWishesData  = await FinalWishes.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  FinalWishesLength = (FinalWishesData.length > 0 ? FinalWishesData[0].count : 0)

  let FinancesData  = await Finances.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  FinancesLength = (FinancesData.length > 0 ? FinancesData[0].count : 0)

  let InsurancesData  = await Insurances.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  InsurancesLength = (InsurancesData.length > 0 ? InsurancesData[0].count : 0)

  let LegalStuffsData  = await LegalStuffs.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  LegalStuffsLength = (LegalStuffsData.length > 0 ? LegalStuffsData[0].count : 0)

  let LettersMessagesData  = await LettersMessages.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  LettersMessagesLength = (LettersMessagesData.length > 0 ? LettersMessagesData[0].count : 0)

  let MyEssentialsData  = await MyEssentials.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  MyEssentialsLength = (MyEssentialsData.length > 0 ? MyEssentialsData[0].count : 0)

  let MyProfessionalsData  = await MyProfessionals.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  MyProfessionalsLength = (MyProfessionalsData.length > 0 ? MyProfessionalsData[0].count : 0)

  let personalIdProofData  = await personalIdProof.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  personalIdProofLength = (personalIdProofData.length > 0 ? personalIdProofData[0].count : 0)

  let PetsData  = await Pets.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  PetsLength = (PetsData.length > 0 ? PetsData[0].count : 0)

  let RealEstateData  = await RealEstate.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  RealEstateLength = (RealEstateData.length > 0 ? RealEstateData[0].count : 0)

  let SpecialNeedsData  = await SpecialNeeds.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  SpecialNeedsLength = (SpecialNeedsData.length > 0 ? SpecialNeedsData[0].count : 0)

  let TimeCapsuleData  = await TimeCapsule.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  TimeCapsuleLength = (TimeCapsuleData.length > 0 ? TimeCapsuleData[0].count : 0)

  let VehiclesData  = await Vehicles.aggregate([ 
    { $match: query },
    { $group:  groupObj }
  ]) 
  VehiclesLength = (VehiclesData.length > 0 ? VehiclesData[0].count : 0)

  ownLegacyFilesCount = (AssetsLength+DebtsLength+PasswordNDigitalAssetsLength+ElectronicMediaLength+EmergencyContactsLength+FinalWishesLength+
    FinancesLength+InsurancesLength+LegalStuffsLength+LettersMessagesLength+MyEssentialsLength+MyProfessionalsLength+personalIdProofLength+
    PetsLength+RealEstateLength+SpecialNeedsLength+TimeCapsuleLength+VehiclesLength)

  let result = { ownLegacyFilesCount: ownLegacyFilesCount }
  res.status(200).send(resFormat.rSuccess(result))
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

async function getMutualFriend(req, res){
  let {query} = req.body
  let mutualFrnds = []
  await trust.find({"customerId" : query.customerId, "status": "Active"},'trustId', function (err, details) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {      
      if(details.length > 0){
          let detailsLength =  details.length   
            for(let index=0; index<detailsLength; index++){
              mutualFrnds.push(details[index].trustId)
            }
            HiredAdvisors.aggregate([
              { 
                $match: {
                "customerId": { $in: mutualFrnds } , advisorId : query.advisorId , "status": "Active"
                } 
              },
              { 
                "$project": {
                  "_id": 1,
                  "customerId": 1
                }
              },
            ], function (err, results) {
              let mutualFrndsIds = [];
              for(let index=0; index<results.length; index++){
                mutualFrndsIds.push(details[index].trustId)
              }
              User.find({"_id" : { $in: mutualFrndsIds } },{'firstName': 1, 'lastName': 1}, function (err, names) {
                res.status(200).send(resFormat.rSuccess(names))
              })
          });
      }
    }    
  })
}

router.post("/listing", leadsList)
router.post("/lead-submit", leadUpdate)
router.post("/view-details", userView)
router.post("/get-own-legacy-files-count", getOwnLegacyFilesCount)
router.post("/get-leads-count", getLeadsCount)
router.post("/get-mutual-friend", getMutualFriend)

module.exports = router