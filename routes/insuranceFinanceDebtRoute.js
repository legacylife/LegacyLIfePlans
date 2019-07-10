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
const insurance = require('../models/Insurance.js')
const Finance = require('../models/Finances.js')
const Debts = require('../models/Debts.js')
const s3 = require('../helpers/s3Upload')
const actitivityLog = require('./../helpers/fileAccessLog')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function insuranceList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  insurance.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    insurance.find(query, fields, function (err, insuranceList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ insuranceList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function insuranceFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;

  var logData = {}
  logData.fileName = constants.InsurancePolicyType[proquery.policyType];
  logData.folderName = 'insurance-finance-debt';
  logData.subFolderName = 'insurance';

  if(query._id){
    insurance.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details  added';
          if (custData.policyType){
            resText = 'details updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          insurance.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let result = { "message": "Insurance "+resText+" successfully" }
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
            var insert = new insurance();
            insert.customerId = query.customerId;
            insert.policyType = proquery.policyType;  
            insert.company = proquery.company;  
            insert.policyNumber = proquery.policyNumber;  
            insert.contactPerson = proquery.contactPerson;  
            insert.contactEmail = proquery.contactEmail;  
            insert.contactPhone = proquery.contactPhone;  
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

        let result = { "message": "Insurance added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}
function viewInsurance(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  insurance.findOne(query, fields, function (err, insuranceList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(insuranceList))
    }
  })
}

function deleteInsurance(req, res) {
  let { query } = req.body;
  let fields = { }
  insurance.findOne(query, fields, function (err, insuranceInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      insurance.update({ _id: insuranceInfo._id }, { $set: params }, function (err, updatedinfo) {
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


function financeList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  Finance.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    Finance.find(query, fields, function (err, financeList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ financeList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function financesFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;

  var logData = {}
  logData.fileName = constants.FinancePolicyType[proquery.financesType];
  logData.folderName = 'insurance-finance-debt';
  logData.subFolderName = 'finance';


  if(query._id){
    Finance.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details added';
          if (custData.financesType){
            resText = 'details updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          Finance.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let result = { "message": "Finance "+resText+" successfully" }
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
            var insert = new Finance();
            insert.customerId = query.customerId;
            insert.financesType = proquery.financesType;  
            insert.administatorName = proquery.administatorName; 
            insert.financesTypeNew = proquery.financesTypeNew;  
            insert.branchLocation = proquery.branchLocation;  
            insert.accountNumber = proquery.accountNumber;  
            insert.contactEmail = proquery.contactEmail;  
            insert.contactPhone = proquery.contactPhone;  
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

        let result = { "message": "Finance details added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function viewFinance(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  Finance.findOne(query, fields, function (err, financeList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(financeList))
    }
  })
}

function debtList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  Debts.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    Debts.find(query, fields, function (err, debtList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ debtList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}


function debtFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;

  var logData = {}
  logData.fileName = constants.DebtType[proquery.debtsType];
  logData.folderName = 'insurance-finance-debt';
  logData.subFolderName = 'debt';

  if(query._id){
    Debts.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details added';
          if (custData.debtsType){
            resText = 'details updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          Debts.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let result = { "message": "Debt "+resText+" successfully" }
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
            var insert = new Debts();
            insert.customerId = query.customerId;
            insert.debtsType = proquery.debtsType;  
            insert.bankLendarName = proquery.bankLendarName; 
            insert.debtsTypeNew = proquery.debtsTypeNew;  
            insert.accountNumber = proquery.accountNumber;  
            insert.contactEmail = proquery.contactEmail;  
            insert.contactPhone = proquery.contactPhone;  
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

        let result = { "message": "Debt details added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}


function viewDebt(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  Debts.findOne(query, fields, function (err, debtList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(debtList))
    }
  })
}

function debtDebt(req, res) {
  let { query } = req.body;
  let fields = { }
  Debts.findOne(query, fields, function (err, debtInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      Debts.update({ _id: debtInfo._id }, { $set: params }, function (err, updatedinfo) {
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


function deleteFinances(req, res) {
  let { query } = req.body;
  let fields = { }
  Finance.findOne(query, fields, function (err, financeInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      Finance.update({ _id: financeInfo._id }, { $set: params }, function (err, updatedinfo) {
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

router.post("/view-insurance-details", viewInsurance)
router.post("/view-finance-details", viewFinance)
router.post("/view-debt-details", viewDebt)

router.post("/insuranceListing", insuranceList)
router.post("/financeListing", financeList)
router.post("/debtListing", debtList)

router.post("/insurance-form-submit", insuranceFormUpdate)
router.post("/finance-form-submit", financesFormUpdate)
router.post("/debt-form-submit", debtFormUpdate)

router.post("/delete-insurance", deleteInsurance)
router.post("/delete-finances", deleteFinances)
router.post("/delete-debt", debtDebt)

module.exports = router