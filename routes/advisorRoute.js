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
const { isEmpty, cloneDeep, map, sortBy } = require('lodash')
const Busboy = require('busboy')
// const Mailchimp = require('mailchimp-api-v3')
const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const AdvisorActivityLog = require('./../models/AdvisorActivityLog')
const HiredAdvisors = require('./../models/HiredAdvisors')
const trust = require('./../models/Trustee.js')
//ObjectId = require('mongodb').ObjectID;
const s3 = require('./../helpers/s3Upload')
var zipcodes = require('zipcodes');
const advisorActivityLog = require('./../helpers/advisorActivityLog')
const globalSettings = require('./../models/GlobalSettings')
const referEarnSettings = require('./../models/ReferEarnSettings')
const resMessage = require('./../helpers/responseMessages')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

// Function to activate advisoradvisor
function activateAdvisor(req, res) {
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
    AdvisorActivityLog.aggregate([
      {
        $match: {
          advisorId: ObjectId(query.advisorId),
        }
      },
      {
        $sort: order
      },
      {
        $lookup:
          {
            from: "users",
            localField: "customerId",
            foreignField: "_id",
            as: "userInfo"
          }
      }
    ], function (err, logList) {      
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

              // Add entry in advisor activity log
              advisorActivityLog.updateActivityLog(req.body);
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

  if (query._id) {
    HiredAdvisors.findOne(query, function (err, HiredData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (HiredData && HiredData._id) {
          proquery.modifiedOn = new Date();
          
          HiredAdvisors.updateOne({ _id: HiredData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              
              let activityLogID = from.logId;
              let MsgText = 'accepted';
              if (proquery.status == 'Rejected') {
                MsgText = 'rejected';
              }
              let custEmail = extraFields.custEmail;
              let custName = extraFields.custName;

              let advFname = extraFields.advFname;
              let advLname = extraFields.advLname;
              let subStatus = "Legacy request " + MsgText;
              let EmailMesg = advFname + " " + advLname + " has been " + MsgText + " your legacy request";
              let result = { "message": "Legacy request " + MsgText + " successfully" }


              if(!activityLogID && from.hiredAdvisorRefId){
                AdvisorActivityLog.findOne({ hiredAdvisorRefId: from.hiredAdvisorRefId }, { }, async function (err, ActivityLogData) {
                  if (err) {
                    res.status(401).send(resFormat.rError(err))
                  } else {
                    activityLogID = ActivityLogData._id;
                    AdvisorActivityLog.updateOne({ _id: activityLogID }, { $set: { actionTaken: proquery.status } }, function (err, logDetails) {
                      if (err) {
                        res.send(resFormat.rError(err))
                      } else {
                        // If we don't have customer email & name then we will fetch from user table
                        if (!extraFields.custEmail) {
                          User.findOne({ _id: HiredData.customerId }, { firstName: 1, lastName: 1, username: 1 }, function (err, custData) {
                            if (err) {
                              res.status(401).send(resFormat.rError(err))
                            } else {
                              custEmail = custData.username;
                              custName = custData.firstName;
                              stat = sendHireStatusMail(custEmail, custName, EmailMesg, subStatus);
                              res.status(200).send(resFormat.rSuccess(result))
                            }
                          })
                        } else {
                          stat = sendHireStatusMail(custEmail, custName, EmailMesg, subStatus);
                          res.status(200).send(resFormat.rSuccess(result))
                        }
                      }
                    })

                  }
                })
              }
              else if(activityLogID && !from.hiredAdvisorRefId){
                AdvisorActivityLog.updateOne({ _id: activityLogID }, { $set: { actionTaken: proquery.status } }, function (err, logDetails) {
                  if (err) {
                    res.send(resFormat.rError(err))
                  } else {
                    // If we don't have customer email & name then we will fetch from user table
                    if (!extraFields.custEmail) {
                      User.findOne({ _id: HiredData.customerId }, { firstName: 1, lastName: 1, username: 1 }, function (err, custData) {
                        if (err) {
                          res.status(401).send(resFormat.rError(err))
                        } else {
                          custEmail = custData.username;
                          custName = custData.firstName;
                          stat = sendHireStatusMail(custEmail, custName, EmailMesg, subStatus);
                          res.status(200).send(resFormat.rSuccess(result))
                        }
                      })
                    } else {
                      stat = sendHireStatusMail(custEmail, custName, EmailMesg, subStatus);
                      res.status(200).send(resFormat.rSuccess(result))
                    }
                  }
                })
              }
              /*console.log("activityLogID >>>>>>>",activityLogID)
              if (activityLogID) {
                AdvisorActivityLog.updateOne({ _id: activityLogID }, { $set: { actionTaken: proquery.status } }, function (err, logDetails) {
                  if (err) {
                    res.send(resFormat.rError(err))
                  } else {
                    // If we don't have customer email & name then we will fetch from user table
                    if (!extraFields.custEmail) {
                      User.findOne({ _id: HiredData.customerId }, { firstName: 1, lastName: 1, username: 1 }, function (err, custData) {
                        if (err) {
                          res.status(401).send(resFormat.rError(err))
                        } else {
                          custEmail = custData.username;
                          custName = custData.firstName;
                          stat = sendHireStatusMail(custEmail, custName, EmailMesg, subStatus);
                          res.status(200).send(resFormat.rSuccess(result))
                        }
                      })
                    } else {
                      stat = sendHireStatusMail(custEmail, custName, EmailMesg, subStatus);
                      res.status(200).send(resFormat.rSuccess(result))
                    }
                  }
                })
              }*/
              else {
                User.findOne({ _id: proquery.advisorId }, { firstName: 1, lastName: 1, username: 1 }, function (err, advisorUser) {
                  if (err) {
                    res.status(401).send(resFormat.rError(err))
                  } else {
                    let inviteByName = extraFields.inviteByName;
                    let toEmail = advisorUser.username;
                    let advName = advisorUser.firstName;
                    let EmailMesg = inviteByName + " has been update and send you legacy request";
                   // stat = sendHireStatusMail(toEmail, advName, EmailMesg, ''); comment this function as per FS
                  }
                })
                let result = { "message": "Advisor details updated successfully" }
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
    insert.status = proquery.hirestatus;
    insert.createdby = query.customerId;
    insert.modifiedby = query.customerId;
    if(proquery.adminBy){
      insert.adminId = ObjectId(proquery.adminBy);
      insert.createdby = proquery.adminBy;
      insert.modifiedby = proquery.adminBy;
    }
    insert.createdOn = new Date();
    insert.modifiedOn = new Date();
    insert.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        User.findOne({ _id: proquery.advisorId }, { firstName: 1, lastName: 1, username: 1 }, function (err, advisorUser) {
          if (err) {
            res.status(401).send(resFormat.rError(err))
          } else {
            // Add entry in advisor activity log
            let adminData = [];
            if(proquery.adminBy){            
              adminData['adminId'] = proquery.adminBy;
              adminData['adminName'] = extraFields.inviteByName;
            }
            advisorActivityLog.updateActivityLog(query.customerId,proquery.advisorId,'hired',newEntry._id,'',adminData);

            let inviteByName = extraFields.inviteByName;
            let toEmail = advisorUser.username;
            let advName = advisorUser.firstName;
            let EmailMesg = inviteByName + " has been send you legacy request";
            if(proquery.adminBy){            
              let legacyHolderName = extraFields.legacyHolderName;
              let legacyHolderFirstName = extraFields.legacyHolderFirstName;
              let custEmailMsg = inviteByName+" has been hired for your legacy to advisor ("+advisorUser.firstName+" "+advisorUser.lastName+")";
              stat = sendHireStatusMail(extraFields.legacyCustomerEmail,legacyHolderFirstName,custEmailMsg,'');//admin hired advisor email to cusotmer.
              EmailMesg = inviteByName + " has been hired you for "+legacyHolderName+" legacy";
            }
            stat = sendHireStatusMail(toEmail, advName, EmailMesg, '');
          }
        })
        let result = { "message": "Request sent successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function sendHireStatusMail(emailId, toName, comment, subStatus) {
  emailTemplatesRoute.getEmailTemplateByCode("HireAdvisorStatus").then((template) => {
    if (template) {
      template = JSON.parse(JSON.stringify(template));
      let body = template.mailBody.replace("{toName}", toName);
      body = body.replace("{comment}", comment);
      const mailOptions = {
        to: emailId,//'pankajk@arkenea.com',
        subject: subStatus + ' ' + template.mailSubject,
        html: body
      }
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
  HiredAdvisors.countDocuments(query, function (err, listCount) {
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

          // Add entry in advisor activity log
          advisorActivityLog.updateActivityLog(user._id, advisorDetails.advisorId, 'contact');

          let result = { "message": "The advisor's contact details are sent on your email." }
          res.status(200).send(resFormat.rSuccess(result))

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
    let result = { code: "", "message": "" }
    if (found) {
      result = { "RequestData": found, code: "Exist", "message": "Request already Sent" }
    }
    res.status(200).send(resFormat.rSuccess(result))
  }).populate('advisorId');
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

//function to get list of user as per given criteria
function professionalsListing(req, res) {

  let { fields, offset, query, order, limit, search,searchString,extraQuery } = req.body;//console.log("limit >>> ",limit)
  let totalUsers = 0
  // if (search && !isEmpty(query)) {
  //   Object.keys(query).map(function (key, index) {
  //     if (key !== "status") {
  //       query[key] = new RegExp(query[key], 'i')
  //     }
  //   })  
  // }

  if(search && searchString && searchString.trim() != "") {
    const regSearch = new RegExp(searchString , "i")
    query["$or"] = [
        { "firstName": regSearch },
        { "lastName": regSearch },
        { "zipcode": regSearch },        
      ]
      console.log("search",search,"searchString",searchString," query ->",query);
  }

  User.countDocuments(query, function (err, userCount) {
    if (userCount) {
      totalUsers = userCount
    }

    User.find(query, function (err, userList) {
      let contacts = [];
      async.each(userList, function (contact, callback) {
        let newContact = JSON.parse(JSON.stringify(contact))
      }, function (exc) {
        contacts.sort((a, b) => (a.createdOn > b.createdOn) ? -1 : ((b.createdOn > a.createdOn) ? 1 : 0));
        if (err) {
         // res.status(401).send(resFormat.rError(err))
        } else {
          
         // res.send(resFormat.rSuccess({ userList: contacts, totalUsers }))
        }
      }) //end of async

      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        if (totalUsers>0) {
         // console.log("userList >>> ",userList.length,'contacts >>>',contacts.length)
          // let distanceUserList = sortBy(map(userList, (user, index)=>{
          //   var dist = zipcodes.distance('89103',user.zipcode);
          //   let newRow = Object.assign({}, user._doc, {"distance": `${dist}`})
          //   return newRow
          // }), 'distance');   
          User.findOne(extraQuery, { zipcode: 1 }, function (err, zips) {
            if (err) {
              res.status(500).send(resFormat.rError(err))
            } else {
              if (zips && zips.zipcode) {
                let distanceUserList = sortBy(map(userList, (user, index) => {
                  var dist = zipcodes.distance(zips.zipcode, user.zipcode);
                  let newRow = Object.assign({}, user._doc, { "distance": `${dist}` })
                  return newRow
                }), 'distance');
                res.send(resFormat.rSuccess({ distanceUserList, totalUsers }))
              } else {
                let distanceUserList = userList;
                res.send(resFormat.rSuccess({ distanceUserList, totalUsers }))
              }
            }
          })
        }else{         
          distanceUserList = [];
          res.send(resFormat.rSuccess({ distanceUserList, totalUsers }))
        }
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function myPeoplesList(req, res) {
  let { fields, offset, advquery, trustquery, order, limit, search } = req.body;

  let totalRecords = 0
  HiredAdvisors.find(advquery, fields, function (err, advisorList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      trust.find(trustquery, fields, function (err, trustList) {
        if (err) {
          res.status(401).send(resFormat.rError(err))
        } else {

          //console.log("trustList:- ",trustList,"advisorList :- ",advisorList);

          totalTrustRecords = trustList.length;
          totalAdvRecords = advisorList.length;

          let trustListing = map(trustList, (user, index) => {
            var type = "trustee";
            let newRow = Object.assign({}, user._doc, { "type": `${type}` })
            return newRow
          });

          let advisorListing = map(advisorList, (user, index) => {
            var types = "advisor";
            let newRows = Object.assign({}, user._doc, { "type": `${types}` })
            return newRows
          });
          myPeoplesList = trustListing.concat(advisorListing);
          totalPeoplesRecords = myPeoplesList.length;

          myPeoples = myPeoplesList;//sortBy(myPeoplesList, 'modifiedOn');
          res.send(resFormat.rSuccess({ myPeoples, totalPeoplesRecords, trustList, totalTrustRecords, advisorList, totalAdvRecords }))
        }
      }).sort(order).skip(offset).limit(limit).populate('trustId')
    }
  }).sort(order).skip(offset).limit(limit).populate('advisorId');
}


function getAdvisorDetails(req, res) {
  let { query } = req.body;
  HiredAdvisors.findOne(query, {}, function (err, advisorDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.status(200).send(resFormat.rSuccess(advisorDetails));
    }
  })
}

// Function to activate advisoradvisor
async function reactivateReferEarn(req, res) {
  let { query } = req.body;
  let fields = {}
  let { status } = req.body
      
  if( status == 'activate' ) {
    User.findOne(query, fields, async function (err, userList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      }
      else {
        let referEarnSettingsArr = await referEarnSettings.findOne()
        const referEarnTargetCount = Number(referEarnSettingsArr.targetCount)
        const referEarnExtendedDays = Number(referEarnSettingsArr.extendedDays)
        
        var newDt = new Date()
            newDt.setDate(newDt.getDate() + referEarnExtendedDays)
        var params = {  IamIntrested: 'Yes',
                        refereAndEarnSubscriptionDetail: {  endDate: newDt,
                                                            targetCount: referEarnTargetCount,
                                                            noOfDaysExtended: referEarnExtendedDays,
                                                            updatedOn: new Date(),
                                                            status: 'Active'
                                                          }
                      }
        User.update({ _id: userList._id }, { $set: params }, function (err, updatedUser) {
          if (err) {
            res.send(resFormat.rError(err))
          } else {
            let message = resMessage.data( 607, [{key:'{field}',val:'Refer and earn program'},{key:'{status}',val:'extended'}] )
            let result = { userId: updatedUser._id, userType: updatedUser.userType, "message": message}
            res.status(200).send(resFormat.rSuccess(result))
          }
        })
      }
    })
  }
  else{
    res.status(200).send(resFormat.rError('Not allowed.'))
  }
}

// async function exceptHireAdvisorList(req, res) {
//       let { query } = req.body;
//       let fields = {}
//       let { status } = req.body
//     User.aggregate([
//       {
//         $match: {
//           userType: 'advisor',
//         }
//       },
//       {
//         $sort: order
//       },
//       {
//         $lookup:
//           {
//             from: "hired_advisors",
//             localField: "customerId",
//             foreignField: "_id",
//             as: "userInfo"
//           }
//       }
//     ], function (err, logList) {      
//       if (err) {
//         res.status(401).send(resFormat.rError(err))
//       } else {
//         res.send(resFormat.rSuccess({ logList, totalRecords }))
//       }
//     }).sort(order).skip(offset).limit(limit)
// }

router.post("/reactivatereferearn", reactivateReferEarn)
router.post("/activateadvisor", activateAdvisor)
router.post("/rejectadvisor", rejectAdvisor)
router.post("/fileupload", fileupload)
router.post("/contactadvisor", contactAdvisor)
router.post("/recentupdatelist", recentUpdateList)
router.post("/checkHireAdvisor", checkHireAdvisorRequest)
router.post("/hireadvisor", hireAdvisorStatus)
router.post("/hireAdvisorListing", hireAdvisorList)
router.post("/myPeoplesListing", myPeoplesList)
router.post("/professionalsList", professionalsListing)
router.post("/view-details", getAdvisorDetails)
//router.post("/exceptHireAdvisorListing", exceptHireAdvisorList)
module.exports = router
