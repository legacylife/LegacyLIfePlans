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
const finalwishes = require('./../models/FinalWishes.js')
const obituary = require('./../models/Obituary.js')
const celebration = require('./../models/CelebrationOfLife.js')
const funeralplan = require('./../models/FinalWishesPlans.js')
const expenses = require('./../models/FinalWishesExpenses.js')
const s3 = require('./../helpers/s3Upload')
const actitivityLog = require('./../helpers/fileAccessLog')
const HiredAdvisors = require('./../models/HiredAdvisors')
//const Trustee = require('./../models/Trustee.js')
const commonhelper = require('./../helpers/commonhelper')
const Trustee = require('./../models/Trustee.js')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')

async function finalList(req, res) {
  let { fields, query } = req.body
  let funeralPlanData = await funeralplan.find(query).sort({modifiedOn : -1});
  let funeralExpenseData = await expenses.find(query).sort({modifiedOn : -1});
  let obituaryData = await obituary.find(query).sort({modifiedOn : -1});
  let celebrationData = await celebration.find(query).sort({modifiedOn : -1});
  let trusteeQuery ={}
  let totalFuneralTrusteeRecords = 0;
  
  if(funeralPlanData.length>0){
    trusteeQuery = {customerId: query.customerId,"userAccess.FuneralPlansManagement" : "now", status:"Active"};
    totalFuneralTrusteeRecords = await commonhelper.customerTrustees(trusteeQuery)
  }

  let totalObituaryTrusteeRecords = 0;
  if(funeralPlanData.length>0){
    trusteeQuery = {customerId: query.customerId,"userAccess.ObituaryManagement" : "now", status:"Active"};
    totalObituaryTrusteeRecords = await commonhelper.customerTrustees(trusteeQuery)
  }

  let totalCelebrTrusteeRecords = 0;
  if(funeralPlanData.length>0){
    trusteeQuery = {customerId: query.customerId,"userAccess.CelebrationLifeManagement" : "now", status:"Active"};
    totalCelebrTrusteeRecords = await commonhelper.customerTrustees(trusteeQuery)
  }

  let totalExpenseTrusteeRecords = 0;
  if(funeralPlanData.length>0){
    trusteeQuery = {customerId: query.customerId,"userAccess.FuneralExpenseManagement" : "now", status:"Active"};
    totalExpenseTrusteeRecords = await commonhelper.customerTrustees(trusteeQuery)
  }
  
  res.send(resFormat.rSuccess({ obituaryData, funeralExpenseData, celebrationData, funeralPlanData, totalFuneralTrusteeRecords, totalObituaryTrusteeRecords, totalCelebrTrusteeRecords, totalExpenseTrusteeRecords }))
}

/**
 * Add / edit function for obituary form
 */
function obituaryFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId } = req.body;
  let { toId } = req.body;

  let { folderName } = req.body
  folderName = folderName.replace('/', '');
  let subFolderName = '';
  var logData = {}
  if(proquery.check == 'yes'){
    logData.fileName = 'Prepared an obituary';
  }
  else {
    logData.fileName = 'I don’t have an obituary';
  }
  //logData.fileName = proquery.check;
  logData.folderName = 'finalwishes';
  logData.subFolderName = 'obituary';

  if (query._id) {
    obituary.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'added';
          if (custData.check) {
            resText = 'updated';
          }
          let { proquery } = req.body;
          proquery.status = 'Active';
          proquery.modifiedOn = new Date();
          obituary.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let rmessage = resMessage.data(607, [{ key: '{field}', val: 'Final Wish' }, { key: '{status}', val: resText }])
              let result = { "message": rmessage }
              //Update activity logs
              allActivityLog.updateActivityLogs(fromId, toId, 'Final Wish' + resText, rmessage, folderName, subFolderName)

              //let result = { "message": message.messageText+" "+resText+" successfully" }
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
    var insert = new obituary();
    insert.customerId = proquery.customerId;
    insert.customerLegacyId = proquery.customerLegacyId;
    insert.customerLegacyType = proquery.customerLegacyType;
    insert.check = proquery.check;
    insert.prepareTo = proquery.prepareTo;
    insert.photos = proquery.photos;
    insert.media = proquery.media;
    insert.sentTo = proquery.sentTo;
    insert.information = proquery.information;
    insert.status = 'Active';
    insert.createdOn = new Date();
    insert.modifiedOn = new Date();
    insert.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        //created helper for customer to send email about files added by advisor
        if (proquery.customerLegacyType == "advisor") {
          var sendData = {}
          sendData.sectionName = "Final Wishes obituary";
          sendData.customerId = newEntry.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = query.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let rmessage = resMessage.data(607, [{ key: '{field}', val: 'Final Wishes obituary' }, { key: '{status}', val: 'added' }])
        let result = { "message": rmessage }
        //Update activity logs
        allActivityLog.updateActivityLogs(fromId, toId, 'Final Wish obituary added', rmessage, folderName, subFolderName)

        //let result = { "message": message.messageText+" details added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

/**
 * view details function for obituary form
 */
function viewObituaryWish(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  obituary.findOne(query, fields, function (err, wishList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(wishList))
    }
  })
}

/**
 * Add / edit function for celebration of life form form
 */
function celebrationFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId } = req.body;
  let { toId } = req.body;

  let { folderName } = req.body
  folderName = folderName.replace('/', '');
  let subFolderName = '';
  var logData = {}
  logData.fileName = proquery.eventByName;
  logData.folderName = 'finalwishes';
  logData.subFolderName = 'celebration';

  if (query._id) {
    celebration.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'added';
          if (custData.eventByName) {
            resText = 'updated';
          }
          let { proquery } = req.body;
          proquery.status = 'Active';
          proquery.modifiedOn = new Date();
          celebration.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let rmessage = resMessage.data(607, [{ key: '{field}', val: 'Final Wish' }, { key: '{status}', val: resText }])
              let result = { "message": rmessage }
              //Update activity logs
              allActivityLog.updateActivityLogs(fromId, toId, 'Final Wish' + resText, rmessage, folderName, subFolderName)

              //let result = { "message": message.messageText+" "+resText+" successfully" }
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
    var insert = new celebration();
    insert.customerId = proquery.customerId;
    insert.customerLegacyId = proquery.customerLegacyId;
    insert.customerLegacyType = proquery.customerLegacyType;

    insert.eventByName = proquery.eventByName;
    insert.eventPlace = proquery.eventPlace;
    insert.speakerAvailable = proquery.speakerAvailable;
    insert.speakerName = proquery.speakerName;
    insert.foodNMenuItems = proquery.foodNMenuItems;
    insert.musicNames = proquery.musicNames;    
    insert.invitedPeople = proquery.invitedPeople;      

    insert.groupActivities = proquery.groupActivities;
    insert.documentLocation = proquery.documentLocation;
    insert.mementos = proquery.mementos;
    insert.paymentOptions = proquery.paymentOptions;

    insert.status = 'Active';
    insert.createdOn = new Date();
    insert.modifiedOn = new Date();
    insert.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        //created helper for customer to send email about files added by advisor
        if (proquery.customerLegacyType == "advisor") {
          var sendData = {}
          sendData.sectionName = "Final Wishes celebration of life";
          sendData.customerId = newEntry.customerId;
          sendData.customerLegacyId = newEntry.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = newEntry.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let rmessage = resMessage.data(607, [{ key: '{field}', val: 'Final Wishes celebration of life' }, { key: '{status}', val: 'added' }])
        let result = { "message": rmessage }
        //Update activity logs
        allActivityLog.updateActivityLogs(fromId, toId, 'Final Wish celebration of life added', rmessage, folderName, subFolderName)

        //let result = { "message": message.messageText+" details added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

/**
 * view details function for celebration form
 */
function viewcelebrationOfLife(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  celebration.findOne(query, fields, function (err, wishList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(wishList))
    }
  })
}

function deleteObituary(req, res) {
  let { query } = req.body;
  let fields = {}
  let { fromId } = req.body
  let { toId } = req.body
  let { folderName } = req.body
  folderName = folderName.replace('/', '')
  let { subFolderName } = req.body

  obituary.findOne(query, fields, function (err, wishInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus, documents: [] }
      obituary.update({ _id: wishInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          if (wishInfo.documents.length > 0) {
            var fileArray = [];
            let filePath = wishInfo.customerId + '/' + constants.s3Details.obituaryFilePath;
            async.each(wishInfo.documents, async (val) => {
              await fileArray.push({ "Key": filePath + val.tmpName });
            })
            s3.deleteFiles(fileArray, filePath);
          }
          actitivityLog.removeActivityLog(wishInfo._id);
          let message = resMessage.data(607, [{ key: '{field}', val: 'Final wish' }, { key: '{status}', val: 'deleted' }])
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs(fromId, toId, "Final Wish Delete", message, folderName, subFolderName)
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function deleteCelebration(req, res) {
  let { query } = req.body;
  let fields = {}
  let { fromId } = req.body
  let { toId } = req.body
  let { folderName } = req.body
  folderName = folderName.replace('/', '')
  let { subFolderName } = req.body

  celebration.findOne(query, fields, function (err, wishInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus, documents: [] }
      celebration.update({ _id: wishInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          if (wishInfo.documents.length > 0) {
            var fileArray = [];
            let filePath = wishInfo.customerId + '/' + constants.s3Details.celebrationofLifeFilePath;
            async.each(wishInfo.documents, async (val) => {
              await fileArray.push({ "Key": filePath + val.tmpName });
            })
            s3.deleteFiles(fileArray, filePath);
          }
          actitivityLog.removeActivityLog(wishInfo._id);
          let message = resMessage.data(607, [{ key: '{field}', val: 'Final wish' }, { key: '{status}', val: 'deleted' }])
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs(fromId, toId, "Final Wish Delete", message, folderName, subFolderName)
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


/**
 * Add / edit function for funeral plan form form
 */
function funeralPlanFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId } = req.body;
  let { toId } = req.body;

  let { folderName } = req.body
  folderName = folderName.replace('/', '');
  let subFolderName = '';
  var logData = {}
  logData.fileName = constants.funeralOptions[proquery.funaralServiceType];
  logData.folderName = 'finalwishes';
  logData.subFolderName = 'funeral-plans';

  if (query._id) {
    funeralplan.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'added';
          if (custData.funaralServiceType) {
            resText = 'updated';
          }
          let { proquery } = req.body;
          proquery.status = 'Active';
          proquery.modifiedOn = new Date();
          funeralplan.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let rmessage = resMessage.data(607, [{ key: '{field}', val: 'Final Wish' }, { key: '{status}', val: resText }])
              let result = { "message": rmessage }
              //Update activity logs
              allActivityLog.updateActivityLogs(fromId, toId, 'Final Wish' + resText, rmessage, folderName, subFolderName)

              //let result = { "message": message.messageText+" "+resText+" successfully" }
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
    var insert = new funeralplan(); 
    insert.customerId = proquery.customerId;
    insert.customerLegacyId = proquery.customerLegacyId;
    insert.customerLegacyType = proquery.customerLegacyType;

    insert.status = 'Active';
    insert.createdOn = new Date();
    insert.modifiedOn = new Date();   

    insert.funaralServiceType = proquery.funaralServiceType
    insert.serviceFor = proquery.serviceFor
    insert.serviceForOther = proquery.serviceForOther
    insert.isBodyPresent = proquery.isBodyPresent
    insert.isCasket  = proquery.isCasket
    insert.deceasedWear = proquery.deceasedWear
  
    insert.serviceParticipants = proquery.serviceParticipants
    insert.leaderChecked = proquery.leaderChecked
    insert.leaderDescrption = proquery.leaderDescrption
    insert.eulogistChecked = proquery.eulogistChecked
    insert.eulogistdescription =  proquery.eulogistdescription 
    insert.reflectionsChecked = proquery.reflectionsChecked
    insert.reflectionsDescription = proquery.reflectionsDescription
    insert.readingsChecked = proquery.readingsChecked
    insert.readingsDescription = proquery.readingsDescription
    insert.musiciansChecked = proquery.musiciansChecked
    insert.musiciansDescription = proquery.musiciansDescription  
    insert.pallbearersChecked = proquery.pallbearersChecked
    insert.pallbearersDescription = proquery.pallbearersDescription
    insert.additionalParticipants = proquery.additionalParticipants
    insert.servicesUsed = proquery.servicesUsed
    insert.flowersUsed = proquery.flowersUsed
  
    insert.isFloralArrangements= proquery.isFloralArrangements
    insert.needVisualTribute= proquery.needVisualTribute
    insert.peopleInVisualTribute= proquery.peopleInVisualTribute
    insert.havePreparedVisualTribute= proquery.havePreparedVisualTribute
    insert.locationOfDocuments= proquery.locationOfDocuments
    insert.additionalPlans= proquery.additionalPlans
    insert.save(proquery, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        //created helper for customer to send email about files added by advisor
        if (proquery.customerLegacyType == "advisor") {
          var sendData = {}
          sendData.sectionName = "Final Wishes funeral plans";
          sendData.customerId = newEntry.customerId;
          sendData.customerLegacyId = newEntry.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = newEntry.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let rmessage = resMessage.data(607, [{ key: '{field}', val: 'Final Wishes funeral plans' }, { key: '{status}', val: 'added' }])
        let result = { "message": rmessage }
        //Update activity logs
        allActivityLog.updateActivityLogs(fromId, toId, 'Final Wish funeral plans added', rmessage, folderName, subFolderName)

        //let result = { "message": message.messageText+" details added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

/**
 * view details function for celebration form
 */
function viewFuneralPlan(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  funeralplan.findOne(query, fields, function (err, wishList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(wishList))
    }
  })
}

function deleteFuneralPlan(req, res) {
  let { query } = req.body;
  let fields = {}
  let { fromId } = req.body
  let { toId } = req.body
  let { folderName } = req.body
  folderName = folderName.replace('/', '')
  let { subFolderName } = req.body

  funeralplan.findOne(query, fields, function (err, wishInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus, documents: [] }
      funeralplan.update({ _id: wishInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          if (wishInfo.documents.length > 0) {
            var fileArray = [];
            let filePath = wishInfo.customerId + '/' + constants.s3Details.finalWishesFilePath;
            async.each(wishInfo.documents, async (val) => {
              await fileArray.push({ "Key": filePath + val.tmpName });
            })
            s3.deleteFiles(fileArray, filePath);
          }
          actitivityLog.removeActivityLog(wishInfo._id);
          let message = resMessage.data(607, [{ key: '{field}', val: 'Final wish' }, { key: '{status}', val: 'deleted' }])
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs(fromId, toId, "Final Wish Delete", message, folderName, subFolderName)
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


/**
 * Add / edit function for obituary form
 */
function expensesFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId } = req.body;
  let { toId } = req.body;

  let { folderName } = req.body
  folderName = folderName.replace('/', '');
  let subFolderName = '';
  var logData = {}
  logData.fileName = constants.expenseOptions[proquery.haveFuneralArrangement];
  logData.folderName = 'finalwishes';
  logData.subFolderName = 'expenses';

  if (query._id) {
    expenses.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'added';
          if (custData.check) {
            resText = 'updated';
          }
          let { proquery } = req.body;
          proquery.status = 'Active';
          proquery.modifiedOn = new Date();
          expenses.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let rmessage = resMessage.data(607, [{ key: '{field}', val: 'Final Wish' }, { key: '{status}', val: resText }])
              let result = { "message": rmessage }
              //Update activity logs
              allActivityLog.updateActivityLogs(fromId, toId, 'Final Wish' + resText, rmessage, folderName, subFolderName)

              //let result = { "message": message.messageText+" "+resText+" successfully" }
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
    var insert = new expenses();
    insert.customerId = proquery.customerId;
    insert.customerLegacyId = proquery.customerLegacyId;
    insert.customerLegacyType = proquery.customerLegacyType;

    insert.status = 'Active';
    insert.createdOn = new Date();
    insert.modifiedOn = new Date();

    insert.haveFuneralArrangement = proquery.haveFuneralArrangement ? proquery.haveFuneralArrangement : "1";
    insert.funeralHome = proquery.funeralHome;
    insert.funeralDirector = proquery.funeralDirector;
    insert.address = proquery.address;
    insert.phoneNumber = proquery.phoneNumber;

    insert.preneedContractLocation = proquery.preneedContractLocation;
    insert.haveGuarantee = proquery.haveGuarantee;
    insert.prepaidFuneralServices = proquery.prepaidFuneralServices;
    insert.havePriceList = proquery.havePriceList;
    insert.totalAmountPay = proquery.totalAmountPay;
    insert.haveToPayOnDeath = proquery.haveToPayOnDeath;
    insert.account = proquery.account;
    insert.amountInAccount = proquery.amountInAccount;
    insert.financialInstitution = proquery.financialInstitution;

    insert.havePooled = proquery.havePooled;
    insert.pooledAccount = proquery.pooledAccount;
    insert.pooledAmount = proquery.pooledAmount;
    insert.pooledInsuranceCompany = proquery.pooledInsuranceCompany;
    insert.ContactInfo = proquery.ContactInfo;
    insert.comments = proquery.comments;
    insert.additionalInstructions = proquery.additionalInstructions;
    
    insert.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        //created helper for customer to send email about files added by advisor
        if (proquery.customerLegacyType == "advisor") {
          var sendData = {}
          sendData.sectionName = "Final Wishes expenses";
          sendData.customerId = newEntry.customerId;
          sendData.customerLegacyId = newEntry.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = newEntry.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let rmessage = resMessage.data(607, [{ key: '{field}', val: 'Final Wishes expense' }, { key: '{status}', val: 'added' }])
        let result = { "message": rmessage }
        //Update activity logs
        allActivityLog.updateActivityLogs(fromId, toId, 'Final Wish obituary added', rmessage, folderName, subFolderName)

        //let result = { "message": message.messageText+" details added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

/**
 * view details function for expense form
 */
function viewExpenses(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  expenses.findOne(query, fields, function (err, wishList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(wishList))
    }
  })
}

function deleteExpenses(req, res) {
  let { query } = req.body;
  let fields = {}
  let { fromId } = req.body
  let { toId } = req.body
  let { folderName } = req.body
  folderName = folderName.replace('/', '')
  let { subFolderName } = req.body

  expenses.findOne(query, fields, function (err, wishInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus, documents: [] }
      expenses.update({ _id: wishInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          if (wishInfo.documents.length > 0) {
            var fileArray = [];
            let filePath = wishInfo.customerId + '/' + constants.s3Details.funeralExpensesFilePath;
            async.each(wishInfo.documents, async (val) => {
              await fileArray.push({ "Key": filePath + val.tmpName });
            })
            s3.deleteFiles(fileArray, filePath);
          }
          actitivityLog.removeActivityLog(wishInfo._id);
          let message = resMessage.data(607, [{ key: '{field}', val: 'Final wish' }, { key: '{status}', val: 'deleted' }])
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs(fromId, toId, "Final Wish Delete", message, folderName, subFolderName)
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}



router.post("/finalListing", finalList)
router.post("/obituary-form-submit", obituaryFormUpdate);
router.post("/view-obituary-details", viewObituaryWish);
router.post("/delete-obituary-finalWish", deleteObituary);

router.post("/celebration-form-submit", celebrationFormUpdate);
router.post("/view-celebration-details", viewcelebrationOfLife);
router.post("/delete-celebration-finalWish", deleteCelebration);

router.post("/funeral-plan-form-submit", funeralPlanFormUpdate);
router.post("/view-funeral-plan-details", viewFuneralPlan);
router.post("/delete-funeral-plan-finalwish", deleteFuneralPlan);

router.post("/funeral-expense-form-submit", expensesFormUpdate);
router.post("/view-funeral-expense-details", viewExpenses);
router.post("/delete-funeral-expense-finalwish", deleteExpenses);

//router.post("/delete-finalWish", deleteFinalWish)
module.exports = router