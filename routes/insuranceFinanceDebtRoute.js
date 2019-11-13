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
const Trustee = require('./../models/Trustee.js')
const commonhelper = require('./../helpers/commonhelper')
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function insuranceList(req, res) {
  let { fields, offset, query,trusteeQuery, order, limit, search } = req.body
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
    insurance.find(query, fields, async function (err, insuranceList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        let totalTrusteeRecords = 0;
        if(insuranceList.length>0){
         totalTrusteeRecords = await commonhelper.customerTrustees(trusteeQuery)
        }
        res.send(resFormat.rSuccess({ insuranceList,totalRecords,totalTrusteeRecords}))   
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function insuranceFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

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
          let resText = 'added';
          if (custData.policyType){
            resText = 'updated';
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

              //let result = { "message": "Insurance "+resText+" successfully" }
              let message = resMessage.data( 607, [{key:'{field}',val:"Insurance details"},{key:'{status}',val: resText}] )
              let result = { "message": message }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "Insurance details "+resText, message, folderName, subFolderName )
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
            insert.customerId = proquery.customerId;
            insert.customerLegacyId = proquery.customerLegacyId;
            insert.customerLegacyType = proquery.customerLegacyType;
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

        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "Insurance Finance & Debt";
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = proquery.customerId;
        logData.fileId = newEntry._id;console.log("logData",logData);
        actitivityLog.updateActivityLog(logData);

        let message = resMessage.data( 607, [{key:'{field}',val:"Insurance details"},{key:'{status}',val: 'added'}] )
        let result = { "message": message }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "Insurance details added", message, folderName, subFolderName )

        //let result = { "message": "Insurance details added successfully!" }
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

function financeList(req, res) {
  let { fields, offset, query, trusteeQuery,order, limit, search } = req.body
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
    Finance.find(query, fields, async function (err, financeList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        let totalTrusteeRecords = 0;
        if(financeList.length>0){
         totalTrusteeRecords = await commonhelper.customerTrustees(trusteeQuery)
        }
        res.send(resFormat.rSuccess({ financeList, totalRecords,totalTrusteeRecords }))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function financesFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

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
          let resText = 'added';
          if (custData.financesType){
            resText = 'updated';
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

              //let result = { "message": "Finance "+resText+" successfully" }
              let message = resMessage.data( 607, [{key:'{field}',val:"Finance details"},{key:'{status}',val: resText}] )
              let result = { "message": message }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "Finance details "+resText, message, folderName, subFolderName )
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
            insert.customerId = proquery.customerId;
            insert.customerLegacyId = proquery.customerLegacyId;
            insert.customerLegacyType = proquery.customerLegacyType;
            insert.financesType = proquery.financesType;  
            insert.nameOnAccount = proquery.nameOnAccount; 
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
        
        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "Insurance Finance & Debt";
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = proquery.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        //let result = { "message": "Finance details added successfully!" }
        let message = resMessage.data( 607, [{key:'{field}',val:"Finance details"},{key:'{status}',val: 'added'}] )
        let result = { "message": message }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "Finacne details added", message, folderName, subFolderName )
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
  let { fields, offset, query, trusteeQuery,order, limit, search } = req.body
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
    Debts.find(query, fields, async function (err, debtList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
         let totalTrusteeRecords = 0;
         if(totalRecords>0){
          totalTrusteeRecords = await commonhelper.customerTrustees(trusteeQuery)
         }
         res.send(resFormat.rSuccess({ debtList, totalRecords,totalTrusteeRecords }))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function debtFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

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
          let resText = 'added';
          if (custData.debtsType){
            resText = 'updated';
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

              //let result = { "message": "Debt "+resText+" successfully" }

              let message = resMessage.data( 607, [{key:'{field}',val:"Debt details"},{key:'{status}',val: resText}] )
              let result = { "message": message }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "Debt details "+resText, message, folderName, subFolderName )

              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let result = { "message": "No record found." }
          res.send(resFormat.rError(result));
        }
      }
    })
  }
  else { 
    let { proquery } = req.body;
    var insert = new Debts();
    insert.customerId = proquery.customerId;
    insert.customerLegacyId = proquery.customerLegacyId;
    insert.customerLegacyType = proquery.customerLegacyType;
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

        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "Insurance Finance & Debt";
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }
        
        logData.customerId = proquery.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let message = resMessage.data( 607, [{key:'{field}',val:'Debt Details'},{key:'{status}',val:'added'}] )
        let result = { "message": message }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "Debt Details Added", message, folderName, subFolderName )

        //let result = { "message": "Debt details added successfully!" }
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

function deleteInsurance(req, res) {
  let { query } = req.body;
  let fields = { }
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  insurance.findOne(query, fields, function (err, insuranceInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus,documents:[] }
      insurance.update({ _id: insuranceInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          if(insuranceInfo.documents.length>0){
            var fileArray = []; 
            let filePath = insuranceInfo.customerId+'/'+constants.s3Details.insuranceFilePath;
              async.each(insuranceInfo.documents, async (val) => {
              await fileArray.push({"Key":filePath+val.tmpName});
            })
            s3.deleteFiles(fileArray,filePath);   
          }  
          actitivityLog.removeActivityLog(insuranceInfo._id);
          //let result = { "message": "Record deleted successfully!" }
          let message = resMessage.data( 607, [{key:'{field}',val:'Insurance'},{key:'{status}',val:'deleted'}] )
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Insurance Deleted", message, folderName, subFolderName )
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function debtDebt(req, res) {
  let { query } = req.body;
  let fields = { }
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body
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
          actitivityLog.removeActivityLog(debtInfo._id);
          //let result = { "message": "Record deleted successfully!" }
          let message = resMessage.data( 607, [{key:'{field}',val:'Debt'},{key:'{status}',val:'deleted'}] )
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Debt Deleted", message, folderName, subFolderName )
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function deleteFinances(req, res) {
  let { query } = req.body;
  let fields = { }
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body
  Finance.findOne(query, fields, function (err, financeInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus,documents:[] }
      Finance.update({ _id: financeInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          if(financeInfo.documents.length>0){
            var fileArray = []; 
            let filePath = financeInfo.customerId+'/'+constants.s3Details.financeFilePath;
              async.each(financeInfo.documents, async (val) => {
              await fileArray.push({"Key":filePath+val.tmpName});
            })
            s3.deleteFiles(fileArray,filePath);   
          }  
          actitivityLog.removeActivityLog(financeInfo._id);
          //let result = { "message": "Record deleted successfully!" }
          let message = resMessage.data( 607, [{key:'{field}',val:'Finance'},{key:'{status}',val:'deleted'}] )
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Finance Deleted", message, folderName, subFolderName )
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