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
const OtpCheck = require('./../models/OtpCheck')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const trust = require('./../models/Trustee.js')
const HiredAdvisor = require('./../models/HiredAdvisors')
var zipcodes = require('zipcodes');
const advisorActivityLog = require('./../helpers/advisorActivityLog')
ObjectId = require('mongodb').ObjectID;
const AWS = require('aws-sdk');
const s3 = require('./../helpers/s3Upload')
const stripe = require("stripe")(constants.stripeSecretKey);
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})
const profilePicturesPath = constants.s3Details.profilePicturesPath
const Invite = require('./../models/Invite.js')
var FreeTrailPeriodSetting = require('./../models/FreeTrialPeriodSettings')
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')

//function to check and signin user details
function signin(req, res) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      let result = { "message": err };
      res.status(404).send(resFormat.rError(result));
    }
    else if (user && user.message == "WrongMethod") {
      let message = resMessage.data( 616, [] )
      let result = { "message": message, "invalidEmail": true, "invalidPassword": false }
      res.status(200).send(resFormat.rError(result))
    }
    else if (info && info.message == "User is not Active") {
      let message = resMessage.data( 609, [{key: '{support_email}',val: 'support@legacylifeplans.com'}] )
      let result = { "message": message, "invalidEmail": true, "invalidPassword": false }
      res.status(200).send(resFormat.rError(result))
    }
    else if (info && info.message == "Password is wrong") {
      let message = resMessage.data( 614, [{key: '{field}',val: 'password'}] )
      let result = { "message": message, "invalidEmail": false, "invalidPassword": true }
      res.status(200).send(resFormat.rError(result))
    }
    else if (info && info.message == "User not found") {
      let message = resMessage.data( 615, [] )
      let result = { "message": message, "invalidEmail": true, "invalidPassword": false }
      res.status(200).send(resFormat.rError(result))
    }
    else if (user) {     
        var token = user.generateJwt()
        var params = { lastLoggedInOn: new Date(), loginCount: user.loginCount == undefined ? 1 : user.loginCount + 1 }
        User.updateOne({ _id: user._id }, { $set: params }, function (err, updatedUser) {
          if (err) {
            res.send(resFormat.rError(err))
          }
          else {
            let subscriptionDetails = user.subscriptionDetails ? user.subscriptionDetails : null
            let subscriptionStartDate = "",
            subscriptionEndDate = "",
            subscriptionStatus = "",
            autoRenewal = "",
            
            addOnGiven = 'no',
            isReferAndEarn = user.IamIntrested && user.IamIntrested == 'Yes' ? 'Yes' :  'No'
            
            if( subscriptionDetails != null && subscriptionDetails.length >0 ) {
              isReferAndEarn = 'No'
              subscriptionStartDate = subscriptionDetails[(subscriptionDetails.length-1)]['startDate']
              subscriptionEndDate = subscriptionDetails[(subscriptionDetails.length-1)]['endDate']
              subscriptionStatus = subscriptionDetails[(subscriptionDetails.length-1)]['status']
              autoRenewal = subscriptionDetails[(subscriptionDetails.length-1)]['autoRenewal'] ? subscriptionDetails[(subscriptionDetails.length-1)]['autoRenewal'] : false
              //if subscription ends do not sends addon details
              if( new Date(subscriptionEndDate) > new Date() ) {
                addOnGiven = subscriptionDetails[(subscriptionDetails.length-1)]['addOnDetails'] && subscriptionDetails[(subscriptionDetails.length-1)]['addOnDetails']['status'] == 'paid' ? 'yes' : 'no'
              }
            }
            
            //Update activity logs
            allActivityLog.updateActivityLogs(user._id, user._id,'Login', user.userType+' has been logged in successfully.')

            let result = { token, userId: user._id, userType: user.userType, firstName: user.firstName, lastName: user.lastName, sectionAccess: user.sectionAccess, profilePicture : user.profilePicture, "message": "Successfully logged in!", "invalidEmail": false, "invalidPassword": false, "createdOn": user.createdOn, "subscriptionStartDate": subscriptionStartDate, "subscriptionEndDate" : subscriptionEndDate, "subscriptionStatus" : subscriptionStatus, "autoRenewalStatus": autoRenewal, "addOnGiven": addOnGiven, "isReferAndEarn": isReferAndEarn,deceased:user.deceased,lockoutLegacyDate:user.lockoutLegacyDate }
            res.status(200).send(resFormat.rSuccess(result))
          }
        })
    } else {
      let message = resMessage.data( 618, [] )
      let result = { "message": message, "invalidEmail": false, "invalidPassword": true }
      res.status(200).send(resFormat.rError(result))
    }
  })(req, res)

}

//function to create or register new user
function create(req, res) {
  var user = new User()
  user.username = req.body.username
  user.userType = getuserType = req.body.userType ? req.body.userType : "sysadmin"
  user.lastLoggedInOn = new Date();
  if (req.body.state == '' || req.body.fullName == '' || req.body.lastName == '') {
    let message = resMessage.data( 619, [] )
    res.status(500).send(resFormat.rError(message))
  }
  User.find({ username: req.body.username }, { userType: getuserType }, function (err, result) {
    user.businessPhoneNumber = req.body.businessPhoneNumber;
    user.dateOfBirth = req.body.dateOfBirth;
    user.state = req.body.state;
    user.city = req.body.city;
    user.zipcode = req.body.zipcode;
    user.emailVerified = true;
    user.lockoutLegacyPeriod = '2';
    user.status = 'Active';
    user.createdOn = new Date();
    if (err) {
      res.status(500).send(resFormat.rError(err))
    } else if (result && result.length == 0) {
      user.save(function (err, newUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          const { _id, userType, username, firstName, lastName, zipcode } = user
          //Update activity logs
          allActivityLog.updateActivityLogs(_id, _id, 'Login', userType+' has been logged in successfully.')
        
          //Update latitude longitude
          if(newUszipcode && _id){
            calculateZipcode(zipcode,_id);
          }
          let message = resMessage.data( 621, [] )
          let result = { userId: _id, userType, username, firstName, lastName, "message": message }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
    else {  
      user.updateOne({ _id: result._id }, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          const { _id, userType, username, firstName, lastName } = user
          //Update activity logs
          allActivityLog.updateActivityLogs(_id, _id, 'Login', user.userType+' has been logged in successfully.')

          //Update latitude longitude
          if(result.zipcode && result._id){
            calculateZipcode(result.zipcode,result._id);
          }

          let message = resMessage.data( 622, [] )
          let result = { userId: _id, userType, username, firstName, lastName, "message": message }
          res.send(resFormat.rSuccess(result))
        }
      });
    }
  });
}

async function calculateZipcode(zipcode,id){
  var data = zipcodes.lookup(zipcode);
  if( data ) {
    if(data.latitude && data.longitude){
      // const location = {'latitude':data.latitude,'longitude':data.longitude};
      // let userData = await User.updateOne({_id:id},{$set:{location:location}});
      console.log('Authentication calculateZipcode')
      let userData = await User.updateOne({_id:id},{$set:{location:{latitude:data.latitude,longitude:data.longitude}}});
    }
  }
}

router.post('/updateProfilePic', function (req, res) {
  AWS.config.update({ accessKeyId: constants.s3Details.awsKey, secretAccessKey: constants.s3Details.awsSecret });
  const ss3 = new AWS.S3();
  let {proquery} = req.body;
  let {query} = req.body;
  const options = { "partSize": 10 * 1024 * 1024, "queueSize": 1 };
  var ext = proquery.profilePicture.split(';')[0].split('/')[1];
  var filename = query._id + '-' + new Date().getTime() + `.${ext}`;

  var fileBuffer = new Buffer(proquery.profilePicture.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  var abc = fileBuffer.toString('base64');
  const val = Buffer.from(abc, 'base64');
/******************************upload cropped image*********************************************************************** */
const params = {
  Bucket: constants.s3Details.bucketName,
  "Key": `${profilePicturesPath}${filename}`,
  "ContentEncoding": 'base64',
  "Body": fileBuffer,
  "ACL": "public-read-write",
  "ContentType": `image/${ext}`
};
ss3.upload(params, options, (err, data) => {
  if(err){
    res.send(resFormat.rError("Something went wrong "))
  }else{
      User.updateOne({ _id: query._id }, { $set: { profilePicture: filename } }, function (err, updatedUser) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        let message = resMessage.data( 607, [{key: '{field}',val: 'Profile picture'}, {key: '{status}',val: 'updated'}] )
        //Update activity logs
        allActivityLog.updateActivityLogs(query._id, query._id, 'Profile', message)
        res.send(resFormat.rSuccess({ message: message, profilePicture: profilePicturesPath+filename}))
      }
    })
  }
 })
})

//function to update user details // NOT in use
function update(req, res) {
  if (req.body.username) {
    User.find({ _id: { $ne: req.body._id }, username: req.body.username }, function (err, exUsers) {
      if (exUsers && exUsers.length > 0) {
        res.send(resFormat.rError("This email id is already taken by another user."))
      } else {
        User.updateOne({ _id: req.body._id }, { $set: req.body }, function (err, updatedUser) {
          if (err) {
            res.send(resFormat.rError(err))
          } else {
            let message = resMessage.data( 607, [{key: '{field}',val: 'Account'}, {key: '{status}',val: 'updated'}] )
            //Update activity logs
            allActivityLog.updateActivityLogs(req.body._id, req.body._id, 'Account', message)
            
            res.send(resFormat.rSuccess(message))
          }
        })
      }
    })

  } else {
    User.updateOne({ _id: req.body._id }, { $set: req.body }, function (err, updatedUser) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        let message = resMessage.data( 607, [{key: '{field}',val: 'Account details'}, {key: '{status}',val: 'updated'}] )
        //Update activity logs
        allActivityLog.updateActivityLogs(req.body._id, req.body._id, 'Account', message)
        res.send(resFormat.rSuccess(message))
      }
    })
  }
}

//function to update customer details 
function custProfileUpdate(req, res) {
  let {query} = req.body;
  if (query._id) {    
    User.findOne(query, function(err, updatedUser) {
      if (err) {
        let message = resMessage.data( 603, [] )
        let result = { "message": message }
        res.send(resFormat.rError(result));
      }
      else {
        let {proquery} = req.body;
        let {from} = req.body;
        User.updateOne({_id: updatedUser._id}, { $set: proquery }, function (err, updatedDetails) {
          if (err) {
            res.send(resFormat.rError(err))
          } else {
            let message = resMessage.data( 607, [{key: '{field}',val: 'User '+from.fromname}, {key: '{status}',val: 'updated'}] )
            
            //Update activity logs
            allActivityLog.updateActivityLogs(updatedUser._id, updatedUser._id, 'Profile', message)

            //Update latitude longitude
            if(updatedUser.zipcode && updatedUser._id){
              calculateZipcode(updatedUser.zipcode,updatedUser._id);
            }

            let result = { "message": message }
            res.status(200).send(resFormat.rSuccess(result))        
          }
        })
      }
    })
  }
  else{
    let result = { "message": "You have logout! Please signin again." }
    res.send(resFormat.rError(result));
  } 
}

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
  User.count(query, function (err, userCount) {
    if (userCount) {
      totalUsers = userCount
    }
    User.find(query, fields, function (err, userList) {
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
  let fields = { id: 1, username: 1, socialMediaToken: 1, salt: 1, fullName: 1, profileSetup:1, status :1, userType :1, sectionAccess :1,profilePicture :1 }
  if (req.body.fields) {
    fields = req.body.fields
  }
  User.findOne({ _id: req.body.userId }, fields, function (err, user) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(user))
    }
  })
}

//function to change users password
const changePassword = function (req, res) {
  User.findOne({ _id: req.body.userId }, function (err, userDetails) {
    if (err) {
      res.send(resFormat.rError(err))
    }
    else {
      const user = new User()
      if (req.body.password && !user.validPassword(req.body.password, userDetails)) {
        let message = resMessage.data( 627, [{key: '{field}',val: 'current password'}] )
        res.send(resFormat.rError(message))
      }
      else {
        const { salt, hash } = user.setPassword(req.body.newPassword);
        User.updateOne({ _id: req.body.userId }, { $set: { salt, hash } }, (err, updatedUser) => {
          if (err) {
            res.send({ "message": resFormat.rError(err) })
          } else {
            let message = resMessage.data( 607, [{key: '{field}',val: 'Password'}, {key: '{status}',val: 'updated'}] )
            
            //Update activity logs
            allActivityLog.updateActivityLogs(req.body.userId, req.body.userId, 'Password', message)
            let result = { "message": message }
            res.status(200).send(resFormat.rSuccess(result))
          }
        })
      }
    }
  })
}

// function to change users Email Id
const changeEmail = function (req, res) {
  User.findOne({ _id: req.body._id }, function (err, userDetails) {
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      const user = new User()
      if (req.body.password && !user.validPassword(req.body.password, userDetails)) {
        res.send(resFormat.rError('Current Password is incorrect'))
      } else {
        let set = { username: req.body.username }
        User.updateOne({ _id: req.body._id }, { $set: set }, { runValidators: true, context: 'query' }, (err, updateUser) => {
          if (err) {
            if (err.name == "ValidationError") {
              let message = resMessage.data( 624, [] )
              res.send(resFormat.rError(message))
            } else {
              res.send(resFormat.rError(err))
            }
          } else {
            let message = resMessage.data( 607, [{key: '{field}',val: 'Email ID'}, {key: '{status}',val: 'updated'}] )
            //Update activity logs
            allActivityLog.updateActivityLogs(req.body._id, req.body._id, 'Email', message)
            res.send(resFormat.rSuccess(message))
          }
        })
      }
    }
  })
}

//function to reset the password
const resetPassword = function (req, res) {
  if (req.body.token) {
    User.findOne({ token: req.body.token }, function (err, userDetails) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        const user = new User()
        const { salt, hash } = user.setPassword(req.body.password)
        User.updateOne({ _id: userDetails._id }, { $set: { salt, hash, "token": "" }, }, (err, updatedUser) => {
          if (err) {
            res.send(resFormat.rError(err))
          } else {
            //let msg = {username : userDetails.username, msg : 'Your password is updated'}
            let message = resMessage.data( 607, [{key: '{field}',val: 'Password'}, {key: '{status}',val: 'updated'}] )
            //Update activity logs
            allActivityLog.updateActivityLogs(userDetails._id, userDetails._id, 'Reset Password', message)
            let response = {username : userDetails.username, msg : message}
            res.send(resFormat.rSuccess(response))
          }
        })
      }
    })
  }
  else {
    res.send(resFormat.rError("Invalid Link"))
  }
}

//function to generate reset password link for user
function forgotPassword(req, res) {
  //find user based on email id

  User.findOne({ "username": req.body.username }, {}, function (err, user) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    }
    else if (!user) {
      res.send(resFormat.rError({message: "Looks like your account does not exist. Sign up to create an account."}))
    }
    else if (user && user.status == 'Active' && !user.salt) {
      let message = resMessage.data( 616, [] )
      res.send(resFormat.rError({message: message}))
    }
    else if (user && user.status == 'Inactive') {
      let message = resMessage.data( 609, [{key: '{support_email}',val: 'support@legacylifeplans.com'}] )
      res.send(resFormat.rError({message: message}))
    }
    else if (user && user.status == 'Pending') {
      let message = resMessage.data( 699, [{key: '{message}',val: 'You can not use this service as your account is under review.'}] )
      res.send(resFormat.rError({message: message}))
    }
    else {
      var tokens = generateToken(85);
      var date = new Date()
      user.resetPasswordExpiry = date.setHours(date.getHours() + 48)
      user.token = tokens
      //update password reset expiry date for user
      user.save(function (err, newUser) {
        if (err) {
          res.status(500).send(resFormat.rError(err))
        }
        let clientUrl = constants.clientUrl;
        var link = "";
        if (req.body.userType == 'sysadmin') {
          link = clientUrl + '/llp-admin/reset-password/' + tokens;
        }
        else {
          link = clientUrl + '/reset-password/' + tokens;
        }

        //forgot password email template
        emailTemplatesRoute.getEmailTemplateByCode("ForgotPassword").then((template) => {
          if (template) {
            template = JSON.parse(JSON.stringify(template));
            let body = template.mailBody.replace("{link}", link);
            const mailOptions = {
              to: req.body.username,
              subject: template.mailSubject,
              html: body
            }
            sendEmail(mailOptions)
            let message = resMessage.data( 616, [] )
            res.send(resFormat.rSuccess(message))
          } else {
            res.status(401).send(resFormat.rError('Some error Occured'))
          }
        }) // forgot password email template ends*/

      }) // update password reset expiry date for user ends
    }
  }) // find user based on email id ends
}

function s3Upload(params, options, userId) {
  s3.upload(params, options, (err, data) => {
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      User.updateOne({ _id: userId }, { $set: { profilePicture: filename } }, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let message = resMessage.data( 607, [{key: '{field}',val: 'Account details'}, {key: '{status}',val: 'updated'}] )
          res.send(resFormat.rSuccess(message))
        }
      })// user update ends
    } // else loop ends
  }) //s3 upload ends
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

router.post('/reset-password-token', function (req, res) {
  User.findOne({ token: req.body.userId }, function (err, userDetails) {
    if (userDetails) {
      if(userDetails.userType)// == 'advisor'
        res.send(resFormat.rSuccess({ code: "success", userId: userDetails, username : userDetails.username }))
      else
        res.send(resFormat.rSuccess('Success')) 
    } else {
      let message = resMessage.data( 628, [] )
      res.send(resFormat.rError(message))
    }
  })
})

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

//function to check if email present for any user
async function checkEmail(req, res) {
  try {
    const { username } = req.body;
    User.findOne({ username: {'$regex' : new RegExp(escapeRegExp(username)), '$options' : 'i'} }, { _id :1, username: 1, status:1, userType : 1,profileSetup:1 }, async function (err, user) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        if (user && user.status == 'Inactive') {
          let message = resMessage.data( 609, [{key: '{support_email}',val: 'support@legacylifeplans.com'}] )
          res.send(resFormat.rSuccess({ code: "Exist", message: message }))
        }
        else if (user && user.status == 'Active') {
          res.send(resFormat.rSuccess({ code: "Exist", message: "Looks like you already have an account registered with this email. Log in to access." }))
        }
        else if (user && user.status == 'Pending') {
          let message = resMessage.data( 608, [] )
          res.send(resFormat.rSuccess({ code: "Exist", message: message }))
        }
        else if (user && user.status == 'Rejected') {
          let message = resMessage.data( 610, [{key: '{support_email}',val: 'support@legacylifeplans.com'}] )
          res.send(resFormat.rSuccess({ code: "ExistReject", message: message}))
        }
        else {
          /**
           * Check invite link is valid or not if user registration using invite link
           */
          let { inviteCode } = req.body
          let userInvitedBy = ''
          if(inviteCode) {            
            let invitesCodeExists = await Invite.find({ inviteCode: inviteCode, email:username, inviteType: req.body.userType }, function (err, data, index) {});
            userInvitedBy = invitesCodeExists.invitedBy
            if( invitesCodeExists.length < 1 ) {
              let message = resMessage.data( 627, [{key: '{field}',val: 'Email / Invite Link'}] )
              res.send(resFormat.rSuccess({ code: "InviteReject", message: message }))
            }
          }

          OtpCheck.findOne({ "username": { $regex: new RegExp("^" + username.toLowerCase(), "i") } }, { username: 1 }, function (err, found) {
            if (err) {
              res.status(401).send(resFormat.rError(err))
            } else {
              var otp = generateOtp(6);
              if (found) {
                let ustatus = 'Active'
                if(req.body.userType == 'advisor'){
                  ustatus = 'pending'
                }
                
                OtpCheck.updateOne({ _id: found._id }, { $set: { otpCode: otp, status: ustatus } }, function (err, updatedUser) {
                  if (err) {
                    res.send(resFormat.rError(err))
                  } else {
                    stat = sendOtpMail(req.body.username, otp);
                    let message = resMessage.data( 629, [] )
                    res.send(resFormat.rSuccess({ code: "success", message: message, invitedBy: userInvitedBy }))                    
                  }
                })
              } else if(req.body.username){
                let OtpC = new OtpCheck();
                OtpC.username = req.body.username;
                if(req.body.password!=''){
                OtpC.password = req.body.password;
                }
                OtpC.otpCode = otp;
                if(req.body.userType != 'advisor')
                  OtpC.status = 'Active';
                else 
                  OtpC.status = 'Pending';

                OtpC.userType = req.body.userType;
                OtpC.save(function (err, newUser) {
                  if (err) {
                    res.status(500).send(resFormat.rError(err));
                  } else {
                    stat = sendOtpMail(req.body.username, otp);
                    let message = resMessage.data( 616, [] )
                    res.send(resFormat.rSuccess({ code: "success", message: message, invitedBy: userInvitedBy }))
                  }
                }) //update password reset expiry date for user ends          
              }
            }
          });// res.send(resFormat.rSuccess({ code: "NewUser", message: "User not found in database." }))         
        }
      } // end of else of user
    }) //end of user find
  } catch (e) {
    res.status(401).send(resFormat.rError(e.message))
  }
}

async function checkUserOtp(req, res) {
  try {
    //let { query } = req.body;
    let query = {username: req.body.query.username, otpCode:req.body.query.otpCode}
    OtpCheck.findOne(query, async function (err, otpdata) {
      if (err) {
        res.send(resFormat.rSuccess({ code: "error", message: "Invalid OTP" }))
      } else {
        if (otpdata) {
          let freeTrialPeriodDetails = await FreeTrailPeriodSetting.findOne()
          let freeTrailPeriodObj = {
            bfrSubFreePremiumDays : otpdata.userType == 'advisor' ? Number(freeTrialPeriodDetails.advisorFreeDays) : Number(freeTrialPeriodDetails.customerFreeAccessDays),
            aftrSubFreeDays : otpdata.userType == 'advisor' ? 0 : Number(freeTrialPeriodDetails.customerAftrFreeAccessDays),
            status : otpdata.userType == 'advisor' ? freeTrialPeriodDetails.advisorStatus : freeTrialPeriodDetails.customerStatus,
          }

          var user = new User()
          user.username = otpdata.username
          user.userType = otpdata.userType
          user.status = otpdata.status
          user.lastLoggedInOn = new Date();
          user.emailVerified = true;
          user.invitedBy = req.body.query.invitedBy
          user.freeTrialPeriod = freeTrailPeriodObj
          user.createdOn = new Date();
          if(user.userType != 'advisor'){
            let userSecurityDetails = user.setPassword(otpdata.password)
            user.salt = userSecurityDetails.salt;
            user.hash = userSecurityDetails.hash;
          }
          else {
            user.sponsoredAdvisor = 'no';
          }
          user.save(function (err, newUser) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let data = {
                "userId": newUser._id,
                "username": newUser.username,
                "userType": newUser.userType
              }
              checkTrustee(newUser.userType,newUser._id,newUser.username)
              OtpCheck.deleteOne({ "_id": otpdata._id }, function (err, otpdata) {
                if (err) {
                  res.send(resFormat.rSuccess({ code: "error", message: "Invalid OTP" }))
                } else {
                  let message = "";
                  if(newUser.userType == 'customer')
                    message = resMessage.data( 630, [] )
                    //message = "Welcome to Legacy Life Plans. Your account credentials are successfully saved.";
                  else
                    message = resMessage.data( 631, [] )
                    //message = "You have successfully signup. Please update your profile."; 
                    let subscriptionDetails   = newUser.subscriptionDetails ? newUser.subscriptionDetails : null
                    let subscriptionStartDate = "",
                    subscriptionEndDate       = "",
                    subscriptionStatus        = "",
                    autoRenewal               = "";
                    if( subscriptionDetails != null && subscriptionDetails.length >0 ) {
                      subscriptionStartDate = subscriptionDetails[(subscriptionDetails.length-1)]['startDate']
                      subscriptionEndDate   = subscriptionDetails[(subscriptionDetails.length-1)]['endDate']
                      subscriptionStatus    = subscriptionDetails[(subscriptionDetails.length-1)]['status']
                      autoRenewal           = subscriptionDetails[(subscriptionDetails.length-1)]['autoRenewal'] ? subscriptionDetails[(subscriptionDetails.length-1)]['autoRenewal'] : false
                    }
                    let addOnDetails= user.addOnDetails ? user.addOnDetails : null
                    let addOnGiven  = 'no'
                    if( addOnDetails != null && addOnDetails.length >0 ) {
                      addOnGiven = addOnDetails[(addOnDetails.length-1)]['status'] && addOnDetails[(addOnDetails.length-1)]['status'] == 'paid' ? 'yes' : 'no'
                    }
                  res.send(resFormat.rSuccess({ "userId":newUser._id, "profilePicture": newUser.profilePicture, "username": newUser.username, "userType": newUser.userType, code: "success", message: message,"createdOn": user.createdOn, "subscriptionStartDate": subscriptionStartDate, "subscriptionEndDate" : subscriptionEndDate, "subscriptionStatus" : subscriptionStatus, "autoRenewalStatus": autoRenewal, "addOnGiven": addOnGiven }))
                }
              })
            }
          })
        } else {
          res.send(resFormat.rSuccess({ code: "error", message: "Invalid OTP" }))
        }
      }
    })
  } catch (e) {
    res.status(401).send(resFormat.rError(e.message))
  }
}

async function checkTrustee(userType,trustId,emailId) {console.log('userType',userType,'trustId',trustId,'emailId',emailId)
  let status = "";
  await trust.findOne({email:emailId}, async function (err, trustDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      if(trustDetails && trustDetails._id){ 
        status ='Pending';   
        if(userType == 'customer'){
          status = 'Active';
        }else{
          status = 'Deleted';
          let FoundAdvDetails = await HiredAdvisor.findOne({ _id: trustId });         
              if(FoundAdvDetails==null){              
                  var insert = new HiredAdvisor();
                  insert.customerId = trustDetails.customerId;
                  insert.selectAll = trustDetails.selectAll;
                  insert.userAccess = trustDetails.userAccess;
                  insert.filesCount = trustDetails.filesCount;
                  insert.folderCount = trustDetails.folderCount;
                  insert.advisorId = ObjectId(trustId);
                  insert.status = 'Pending';
                  insert.createdby = trustDetails.customerId;
                  insert.modifiedby = trustDetails.customerId;
                  insert.createdOn = new Date();
                  insert.modifiedOn = new Date();
                  let newEntry = await insert.save();
                  await advisorActivityLog.updateActivityLog(trustDetails.customerId,trustId,'hired',newEntry._id,'','');

                  let message = resMessage.data( 607, [{key:'{field}',val:'Hire advisor request'},{key:'{status}',val:'sent'}] )
                  await allActivityLog.updateActivityLogs( trustDetails.customerId, trustId, "Hire Advisor Request", message, 'Professionals List', '' )
              }        
        }
        let updatedDetails = await trust.updateOne({ _id: trustDetails._id }, { status:status,trustId:ObjectId(trustId),modifiedOn:new Date()});
        return 'done';
      }
    }
   });  
}

function sendOtpMail(emailId, otpN) {
  emailTemplatesRoute.getEmailTemplateByCode("SignupOTP").then((template) => {
    if (template) {
      template = JSON.parse(JSON.stringify(template));
      let body = template.mailBody.replace("{OTP}", otpN);
      body = body.replace("{emailId}", emailId);
      const mailOptions = {
        to: emailId,//'pankajk@arkenea.com',
        subject: template.mailSubject,
        html: body
      }
      sendEmail(mailOptions)
    } else {
      let message = resMessage.data( 604, [] )
      res.status(401).send(resFormat.rError(message));
      return false;
    }
  })
}

function generateToken(n) {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var token = '';
  for (var i = 0; i < n; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

function generateOtp(n) {
  var chars = '0123456789';
  var token = '';
  for (var i = 0; i < n; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

async function advdocuments(req, res) {
  console.log("Auth",req);
  try {
    let { query } = req.body;
   
  } catch (e) {
    res.status(401).send(resFormat.rError(e.message))
  }
}

function getProductDetails(req, res) {
  stripe.plans.list( { limit: 3 }, function(err, plans) {
    // asynchronously called
    res.status(200).send(resFormat.rSuccess( {plans, "message": "Subscription Plans"}))    
  });
}

router.post(["/signup", "/register"], create)
router.post("/signin", signin)
router.post("/cust-profile-update", custProfileUpdate)
router.post("/list", list)
router.get(["/view/:id", "/:id"], details)
router.post(["/view"], details)
router.post('/resetPassword', resetPassword)
router.post("/changePassword", changePassword)
router.post("/forgotPassword", forgotPassword)
router.post("/changeEmail", changeEmail)
router.post("/common", common)
router.post("/checkEmail", checkEmail)
router.post("/checkOtp", checkUserOtp)
router.post("/advdocuments", advdocuments)
router.post(["/getproductdetails"], getProductDetails);

module.exports = router