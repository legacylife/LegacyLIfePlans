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
const AWS = require('aws-sdk');
const s3 = require('./../helpers/s3Upload')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})
const profilePicturesPath = constants.s3Details.profilePicturesPath

//function to check and signin user details
function signin(req, res) {
  
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      let result = { "message": err };
      res.status(404).send(resFormat.rError(result));
    } else if (user && user.message == "WrongMethod") {
      let result = { "message": "We have sent you the instructions to set your account password. Please check your mail.", "invalidEmail": true, "invalidPassword": false }
      res.status(200).send(resFormat.rError(result))
    } else if (info && info.message == "User is not Active") {
      let result = { "message": "Your account has been deactivated. Please connect with the admin at support@legacylifeplans.com for any queries.", "invalidEmail": true, "invalidPassword": false }
      res.status(200).send(resFormat.rError(result))
    }
    else if (info && info.message == "Password is wrong") {
      let result = { "message": "Incorrect password. Please try again.", "invalidEmail": false, "invalidPassword": true }
      res.status(200).send(resFormat.rError(result))
    }
    else if (info && info.message == "User not found") {
      let result = { "message": "Incorrect email or password. Please try again.", "invalidEmail": true, "invalidPassword": false }
      res.status(200).send(resFormat.rError(result))
    } else if (user) {     
        var token = user.generateJwt()
        var params = { lastLoggedInOn: new Date(), loginCount: user.loginCount == undefined ? 1 : user.loginCount + 1 }
        User.updateOne({ _id: user._id }, { $set: params }, function (err, updatedUser) {
          if (err) {
            res.send(resFormat.rError(err))
          } else {
            console.log("type ",user.userType);
            let result = { token, userId: user._id, userType: user.userType, firstName: user.firstName, lastName: user.lastName, sectionAccess: user.sectionAccess, profilePicture : user.profilePicture, "message": "Successfully logged in!", "invalidEmail": false, "invalidPassword": false }
            res.status(200).send(resFormat.rSuccess(result))
          }
        })
    } else {
      let result = { "message": "Invalid login credentials.", "invalidEmail": false, "invalidPassword": true }
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
    res.status(500).send(resFormat.rError("Please fill all required details."))
  }
  User.find({ username: req.body.username }, { userType: getuserType }, function (err, result) {
    user.businessPhoneNumber = req.body.businessPhoneNumber;
    user.dateOfBirth = req.body.dateOfBirth;
    user.state = req.body.state;
    user.city = req.body.city;
    user.zipcode = req.body.zipcode;
    user.emailVerified = true;
    user.status = 'Active';
    user.createdOn = new Date();
    if (err) {
      res.status(500).send(resFormat.rError(err))
    } else if (result && result.length == 0) {
      user.save(function (err, newUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          const { _id, userType, username, firstName, lastName } = user
          let result = { userId: _id, userType, username, firstName, lastName, "message": "Successfully logged in!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    } else {
      //var params = {lastLoggedInOn: new Date(), loginCount: user.loginCount == undefined ? 1 : user.loginCount + 1}
      //,{ $set: params}
      user.updateOne({ _id: result._id }, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          console.log("updatedUser " + updatedUser);
          const { _id, userType, username, firstName, lastName } = user
          let result = { userId: _id, userType, username, firstName, lastName, "message": "Email verification successful. Logging in to your account" }
          res.send(resFormat.rSuccess(result))
        }
      }); //res.send(resFormat.rError(`You are already registered as ${result[0].userType}` ))
    }
  });
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
    console.log(query._id, filename)
      User.updateOne({ _id: query._id }, { $set: { profilePicture: filename } }, function (err, updatedUser) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {                     
        res.send(resFormat.rSuccess({ message: 'Profile picture updated successfully', profilePicture: profilePicturesPath+filename}))
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
            res.send(resFormat.rSuccess('Account details successfully updated'))
          }
        })
      }
    })

  } else {
    User.updateOne({ _id: req.body._id }, { $set: req.body }, function (err, updatedUser) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess('Account details successfully updated'))
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
         let result = { "message": "Something Wrong! Please signin again." }
         res.send(resFormat.rError(result));
       } else {
     let {proquery} = req.body;
     let {from} = req.body;
     User.updateOne({_id: updatedUser._id}, { $set: proquery }, function (err, updatedDetails) {
       if (err) {
         res.send(resFormat.rError(err))
       } else {
         let result = { "message": "User "+from.fromname+"  have been updated successfully!" }
         res.status(200).send(resFormat.rSuccess(result))        
       }
     })
     }
    })
  }else{
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
    } else {
      const user = new User()
      if (req.body.password && !user.validPassword(req.body.password, userDetails)) {
        res.send(resFormat.rError('Please enter the valid current password'))
      } else {
        const { salt, hash } = user.setPassword(req.body.newPassword);
        User.updateOne({ _id: req.body.userId }, { $set: { salt, hash } }, (err, updatedUser) => {
          if (err) {
            res.send({ "message": resFormat.rError(err) })
          } else {
            let result = { "message": "Your password is updated" }
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
              res.send(resFormat.rError("Looks like you already have an account registered with this email. Please log in to access your account."))
            } else {
              res.send(resFormat.rError(err))
            }
          } else {
            res.send(resFormat.rSuccess('Email ID has been updated'))
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
            res.send(resFormat.rSuccess('Your password is updated'))
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
    console.log("asdadsd",user)
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else if (!user) {
      res.send(resFormat.rError({message: "Looks like your account does not exist. Sign up to create an account."}))
    } else if (user && user.status == 'Active' && !user.salt) {
      res.send(resFormat.rError({message: "We have sent you the instructions to set your account password. Please check your mail."}))
    } else if (user && user.status == 'Inactive') {
      res.send(resFormat.rError({message: "Your account is inactive."}))
    } else if (user && user.status == 'Pending') {
      res.send(resFormat.rError({message:"You can not use this service as your account is under review."}))
    } else {
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
            res.send(resFormat.rSuccess('We have sent you reset instructions. Please check your email.'))
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
      console.log(data)
      User.updateOne({ _id: userId }, { $set: { profilePicture: filename } }, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          res.send(resFormat.rSuccess('Account details successfully updated'))
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
      if(userDetails.userType == 'advisor')
        res.send(resFormat.rSuccess({ code: "success", userId: userDetails, username : userDetails.username }))
      else
        res.send(resFormat.rSuccess('Success')) 
    } else {
      var errMsg = 'Invalid link, Please try again.'
      res.send(resFormat.rError(errMsg))
    }
  })
})

//function to check if email present for any user
async function checkEmail(req, res) {
  try {
    const { username } = req.body;
    User.findOne({ username: username }, { _id :1, username: 1, status:1, userType : 1,profileSetup:1 }, function (err, user) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        if (user && user.status == 'Inactive') {
          res.send(resFormat.rSuccess({ code: "Exist", message: "Your account is inactive. Please connect with the admin at support@legacylifeplans.com for any queries." }))
        }
        else if (user && user.status == 'Active') {
          res.send(resFormat.rSuccess({ code: "Exist", message: "Looks like you already have an account registered with this email. Log in to access." }))
        }
        else if (user && user.status == 'Pending') {
          res.send(resFormat.rSuccess({ code: "Exist", message: "Your account is under review, you will receive the account confirmation email on your registered email id." }))
        }
        else {
          OtpCheck.findOne({ username: username }, { username: 1 }, function (err, found) {
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
                    res.send(resFormat.rSuccess({ code: "success", message: 'A new OTP is sent on your email.' }))                    
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
                    res.send(resFormat.rSuccess({ code: "success", message: 'We have sent you reset instructions. Please check your email.' }))
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
    let { query } = req.body;
    OtpCheck.findOne(query, function (err, otpdata) {
      console.log(err)
      if (err) {
        res.send(resFormat.rSuccess({ code: "error", message: "Invalid OTP" }))
      } else {
        if (otpdata) {

          var user = new User()
          user.username = otpdata.username
          user.userType = otpdata.userType
          user.status = otpdata.status
          user.lastLoggedInOn = new Date();

          user.emailVerified = true;
          user.createdOn = new Date();

          if(user.userType != 'advisor'){
            let userSecurityDetails = user.setPassword(otpdata.password)
            user.salt = userSecurityDetails.salt;
            user.hash = userSecurityDetails.hash;
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
              OtpCheck.deleteOne({ "_id": otpdata._id }, function (err, otpdata) {
                console.log(err)
                if (err) {
                  res.send(resFormat.rSuccess({ code: "error", message: "Invalid OTP" }))
                } else {
                  let message = "";
                  if(newUser.userType == 'customer')
                    message = "Welcome to Legacy Life Plans. Your account credentials are successfully saved.";
                  else
                    message = "You have successfully signup. Please update your profile."; 
                  res.send(resFormat.rSuccess({ "userId":newUser._id, "profilePicture": newUser.profilePicture, "username": newUser.username, "userType": newUser.userType, code: "success", message: message }))
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
      res.status(401).send(resFormat.rError('Some error Occured'));
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

module.exports = router