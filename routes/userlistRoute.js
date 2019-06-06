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
const s3 = require('./../helpers/s3Upload')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

//function to get list of user as per given criteria
function list(req, res) {

  let { fields, offset, query, order, limit, search } = req.body
  let totalUsers = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  //query = {}//status:"Active"

  User.countDocuments(query, function (err, userCount) {
    if (userCount) {
      totalUsers = userCount
    }

    User.find(query, fields, function (err, userList) {
      let contacts = []
      async.each(userList, function (contact, callback) {
        let newContact = JSON.parse(JSON.stringify(contact))

      }, function (exc) {
        contacts.sort((a, b) => (a.createdOn > b.createdOn) ? -1 : ((b.createdOn > a.createdOn) ? 1 : 0));
        res.send(resFormat.rSuccess({ userList: contacts, totalUsers }))
      }) //end of async

      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ userList, totalUsers }))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

//function get details of user from url param
function details(req, res) {
  let { query } = req.body
  let fields = { id: 1, username: 1, salt: 1, fullName: 1, contactNumber: 1, lastLoggedInOn: 1, userType: 1, emailVerified: 1, createdOn: 1, status: 1 }
  if (req.body.fields) {
    fields = req.body.fields
  }
  User.findOne(query, fields, function (err, userList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(userList))
    }
  })
}

//function get details of user from url param
function view(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  User.findOne(query, fields, function (err, userList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(userList))
    }
  })
}

function updateStatus(req, res) {
  let { query } = req.body;
  let fields = { id: 1, username: 1, status: 1 }
  User.findOne(query, fields, function (err, userList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Active';
      if (userList.status == 'Active') { upStatus = 'In-Active'; }
      var params = { status: upStatus }
      User.update({ _id: userList._id }, { $set: params }, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { userId: updatedUser._id, userType: updatedUser.userType, "message": "Status Updated successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function updateProfile(req, res) {
  let {query} = req.body;
  let fields = { id:1, username: 1 , status: 1 }
  User.findOne(query, function(err, updatedUser) {
    if (err) {
     res.status(401).send(resFormat.rError(err))
    } else {      
      let {proquery} = req.body;
      User.update({ _id:updatedUser._id},{$set:proquery},function(err,updated){
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          User.findOne(query, function (err, updatedUser) {
            let result = { "userProfile": { userId: updatedUser._id, userType: updatedUser.userType, firstName: updatedUser.firstName, lastName: updatedUser.lastName, phoneNumber: updatedUser.phoneNumber }, "message": "Profile update successfully!" }
            res.status(200).send(resFormat.rSuccess(result));
          });
        }
      })
    }
  })
}

function updateAdminProfile(req, res) {
  let  query  = {"_id" : req.body._id};
  let fields = { id: 1, username: 1, status: 1 }
  User.findOne(query, function (err, updatedUser) {
    if (err) {
      console.log("before update error",err)
      res.status(401).send(resFormat.rError(err))
    } else {      
      let  proquery  = req.body;
      User.update({ _id: updatedUser._id }, { $set: proquery }, function (err, updated) {
        console.log("after update error",err)
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          User.findOne(query, function (err, updatedUser) {
            let result = { "userProfile": { userId: updatedUser._id, userType: updatedUser.userType, firstName: updatedUser.firstName, lastName: updatedUser.lastName, phoneNumber: updatedUser.phoneNumber }, "message": "Profile update successfully!" }
            res.status(200).send(resFormat.rSuccess(result));
          });
        }
      })
    }
  })
}

function profile(req, res) {
  let { query } = req.body;
  let fields = {}
  User.findOne(query, fields, function (err, userProfile) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      let result = { userProfile, "message": "Get profile details successfully!" }
      res.status(200).send(resFormat.rSuccess(result))
    }
  })
}

function addNewMember(req, res) {
  let newMem = new User()
  newMem.fullName = req.body.fullName
  newMem.firstName = req.body.firstName
  newMem.lastName = req.body.lastName
  newMem.sectionAccess = req.body.sectionAccess
  newMem.userType = 'sysadmin'
  newMem.username = req.body.username
  newMem.status = req.body.status
  if (newMem.status) {
    newMem.status = "Active"
  } else {
    newMem.status = "Inactive"
  }
  newMem.createdOn = new Date()
  var tokens = generateToken(85);
  newMem.token = tokens

  const { username } = req.body;
  User.findOne({ username: username }, { _id :1, username: 1, status:1, userType : 1,profileSetup:1 }, function (err, user) {
    if(user){
      res.send(resFormat.rSuccess({ code: "Exist", message: "Looks like email id already have an account registered with this email as '"+user.userType+"'" }))
    }else{
          newMem.save(function (err, newMemRecord) {
            if (err) {
              console.log(err)
              res.status(500).send(resFormat.rError(err))
            } else {
              let mem = req.body      

              let clientUrl = constants.clientUrl
              var link =  clientUrl + '/llp-admin/reset-password/' + tokens;

              //set new password email template
              emailTemplatesRoute.getEmailTemplateByCode("setNewPassword").then((template) => {
                if(template) {
                  template = JSON.parse(JSON.stringify(template));
                  let body = template.mailBody.replace("{link}", link);
                  body = body.replace("{email_id}",newMem.username);
                  const mailOptions = {
                    to : req.body.username,
                    subject : template.mailSubject,
                    html: body
                  }
                  sendEmail(mailOptions)
                  res.send(resFormat.rSuccess({ code: "Exist", message: 'We have sent you set new password instructions. Please check your email.'}))
                } else {
                  res.status(401).send(resFormat.rError('Some error Occured'))
                }
              }) // set new password email template ends*/
              res.send(resFormat.rSuccess('Member has been addedd'));
            }
          })
      }
    }) //end of user find
}


function common(req, res) {
  const Models = { 'users': User }

  User.findById(req.body.userId, function (err, user) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {

      Models[req.body.rc[0]].find(req.body.query, req.body.fields, function (err, resultData) {
        if (err) {
          res.status(401).send(resFormat.rError(err))
        } else {
          res.send(resFormat.rSuccess(resultData))
        }
      })
    }
  })
}

function generateToken(n) {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var token = '';
  for(var i = 0; i < n; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

router.post("/list", list);
router.post("/addmember", addNewMember);
router.post("/updatestatus", updateStatus);
router.post("/updateprofile", updateProfile);
router.post("/updateadminprofile", updateAdminProfile);
router.post(["/getprofile"], profile);
router.post(["/view"], details);
router.post(["/viewall"], view);
router.post("/common", common);
/*router.get(["/view/:id", "/:id"], details)*/

module.exports = router