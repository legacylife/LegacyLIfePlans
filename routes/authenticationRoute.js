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

//function to check and signin user details
function signin(req, res) {

  console.log("body=>", req.body);
  
    passport.authenticate('local', function(err, user, info) {      
      console.log("User details =>",user)
      if (err) {
        res.status(404).send(resFormat.rError(err))
      } else if(user && user.message == "WrongMethod") {
        res.status(200).send(resFormat.rError("You might have signed up using google. Please login with google."))
      }
      else if (user) {
          var token = user.generateJwt()
          var params = {lastLoggedInOn: new Date(), loginCount: user.loginCount == undefined ? 1 : user.loginCount + 1}
          User.update({ _id: user._id },{ $set: params} , function(err, updatedUser) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { token, userId: user._id, userType : user.userType, first_name : user.first_name, last_name : user.last_name, "message": "Successfully logged in!" }
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
      } else {
        res.status(200).send(resFormat.rError("Please enter correct password."))
      }
    })(req, res)
  
}

//function to create or register new user
function create(req, res) {
  var user = new User()
  user.username = req.body.username
  user.userType = req.body.userType ? req.body.userType : "AdminWeb"
  user.lastLoggedInOn = new Date();

  if(req.body.username == '' || req.body.fullName == '' || req.body.password == '') {
    res.status(500).send(resFormat.rError("Please fill all required details."))
  }
  User.find({ username: req.body.username }, { userType: 1}, function(err, result) {
    if (err) {
      res.status(500).send(resFormat.rError(err))
    } else if (result && result.length == 0) {
      if(req.body.socialMediaToken && req.body.socialMediaToken != "") {
        user.socialMediaToken = req.body.socialMediaToken
        user.socialPlatform = req.body.socialPlatform
      } else {
        let userSecurityDetails = user.setPassword(req.body.password)
        user.salt = userSecurityDetails.salt;
        user.hash = userSecurityDetails.hash;
      }
      user.emailVerified = false;
      user.status = 'Active';
      user.createdOn = new Date()
      user.save(function(err, newUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          var token = user.generateJwt()
          const { _id, userType, username } = user
          let result = { token, userId: _id, userType, "message": "Successfully logged in!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    } else {
      res.send(resFormat.rError(`You are already registered as ${result[0].userType}` ))
    }
  })
}

router.post('/updateProfilePic', function(req, res){
  var fstream;
  let authTokens = { userId: "", authCode: ""}
  if (req.busboy) {
    req.busboy.on('field', function(fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })

    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      if(authTokens.userId && authTokens.authCode ) {
        let ext = filename.split('.')
        ext = ext[ext.length - 1]
        const newFilename = authTokens.userId +'-'+ new Date().getTime()+`.${ext}`
        fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
        file.pipe(fstream);
        fstream.on('close', async function(){
          await s3.uploadFile(newFilename, profilePicturesPath)
          User.update({ _id: authTokens.userId },{ $set: { profilePicture: newFilename}} , function(err, updatedUser) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              res.send(resFormat.rSuccess({ message: 'User details have been updated', profilePicture: newFilename }))
            }
          })
        })
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }

})

//function to update user details
function update(req, res) {
  if(req.body.username) {
    User.find({ _id: { $ne: req.body._id }, username: req.body.username }, function(err, exUsers) {
        if(exUsers && exUsers.length > 0) {
          res.send(resFormat.rError("This email id is already taken by another user."))
        } else {
          User.update({ _id: req.body._id },{ $set: req.body} , function(err, updatedUser) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              res.send(resFormat.rSuccess('User details have been updated'))
            }
          })
        }
    })

  } else {
    console.log(req.body)
    User.update({ _id: req.body._id },{ $set: req.body} , function(err, updatedUser) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess('User details have been updated'))
      }
    })
  }
}

//function to get list of user as per given criteria
function list (req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalUsers = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function(key, index) {
      if(key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  User.count(query, function(err, userCount) {
    if(userCount) {
      totalUsers = userCount
    }
    User.find(query, fields, function(err, userList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ userList, totalUsers}))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

//function get details of user from url param
function details (req, res) {
  let fields = { id:1, username: 1, socialMediaToken: 1,salt: 1, fullName: 1 }
  if(req.body.fields) {
    fields = req.body.fields
  }
  User.findOne({ _id: req.body.userId }, fields, function(err, user) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(newUser))
    }
  })
}

//function to change users password
const changePassword = function(req,res) {

  User.findOne({ _id: req.body.userId }, function(err, userDetails) {
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      const user = new User()
      if (req.body.password && !user.validPassword(req.body.password, userDetails)) {
        res.send(resFormat.rError('Please enter the correct current password'))
      } else {
        const { salt, hash } = user.setPassword(req.body.newPassword)

        User.update({ _id: req.body.userId},{ $set: { salt, hash}} ,(err, updatedUser)=>{
          if (err) {
            res.send(resFormat.rError(err))
          } else {
            res.send(resFormat.rSuccess('Password has been changed successfully'))
          }
        })
      }
    }
  })
}

// function to change users Email Id
const changeEmail = function( req, res){
  User.findOne({_id: req.body._id}, function(err, userDetails) {
    if (err){
      res.send(resFormat.rError(err))
    } else {
      const user = new User()
      if (req.body.password && !user.validPassword(req.body.password, userDetails)){
         res.send(resFormat.rError('Current Password is wrong'))
      } else {
        let set = { username: req.body.username }
        User.update({_id:req.body._id},{$set: set}, { runValidators: true, context: 'query' }, (err, updateUser) =>{
          if (err){
            if(err.name == "ValidationError"){
              res.send(resFormat.rError("Email ID has been already registered"))
            }else{
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
const resetPassword = function(req,res) {
  User.findOne({_id: mongoose.Types.ObjectId(new Buffer(req.body.userId, 'base64').toString('ascii'))}, function(err, userDetails) {
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      const user = new User()
      const { salt, hash } = user.setPassword(req.body.password)
      User.update({ _id: userDetails._id},{ $set: { salt, hash}} ,(err, updatedUser)=>{
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          res.send(resFormat.rSuccess('Password has been updated'))
        }
      })
    }
  })
}

//function to generate reset password link for user
function forgotPassword (req, res) {
  //find user based on email id

  console.log(req.body);

  User.findOne({"username": req.body.username}, {}, function(err, user) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else if(!user){
      res.send(resFormat.rError("Looks like your account does not exist. Sign up to create an account."))
    } else{
      var date = new Date()
      user.resetPasswordExpiry = date.setHours(date.getHours() + 48)

      //update password reset expiry date for user
      user.save(function(err, newUser) {
        if (err) {
          res.status(500).send(resFormat.rError(err))
        }
        let clientUrl = constants.clientUrl
        var link =  clientUrl + '/llp-admin/reset-password/' + new Buffer(user._id.toString()).toString('base64');

        //forgot password email template
        emailTemplatesRoute.getEmailTemplateByCode("ForgotPassword").then((template) => {
          if(template) {
            template = JSON.parse(JSON.stringify(template));
            let body = template.mailBody.replace("{link}", link);
            const mailOptions = {
              to : req.body.username,
              subject : template.mailSubject,
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
      User.update({ _id: userId },{ $set: { profilePicture: filename}} , function(err, updatedUser) {
        if (err) {
            res.send(resFormat.rError(err))
          } else {
            res.send(resFormat.rSuccess('User details have been updated'))
          }
        })// user update ends
      } // else loop ends
    }) //s3 upload ends
}

function common(req, res) {
  const Models = {'users': User}

  User.findById(req.body.userId, function(err, user) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {

      Models[req.body.rc[0]].find(req.body.query, req.body.fields, function(err,resultData){
        if (err) {
          res.status(401).send(resFormat.rError(err))
        } else {
          res.send(resFormat.rSuccess(resultData))
        }
      })
    }
  })
}

router.post('/reset-password-token', function(req, res){		
	User.findOne({token:req.body.userId}, function(err, userDetails){		
    if(userDetails){
      res.send(resFormat.rSuccess('Success'))
    } else {
	  var errMsg = 'Invalid link, Please try again.'
      res.send(resFormat.rError(errMsg))
    }
  })
})


//function to check if email present for any user
async function checkEmail(req, res){
  try {
    const { username, socialMediaToken } = req.body
    User.findOne({ username: username }, {username: 1}, function(err, user){
      if(err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        if(user) {
          if(socialMediaToken) {
            signin(req, res)
          } else {
            res.send(resFormat.rSuccess({ code: "Exist", message: "You have already signup. Please login with your account." }))
          }
        } else {
          res.send(resFormat.rSuccess({ code: "NewUser", message: "User not found in database." }))
        }
      }// end of else of user
    }) //end of user find
  } catch (e) {
    res.status(401).send(resFormat.rError(e.message))
  }
}

router.post(["/signup", "/register"], create)
router.post("/signin", signin)
router.post("/update", update)
router.post("/list", list)
router.get(["/view/:id", "/:id"], details)
router.post(["/view"], details)
router.post('/resetPassword', resetPassword)
router.post("/changePassword", changePassword)
router.post("/forgotPassword", forgotPassword)
router.post("/changeEmail", changeEmail)
router.post("/common", common)
router.post("/checkEmail", checkEmail)

module.exports = router
