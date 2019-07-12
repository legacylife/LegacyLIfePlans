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
// const Mailchimp = require('mailchimp-api-v3')

const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const AdvisorActivityLog = require('./../models/AdvisorActivityLog')
const HiredAdvisors = require('./../models/HiredAdvisors')
const s3 = require('./../helpers/s3Upload')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

// Function to activate advisor
function activateAdvisor(req, res) {
  console.log("request body >>>>>>", req.body)
  let { query } = req.body;
  let fields = { id: 1, username: 1, status: 1 }
  User.findOne(query, fields, function (err, userList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Active';
      var tokens = generateToken(85);
      var date = new Date()

      var params = { status: upStatus, token: tokens, signupApprovalDate: date }
      User.update({ _id: userList._id }, { $set: params }, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let clientUrl = constants.clientUrl;
          var link = "";
          var link = clientUrl + '/advisor/set-password/' + tokens;

          // Send reset password link to advisor email
          emailTemplatesRoute.getEmailTemplateByCode("ActivateUser").then((template) => {
            if (template) {
              template = JSON.parse(JSON.stringify(template));
              let body = template.mailBody.replace("{link}", link);
              const mailOptions = {
                to: userList.username,
                subject: template.mailSubject,
                html: body
              }
              sendEmail(mailOptions)
              //res.send(resFormat.rSuccess('We have set your password. Please login & use system.'))
              let result = { userId: updatedUser._id, userType: updatedUser.userType, "message": "We have set your password. Please login & use system." }
              res.status(200).send(resFormat.rSuccess(result))
            } else {
              res.status(401).send(resFormat.rError('Some error Occured'))
            }
          })
        }
      })
    }
  })
}

// Function to update reject reason for advisor
function rejectAdvisor(req, res) {

  let query = { "_id": req.body._id };
  let fields = { id: 1, username: 1, status: 1 }
  User.findOne(query, fields, function (err, userList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var date = new Date()
      upStatus = 'Rejected';
      approveRejectReason = req.body.approveRejectReason;

      var params = { status: upStatus, signupApprovalDate: date, approveRejectReason: approveRejectReason }
      User.update({ _id: userList._id }, { $set: params }, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {

          // Send reset password link to advisor email
          emailTemplatesRoute.getEmailTemplateByCode("RejectAdvisor").then((template) => {
            if (template) {
              console.log(template)
              template = JSON.parse(JSON.stringify(template));
              let body = template.mailBody;
              const mailOptions = {
                to: userList.username,
                subject: template.mailSubject,
                html: body
              }
              sendEmail(mailOptions)
              //res.send(resFormat.rSuccess('We have set your password. Please login & use system.'))
              let result = { userId: updatedUser._id, userType: updatedUser.userType, "message": "We have set your password. Please login & use system." }
              res.status(200).send(resFormat.rSuccess(result))
            } else {
              res.status(401).send(resFormat.rError('Some error Occured'))
            }
          })


        }
      })
    }
  })
}

/**
 * Function to get advisor activity log on advisor dashboard 
 */
function recentUpdateList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  AdvisorActivityLog.countDocuments(query, function (err, logcount) {
    if (logcount) {
      totalRecords = logcount
    }
    AdvisorActivityLog.find(query, fields, function (err, logList) {
      console.log(logList)
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ logList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

/**
 * Function to hire advisor
 */

function hireAdvisorOLD(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;

  if (query.customerId && query.advisorId) {
    HiredAdvisors.findOne(query, function (err, hireData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (hireData && hireData._id) {
          proquery.modifiedOn = new Date();
          HiredAdvisors.updateOne({ _id: hireData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              if (from.logId) {
                AdvisorActivityLog.updateOne({ _id: from.logId }, { $set: { actionTaken: proquery.status } }, function (err, logDetails) {
                  if (err) {
                    res.send(resFormat.rError(err))
                  } else {
                    let result = { "message": "Request updated successfully!" }
                    res.status(200).send(resFormat.rSuccess(result))
                  }
                })
              }
              else {
                let result = { "message": "Request updated successfully!" }
                res.status(200).send(resFormat.rSuccess(result))
              }
            }
          })
        } else {
          let { proquery } = req.body;
          console.log(proquery)
          var hireadvisor = new HiredAdvisors();
          hireadvisor.status = 'Pending';
          hireadvisor.customerId = query.customerId;
          hireadvisor.advisorId = query.advisorId;

          hireadvisor.createdOn = new Date();
          hireadvisor.modifiedOn = new Date();
          hireadvisor.createdby = query.customerId;
          hireadvisor.modifiedby = query.customerId;
          hireadvisor.save({ $set: proquery }, function (err, newEntry) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              User.findOne({ _id: query.customerId }, { firstName: 1, lastName: 1, profilePicture: 1 }, function (err, userList) {

                if (err) {
                  let result = { "message": "Something Wrong!" }
                  res.send(resFormat.rError(result));
                } else {
                  var advisorLog = new AdvisorActivityLog();
                  advisorLog.status = 'Pending';
                  advisorLog.customerId = query.customerId;
                  advisorLog.advisorId = query.advisorId;
                  advisorLog.createdOn = new Date();
                  advisorLog.modifiedOn = new Date();
                  advisorLog.createdby = query.customerId;
                  advisorLog.modifiedby = query.customerId;

                  advisorLog.sectionName = "hired";
                  advisorLog.actionTaken = "Pending";
                  advisorLog.customerProfileImage = userList.profilePicture;
                  advisorLog.customerFirstName = userList.firstName;
                  advisorLog.customerLastName = userList.lastName;
                  advisorLog.activityMessage = " has confirmed to hire you";

                  advisorLog.save({}, function (err, newEntry) {
                    if (err) {
                      res.send(resFormat.rError(err))
                    } else {
                      let result = { "message": "Request sent successfully!" }
                      res.status(200).send(resFormat.rSuccess(result))
                    }
                  })
                }
              })
            }
          })
        }
      }
    })
  } else {
    let result = { "message": "No record found." }
    res.send(resFormat.rError(result));
  }
}


function hireAdvisorStatus(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;
  let { extraFields } = req.body;

 // let { extrafields } = req.body;
//  clientUrl = constants.serverUrl + "/customer/signup";
  if(query._id){
    HiredAdvisors.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {   
          proquery.modifiedOn = new Date();
          HiredAdvisors.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {                        
              if (from.logId) {
                AdvisorActivityLog.updateOne({_id:from.logId}, { $set: { actionTaken: proquery.status}}, function (err, logDetails) {
                  if (err) {
                    res.send(resFormat.rError(err))
                  } else {
                    let MsgText = 'accepted';
                    if(proquery.status=='Rejected'){
                        MsgText = 'rejected';
                    }
                  
                    let custEmail = extraFields.custEmail;
                    let custName = extraFields.custName;                  
                    let advFname = extraFields.advFname;
                    let advLname = extraFields.advLname;
                    let subStatus = "Legacy request "+MsgText;
                    let EmailMesg = advFname+" "+advLname+" has been "+MsgText+" your legacy request"; 
                    stat = sendHireStatusMail(custEmail,custName,EmailMesg,subStatus);                     
                    let result = { "message": "Legacy request "+MsgText+" successfully" }
                    res.status(200).send(resFormat.rSuccess(result))
                  }
                })
              }
              else {
                let result = { "message": "Request reminder sent successfully" }
                res.status(200).send(resFormat.rSuccess(result))
              }
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
            var insert = new HiredAdvisors();
            insert.customerId = query.customerId;
            insert.selectAll = proquery.selectAll;
            insert.userAccess = proquery.userAccess;
            insert.filesCount = proquery.filesCount;
            insert.folderCount = proquery.folderCount;
            insert.advisorId = ObjectId(proquery.advisorId);
            insert.status = 'Pending';

            insert.createdOn = new Date();
            insert.modifiedOn = new Date();     
            insert.createdby = query.customerId;
            insert.modifiedby = query.customerId;                  
            insert.save({$set:proquery}, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
     
        User.findOne({ _id: query.customerId }, { firstName: 1, lastName: 1, username: 1 }, function (err, advisorUser) {
          if (err) {
            res.status(401).send(resFormat.rError(err))
          } else {
            let inviteByName = extraFields.inviteByName;       
            let toEmail = advisorUser.username;
            let advName = advisorUser.firstName;
            let EmailMesg = inviteByName+" has been send you legacy request"; 
            stat = sendHireStatusMail(toEmail,advName,EmailMesg,'');           
          }
        })   
       
        User.findOne({ _id: query.customerId }, { firstName: 1, lastName: 1, profilePicture: 1 }, function (err, userList) {
          if (err) {
            let result = { "message": "Something Wrong!" }
            res.send(resFormat.rError(result));
          } else {
            var advisorLog = new AdvisorActivityLog();
            advisorLog.status = 'Pending';
            advisorLog.customerId = query.customerId;
            advisorLog.advisorId = query.advisorId;
            advisorLog.createdOn = new Date();
            advisorLog.modifiedOn = new Date();
            advisorLog.createdby = query.customerId;
            advisorLog.modifiedby = query.customerId;
            advisorLog.sectionName = "hired";
            advisorLog.actionTaken = "Pending";
            advisorLog.customerProfileImage = userList.profilePicture;
            advisorLog.customerFirstName = userList.firstName;
            advisorLog.customerLastName = userList.lastName;
            advisorLog.activityMessage = " has confirmed to hire you";
            advisorLog.save({}, function (err, newEntry) {
              if (err) {
                res.send(resFormat.rError(err))
              } else {
                let result = { "message": "Request sent successfully!" }                
              }
            })
          }
        })      
        let result = { "message": "Request sent successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}


function sendHireStatusMail(emailId,toName,comment,subStatus) {

  emailTemplatesRoute.getEmailTemplateByCode("HireAdvisorStatus").then((template) => {
   if (template) {
     template = JSON.parse(JSON.stringify(template));
    
     let body = template.mailBody.replace("{toName}", toName);                      
     body = body.replace("{comment}", comment);
 
     const mailOptions = {
       to: emailId,//'pankajk@arkenea.com',
       subject: subStatus+''+template.mailSubject,
       html: body
     }
     console.log("mailOptions",mailOptions)
     sendEmail(mailOptions);
     return true;
   } else {
     return false;
   }
 })
}

function hireAdvisorList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  HiredAdvisors.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    HiredAdvisors.find(query, fields, function (err, advisorList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ advisorList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit).populate('customerId').populate('advisorId');
  })
}

/**
 * Function to send advisor contact details
 */
function contactAdvisor(req, res) {
  let { query } = req.body
  let { advisorDetails } = req.body;

  User.findOne(query, {}, function (err, user) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      //forgot password email template
      emailTemplatesRoute.getEmailTemplateByCode("sendAdvisorContactDetails").then((template) => {
        if (template) {
          template = JSON.parse(JSON.stringify(template));
          let body = template.mailBody.replace("{advisor_name}", advisorDetails.advisorFullname);
          body = body.replace("{advisor_email}", advisorDetails.advisorEmail);
          body = body.replace("{advisor_phone}", advisorDetails.advisorPhone);
          body = body.replace("{advisor_address}", advisorDetails.advisorAddress);

          const mailOptions = {
            to: user.username,
            subject: template.mailSubject,
            html: body
          }
          sendEmail(mailOptions)

          // Add activity log
          var advisorLog = new AdvisorActivityLog();
          advisorLog.customerId = user._id;
          advisorLog.advisorId = advisorDetails.advisorId;
          advisorLog.createdOn = new Date();
          advisorLog.modifiedOn = new Date();
          advisorLog.createdby = user._id;
          advisorLog.modifiedby = user._id;

          advisorLog.sectionName = "contact";
          advisorLog.actionTaken = "";
          advisorLog.customerProfileImage = user.profilePicture;
          advisorLog.customerFirstName = user.firstName;
          advisorLog.customerLastName = user.lastName;
          advisorLog.activityMessage = "contacted you";

          advisorLog.save({}, function (err, newEntry) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "The advisor’s contact details are sent on your email." }
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          res.status(401).send(resFormat.rError('Some error Occured'))
        }
      })
    }
  })
}

function checkHireAdvisorRequest(req, res) {
  let { fields, offset, query, order, limit } = req.body
  let totalRecords = 0

  HiredAdvisors.findOne(query, function (err, found) {
    let result = { code : "","message": "" }
    if (found) {
      result = { code : "Exist","message": "Request already Sent" }     
    }
    res.status(200).send(resFormat.rSuccess(result))
  })
}

function fileupload(req, res) {
  console.log(req);
}

function generateToken(n) {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var token = '';
  for (var i = 0; i < n; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}


router.post("/activateadvisor", activateAdvisor)
router.post("/rejectadvisor", rejectAdvisor)
router.post("/fileupload", fileupload)
router.post("/contactadvisor", contactAdvisor)
router.post("/recentupdatelist", recentUpdateList)
router.post("/checkHireAdvisor", checkHireAdvisorRequest)
router.post("/hireadvisor", hireAdvisorStatus)
router.post("/hireAdvisorListing", hireAdvisorList)
module.exports = router
