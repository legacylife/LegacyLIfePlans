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
const { isEmpty, cloneDeep, _ } = require('lodash')
const Busboy = require('busboy')
const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const emailTemplates = require('./emailTemplatesRoute.js')
const trust = require('./../models/Trustee.js')
const HiredAdvisors = require('./../models/HiredAdvisors')
const advisorActivityLog = require('./../helpers/advisorActivityLog')
ObjectId = require('mongodb').ObjectID;

const actitivityLog = require('./../helpers/fileAccessLog')
const sendEmail = require('./../helpers/sendEmail')
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function trustsList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  trust.countDocuments(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    trust.find(query, fields, function (err, trustList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ trustList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit).populate('trustId')
  })
}

function getUserDetails(req, res) {
  let { query } = req.body;
  if (query.email) {
    trust.findOne(query, {}, function (err, trustDetails) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        if (trustDetails) {
          message = "'" + trustDetails.email + "' has already been invited as a trustee.";
          status = 'Exist';
          let result = { "code": status, "message": message }
          res.status(200).send(resFormat.rSuccess(result));
        } else {
          let fields = { _id: 1, userType: 1, firstName: 1, lastName: 1, status: 1 }
          User.findOne({ "username": query.email }, fields, function (err, userDetails) {
            if (err) {
              res.status(401).send(resFormat.rError(err))
            } else {
              if (userDetails && userDetails.userType == 'advisor') {
                message = "You can't send invitaion '" + query.email + "' this email id is register as advisor.";
                status = 'Exist';
              } else if (userDetails && userDetails.userType == 'sysadmin') {
                message = "You can't send invitaion '" + query.email + "' this email id is register as system admin.";
                status = 'Exist';
              } else if (userDetails && query.customerId == userDetails._id) {
                message = "This email is the owner of Legacy Life plans and cannot be a trustee. Please enter another email ID";
                status = 'Exist';
              } else {
                message = "";
                status = 'success';
              }
            }
            let result = { "code": status, "message": message, "userDetails": userDetails }
            res.status(200).send(resFormat.rSuccess(result));
          })
        }
      }
    })
  } else {
    message = "Please enter email id"; status = 'Exist';
    let result = { "code": status, "message": message, "userDetails": '' }
    res.status(200).send(resFormat.rSuccess(result));
  }
}

function trustFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { extrafields } = req.body;
  clientUrl = constants.clientUrl + "/customer/signup";
  if(proquery.relation == 4){
    clientUrl = constants.clientUrl + "/advisor/signup";
  }  
  var logData = {}
  logData.fileName = proquery.firstName;
  logData.folderName = 'Trustee';
  logData.subFolderName = 'Add Trustee';
  if (query._id) {
    trust.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'added';
          if (custData.firstName) {
            resText = 'updated';
          }
          let { proquery } = req.body;
          if (proquery.trustId && proquery.trustId != '0')
            proquery.status = 'Active';
          proquery.trustId && proquery.trustId != '' ? proquery.trustId = proquery.trustId : delete proquery.trustId;
          proquery.modifiedOn = new Date();
          trust.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              //stat = sendTrusteeMail(proquery.email, proquery.messages, proquery.folderCount, extrafields.inviteByName, proquery.firstName, clientUrl, "Reminder: ");
              //let result = { "message": "Trustee " + resText + " successfully" }
              let message = resMessage.data( 607, [{key:'{field}',val:"Trustee details"}, {key:'{status}',val:resText}] )
              let result = { "message": message }
              //Update activity logs
              allActivityLog.updateActivityLogs( query.customerId, (proquery.trustId ? proquery.trustId : query.customerId), "Trustee details "+resText, message,'Dashboard') 
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
    var insert = new trust();
    insert.customerId = query.customerId;
    insert.firstName = proquery.firstName;
    insert.lastName = proquery.lastName;
    insert.relation = proquery.relation;
    insert.email = proquery.email;
    insert.messages = proquery.messages;
    insert.selectAll = proquery.selectAll;
    insert.userAccess = proquery.userAccess;
    insert.filesCount = proquery.filesCount;
    insert.folderCount = proquery.folderCount;
    if (proquery.trustId != '') {
      insert.trustId = ObjectId(proquery.trustId);
      insert.status = 'Active';
    } else {
      insert.status = 'Pending';
    }
    insert.createdOn = new Date();
    insert.modifiedOn = new Date();
    insert.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {

        // Get all advisor of current logged in customers
        HiredAdvisors.find({ customerId: query.customerId }, function (err, data) {
          if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
              let trusteeName = proquery.firstName +' ' + proquery.lastName;
              if(data[i].advisorId){
                advisorActivityLog.updateActivityLog(query.customerId,data[i].advisorId, 'trustee','',trusteeName);
              }
            }
          } 
        })
        stat = sendTrusteeMail(proquery.email, proquery.messages, proquery.folderCount, extrafields.inviteByName, proquery.firstName, clientUrl, "");

        let message = resMessage.data( 607, [{key:'{field}',val:"Trustee details"}, {key:'{status}',val: 'added'}] )
        //Update activity logs
        allActivityLog.updateActivityLogs( query.customerId, (proquery.trustId ? proquery.trustId : query.customerId),"Add Trustee",message,'Dashboard') 
        let result = { "message": message }
        //let result = { "message": "Trustee details added successfully" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function sendTrusteeMail(emailId, comment, number, inviteByName, inviteToName, clientUrl, Remider) {
  emailTemplates.getEmailTemplateByCode("InviteTrustee").then((template) => {
    if (template) {
      template = JSON.parse(JSON.stringify(template));
      let body = template.mailBody.replace("{inviteToName}", inviteToName);
      body = body.replace("{number}", number);
      body = body.replace("{inviteByName}", inviteByName);
      body = body.replace("{inviteByName}", inviteByName);
      body = body.replace("{inviteByName}", inviteByName);
      body = body.replace("{inviteByName}", inviteByName);
      body = body.replace("{comment}", comment);
      body = body.replace("{LINK}", clientUrl);
      body = body.replace("{SERVER_LINK}", clientUrl);
      const mailOptions = {
        to: emailId,
        subject: Remider + '' + template.mailSubject,
        html: body
      }
      sendEmail(mailOptions);
      return true;
    } else {
      return false;
    }
  })
}

function trustResendInvitation(req, res) {
  let { query } = req.body;
  let { extrafields } = req.body;
  clientUrl = constants.clientUrl + "/customer/signup";
  trust.findOne(query, {}, function (err, trustDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      if(trustDetails.relation == 4){
        clientUrl = constants.clientUrl + "/advisor/signup";
      }  
      stat = sendTrusteeMail(trustDetails.email, trustDetails.messages, trustDetails.folderCount, extrafields.inviteByName, trustDetails.firstName, clientUrl, "Reminder: ");
      let result = { "message": resMessage.data(703)}
      res.status(200).send(resFormat.rSuccess(result))
    }
  })
}

function getTrusteeDetails(req, res) {
  let { query } = req.body;
  trust.findOne(query, {}, function (err, trustDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      if(trustDetails){
        res.status(200).send(resFormat.rSuccess(trustDetails));
      }else{
        let result = {"message": resMessage.data(705)}//705 same used for advisor function getAdvisorDetails
        res.status(200).send(resFormat.rError(result));
      }     
    }
  }).populate('customerId')
}

function getSubSectionsList(req, res){
  let { fields, offset, query, order, limit, search } = req.body
  trust.countDocuments(query, function (err, userCount){
    if(userCount){
      totalUsers = userCount
      trust.find(query, fields, function (err, trusteeUsersList) {
        if (err) {
          res.status(401).send(resFormat.rError(err))
        } else {
          //  console.log("trusteeUsersList",trusteeUsersList)
            trusteeCount = trusteeUsersList.length;
            res.status(200).send(resFormat.rSuccess({trusteeUsersList,trusteeCount}));
        }
      }).populate('trustId')  
    }else{
      let trusteeUsersList = [];
      let trusteeCount = '';
      res.status(200).send(resFormat.rSuccess({trusteeUsersList,trusteeCount}));
    }
  })
}

function trusteePermissionsUpdate(req, res){
    let { query } = req.body;
    let { updateExtra } = req.body;
    let key = query.insertArray.code;
    let list = query.insertArray.accessManagement;
    
    async.each(list, (contact,callback) => {
      let newContact = JSON.parse(JSON.stringify(contact))
      let ext = newContact.ids.split('##');
     
      if (ext[0]) {
        let documentId = ext[0];
        let value = ext[1];
        let fields = { filesCount: 1, folderCount: 1 ,userAccess:1}
        trust.findOne({ _id: documentId},fields, function (err, trustDetails) {
         
          let updateData = {};
          if(key=='LegacyLifeLettersMessagesManagement' && updateExtra.letterId){
            var oldvalues = trustDetails.userAccess.LegacyLifeLettersMessagesManagement;
            let updateArray = oldvalues;let updateObj = {};
          if(oldvalues.length>0){
            let updateVl =  _.findIndex(oldvalues, function(o) { return o.letterId == updateExtra.letterId; });
            if(updateVl>=0){
              oldvalues[updateVl] = {"letterId" : mongoose.Types.ObjectId(updateExtra.letterId),
                                    "access" : value,
                                    "updatedOn" : new Date(),
                                    };
                          updateArray = oldvalues;
            }else{
              updateArray = oldvalues;
              updateObj = {"letterId" : mongoose.Types.ObjectId(updateExtra.letterId),
                            "access" : value,
                            "updatedOn" : new Date(),
                          };
                          updateArray.push(updateObj);
                          updateArray.concat(oldvalues);
            }
          }else{
              updateObj =  {"letterId" : mongoose.Types.ObjectId(updateExtra.letterId),
                  "access" : value,
                  "updatedOn" : new Date(),
                };
                updateArray.push(updateObj);
          }

            updateData[`userAccess.${key}`] = updateArray;
          }else{
            var filescnt = parseInt(trustDetails.filesCount);
            if(newContact.oldValue=='now' && value!='now'){
              filescnt = parseInt(filescnt)-1;
            }else if(newContact.oldValue!='now' && value=='now'){
              filescnt = parseInt(filescnt)+1;
            }

            updateData[`userAccess.${key}`] = value;
            updateData['filesCount'] = filescnt;
          }
          trust.updateOne({ _id: documentId},{ $set:  updateData }, function (err, updatedDetails) {
            if (err) {
              res.status(401).send(resFormat.rError(err))
            } else {
              callback()
            }
          })
        })
       } 
      }, (err) => {
        let result = { "message": "Trustee permissions updated successfully" }
        res.status(200).send(resFormat.rSuccess(result));
    })
}

router.post("/listing", trustsList)
router.post("/get-user", getUserDetails)
router.post("/view-details", getTrusteeDetails)
router.post("/form-submit", trustFormUpdate)
router.post("/resend-invitation", trustResendInvitation)
router.post("/subSectionsList", getSubSectionsList)
router.post("/subSections-form-submit", trusteePermissionsUpdate)
module.exports = router