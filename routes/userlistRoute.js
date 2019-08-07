var express = require('express')
var router = express.Router()
var passport = require('passport')
var request = require('request')
var jwt = require('express-jwt')
const mongoose = require('mongoose')
var objectId = mongoose.Types.ObjectId();


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
var currencyFormatter = require('currency-formatter');
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

const stripe = require("stripe")(constants.stripeSecretKey);

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
        if (err) {
          res.status(401).send(resFormat.rError(err))
        } else {
        res.send(resFormat.rSuccess({ userList: contacts, totalUsers }))
        }
      }) //end of async

      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {      
        if(totalUsers){
          res.send(resFormat.rSuccess({ userList, totalUsers }))
        }        
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
  let fields = { id: 1, username: 1, status: 1, stripeCustomerId:1, subscriptionDetails:1, firstName:1, lastName:1 }
  User.findOne(query, fields, function (err, userList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Active';
      if (userList.status == 'Active') {
        upStatus = 'Inactive'; 

        if( userList.stripeCustomerId ) {
          let subscriptionDetails = userList.subscriptionDetails ? userList.subscriptionDetails : null
          let subscriptionId = subscriptionDetails != null ? subscriptionDetails[(subscriptionDetails.length-1)]['subscriptionId'] : ""
          if( subscriptionId != "" ) {
            if( subscriptionDetails[subscriptionDetails.length-1]['status'] == 'paid') {
              stripe.subscriptions.del(
                subscriptionId,
                function(err, confirmation) {
                  if( err ) {
                    res.status(401).send(resFormat.rError(err))
                  }
                  let updatedSubscriptionObject = subscriptionDetails
                  updatedSubscriptionObject[updatedSubscriptionObject.length-1]['status'] = confirmation.status
                  User.updateOne({ _id: req.body.query._id }, { $set: { subscriptionDetails : updatedSubscriptionObject } }, function (err, updated) {
                    if (err) {
                      res.send(resFormat.rError(err))
                    }
  
                    //subscription purchased email template
                    emailTemplatesRoute.getEmailTemplateByCode("SubscriptionCanceled").then((template) => {
                      if(template) {
                        template = JSON.parse(JSON.stringify(template));
                        let body = template.mailBody.replace("{full_name}", userList.firstName ? userList.firstName+' '+ (userList.lastName ? userList.lastName:'') : 'User');
                        body = body.replace("{canceled_on}",new Date());
                        body = body.replace("{end_date}",updatedSubscriptionObject[updatedSubscriptionObject.length-1]['endDate']);
                        const mailOptions = {
                          to : userList.username,
                          subject : template.mailSubject,
                          html: body
                        }
                        sendEmail(mailOptions)
                        res.status(200).send(resFormat.rSuccess({'subscriptionStatus': confirmation.status, 'message':'Done'}));
                      } else {
                        res.status(200).send(resFormat.rSuccess({'subscriptionStatus': confirmation.status, 'message':'Done'}));
                      }
                    })
                  })
              })
            }
          }
        }
      }
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
            let result = { "userProfile": { userId: updatedUser._id, userType: updatedUser.userType, firstName: updatedUser.firstName, lastName: updatedUser.lastName, phoneNumber: updatedUser.phoneNumber,profilePicture:updatedUser.profilePicture }, "message": "Profile update successfully!" }
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
  newMem.fullName = req.body.fullName;
  newMem.firstName = req.body.firstName;
  newMem.lastName = req.body.lastName;
  newMem.sectionAccess = req.body.sectionAccess;
  newMem.userType = 'sysadmin';
  newMem.username = req.body.username;
  newMem.status = req.body.status;
  newMem.allowNotifications = req.body.allowNotifications;
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

             
              setTimeout(function(){ 
                var sendMails = sendMailsAdmin(newMemRecord);
              }, 3000);

              res.send(resFormat.rSuccess('Member has been addedd'));
            }
          })
      }
    }) //end of user find
}


function sendMailsAdmin(newMemRecord){
  let fullName = newMemRecord.firstName+' '+newMemRecord.lastName;
  
    let  query  = {"allowNotifications" : "yes"};
    User.find(query, function (err, userList) {
    
      let contacts = []
      async.each(userList, function (contact, callback) {
        let newContact = JSON.parse(JSON.stringify(contact))
          //sent new member notifications to other admin / email template
          emailTemplatesRoute.getEmailTemplateByCode("NewMemberNotification").then((template) => {
            if(template) {
              template = JSON.parse(JSON.stringify(template));
              let body = template.mailBody.replace("{name}", newContact.firstName);
              body = body.replace("{memname}", fullName);
              const mailOptions = {
                to : newContact.username,
                subject : template.mailSubject,
                html: body
              }
              sendEmail(mailOptions)
            } else {     

            }
          }) // set new password email template ends*/


      }, function (exc) {
      }) //end of async

      if (err) {
        //error
      } else {
       //'All new member emails sent!'
      }
    })
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

function getProductDetails(req, res) {
  let { query } = req.body;
  let fields = {}
  User.findOne(query, fields, function (err, userProfile) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      stripe.plans.list( { limit: 3, active:true }, function(err, plans) {
          // asynchronously called
          res.status(200).send(resFormat.rSuccess( {plans, "message": "Subscription Plans"}))    
      });
    }
  })
}

function getPlanDetails(req, res) {
  let requestParam = req.body.query
  let param = {query :{_id:requestParam._id, userType:requestParam.userType }}
  let { query } = param;
  let fields = {}
  User.findOne(query, fields, function (err, userProfile) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      console.log("userProfile",userProfile)
      if( userProfile && userProfile.stripeCustomerId ) {
        let subscriptionDetails = userProfile.subscriptionDetails ? userProfile.subscriptionDetails : null
        let planId = subscriptionDetails != null ? subscriptionDetails[(subscriptionDetails.length-1)]['planId'] : ""
        console.log("planId",planId)
        if( planId && planId!= null || planId != "" ) {
          stripe.plans.retrieve(
            planId,
            function(err, plan) {
              if (err) {
                res.status(200).send(resFormat.rError(err))
              }
              res.status(200).send(resFormat.rSuccess( {plan, "message": "Plan Details"}))    
          });
        }
        else{
          res.status(200).send(resFormat.rError(""))
        }
      }
      else{
        res.status(401).send(resFormat.rError(""))
      }
    }
  })
}

function getCustomerCard(req, res) {
  let { query } = req.body;
  let fields = {}
  User.findOne(query, fields, function (err, userProfile) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      
      let result = {};
      if( userProfile.stripeCustomerId && userProfile.stripeCustomerId != null ) {
        let stripeCustomerId = userProfile.stripeCustomerId;
        stripe.customers.listSources(
          stripeCustomerId,
          {
            limit: 1,
            object: 'card',
          },
          function(err, cards) {
          // asynchronously called
          let cardData = cards.data[0]
          //console.log(cardData)
          result = { exp_month:cardData.exp_month, exp_year:cardData.exp_year, type:cardData.funding, last4:cardData.last4, brand:cardData.brand, "message": "Yes" }
          res.status(200).send(resFormat.rSuccess(result))
        });
      }
      else{
        result = { "message": "No" }
        res.status(200).send(resFormat.rSuccess(result))
      }
      
    }
  })
}
/**
 * Get yearly subscription for customer
 * @param {*} req 
 * @param {*} res 
 */
function getSubscription(req, res) {
  let requestParam = req.body.query
  let param = {query :{_id:requestParam._id, userType:requestParam.userType }}
  let { query } = param;
  let fields = {}
  User.findOne(query, fields, function (err, userProfile) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    }
    else {
      let stripeCustomerId = ""
      let planId = requestParam.planId

      /**
       * Check user have stripe customer id or not. If not create stripe customer id.
       */
      if( userProfile.stripeCustomerId ) {
        stripeCustomerId = userProfile.stripeCustomerId;
        //If user want to pay with new card, update card details against the user in stripe
        if( requestParam.token != null ) {
          stripe.customers.update(
            stripeCustomerId,
            { source : requestParam.token },
              function(err, customer) {
              if ( err ) {
                switch (err.type) {
                  case 'StripeCardError':
                    // A declined card error
                    //err.message; // => e.g. "Your card's expiration year is invalid."
                    res.send(resFormat.rError(err.message));
                    break;
                  case 'StripeRateLimitError':
                    // Too many requests made to the API too quickly
                    res.send(resFormat.rError(err.message));
                    break;
                  case 'StripeInvalidRequestError':
                    // Invalid parameters were supplied to Stripe's API
                    res.send(resFormat.rError(err.message));
                    break;
                  case 'StripeAPIError':
                    // An error occurred internally with Stripe's API
                    res.send(resFormat.rError(err.message));
                    break;
                  case 'StripeConnectionError':
                    // Some kind of error occurred during the HTTPS communication
                    res.send(resFormat.rError(err.message));
                    break;
                  case 'StripeAuthenticationError':
                    // You probably used an incorrect API key
                    res.send(resFormat.rError(err.message));
                    break;
                  default:
                    // Handle any other types of unexpected errors
                    res.send(resFormat.rError("Invalid access. Try again"));
                    break;
                }
              }
              else{
                createSubscription( userProfile, stripeCustomerId, planId, requestParam, res )
              }
            }
          );
        }
        else{
          createSubscription( userProfile, stripeCustomerId, planId, requestParam, res )
        }
      }
      else{
        stripe.customers.create({
          email:userProfile.username,
          description: 'Customer for '+userProfile.username,
          source: requestParam.token // obtained with Stripe.js
        }, function(err, customer) {
          if( err ) {
            switch (err.type) {
              case 'StripeCardError':
                // A declined card error
                //err.message; // => e.g. "Your card's expiration year is invalid."
                res.send(resFormat.rError(err.message));
                break;
              case 'StripeRateLimitError':
                // Too many requests made to the API too quickly
                res.send(resFormat.rError(err.message));
                break;
              case 'StripeInvalidRequestError':
                // Invalid parameters were supplied to Stripe's API
                res.send(resFormat.rError(err.message));
                break;
              case 'StripeAPIError':
                // An error occurred internally with Stripe's API
                res.send(resFormat.rError(err.message));
                break;
              case 'StripeConnectionError':
                // Some kind of error occurred during the HTTPS communication
                res.send(resFormat.rError(err.message));
                break;
              case 'StripeAuthenticationError':
                // You probably used an incorrect API key
                res.send(resFormat.rError(err.message));
                break;
              default:
                // Handle any other types of unexpected errors
                res.send(resFormat.rError("Invalid access. Try again"));
                break;
            }
          }
          else{
            stripeCustomerId = customer.id
            createSubscription( userProfile, stripeCustomerId, planId, requestParam, res )
          }
        });
      }
    }
  })
}

/**
 * Apply to subscription and update the object against to user
 */
function createSubscription( userProfile, stripeCustomerId, planId, requestParam, res ) {
  stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [ 
      { plan: planId }
    ]
  }, function(err, subscription) {
    if (err) {

      switch (err.type) {
        case 'StripeCardError':
          // A declined card error
          //err.message; // => e.g. "Your card's expiration year is invalid."
          res.send(resFormat.rError(err.message));
          break;
        case 'StripeRateLimitError':
          // Too many requests made to the API too quickly
          res.send(resFormat.rError(err.message));
          break;
        case 'StripeInvalidRequestError':
          // Invalid parameters were supplied to Stripe's API
          res.send(resFormat.rError(err.message));
          break;
        case 'StripeAPIError':
          // An error occurred internally with Stripe's API
          res.send(resFormat.rError(err.message));
          break;
        case 'StripeConnectionError':
          // Some kind of error occurred during the HTTPS communication
          res.send(resFormat.rError(err.message));
          break;
        case 'StripeAuthenticationError':
          // You probably used an incorrect API key
          res.send(resFormat.rError(err.message));
          break;
        default:
          // Handle any other types of unexpected errors
          res.send(resFormat.rError("Invalid access. Try again"));
          break;
      }
      
    }
    else {
      let subscriptionStartDate = subscription.current_period_start*1000
      let subscriptionEndDate = subscription.current_period_end*1000
      let subscriptionDetails = {"_id" : objectId,
                                "productId" : subscription.items.data[0]['plan']['product'],
                                "planId" : planId,
                                "subscriptionId" : subscription.id,
                                "startDate" : new Date(subscriptionStartDate),
                                "endDate" : new Date(subscriptionEndDate),
                                "interval" : subscription.items.data[0]['plan']['interval'],
                                "currency" : subscription.items.data[0]['plan']['currency'],
                                "amount" : subscription.items.data[0]['plan']['amount'] / 100,
                                "status" : 'paid',
                                "autoRenewal": subscription.collection_method == 'charge_automatically' ? true : false,
                                "paymentMode" : 'online',
                                "planName" : subscription.items.data[0]['plan']['metadata']['name']+' Plan',
                                "defaultSpace" : subscription.items.data[0]['plan']['metadata']['defaultSpace'],
                                "spaceDimension" : subscription.items.data[0]['plan']['metadata']['spaceDimension'],
                                "paidOn" : new Date(),
                                "createdOn" : new Date(),
                                "createdBy" : mongoose.Types.ObjectId(requestParam._id)
                              };
      let userSubscription = []
      let EmailTemplateName = "NewSubscriptionAdviser";
      if(userProfile.userType == 'customer') {
        EmailTemplateName = "NewSubscription";
      }

      if( userProfile.subscriptionDetails && userProfile.subscriptionDetails.length > 0 ) {
        userSubscription = userProfile.subscriptionDetails
        EmailTemplateName = "AutoRenewalAdviser"
        if(userProfile.userType == 'customer') {
          EmailTemplateName = "AutoRenewal"
        }
      }
      userSubscription.push(subscriptionDetails)
      //Update user details
      User.updateOne({ _id: requestParam._id }, { $set: { stripeCustomerId : stripeCustomerId, subscriptionDetails : userSubscription, upgradeReminderEmailDay: [], renewalOnReminderEmailDay:[], renewalOffReminderEmailDay:[] } }, function (err, updated) {
        if (err) {
          res.send(resFormat.rError(err))
        }
        else {
          //subscription purchased email template
          emailTemplatesRoute.getEmailTemplateByCode(EmailTemplateName).then((template) => {
            if(template) {
              template = JSON.parse(JSON.stringify(template));
              let body = template.mailBody.replace("{full_name}", userProfile.firstName ? userProfile.firstName+' '+ (userProfile.lastName ? userProfile.lastName:'') : 'User');
              body = body.replace("{plan_name}",subscriptionDetails.planName);
              body = body.replace("{amount}", currencyFormatter.format(subscriptionDetails.amount, { code: (subscriptionDetails.currency).toUpperCase() }));
              body = body.replace("{duration}",subscriptionDetails.interval);
              body = body.replace("{paid_on}",subscriptionDetails.paidOn);
              body = body.replace("{start_date}",subscriptionDetails.startDate);
              body = body.replace("{end_date}",subscriptionDetails.endDate);
              if(userProfile.userType == 'customer') {
                body = body.replace("{space_alloted}",subscriptionDetails.defaultSpace+' '+subscriptionDetails.spaceDimension);
                body = body.replace("{more_space}", subscription.items.data[0]['plan']['metadata']['addOnSpace']+' '+subscriptionDetails.spaceDimension);
              }
              body = body.replace("{subscription_id}",subscriptionDetails.subscriptionId);
              const mailOptions = {
                to : userProfile.username,
                subject : template.mailSubject,
                html: body
              }
              sendEmail(mailOptions)
              res.status(200).send(resFormat.rSuccess({'subscriptionStartDate':new Date(subscriptionStartDate), 'subscriptionEndDate':new Date(subscriptionEndDate), 'message':'Done'}));
            } else {
              res.status(200).send(resFormat.rSuccess({'subscriptionStartDate':new Date(subscriptionStartDate), 'subscriptionEndDate':new Date(subscriptionEndDate), 'message':'Done'}));
            }
          })
        }
      })
    }
  });
}

/**
 * Get addon subscription for customer
 * @param {*} req 
 * @param {*} res 
 */
function getAddon(req, res) {
  let requestParam = req.body.query
  let param = {query :{_id:requestParam._id, userType:requestParam.userType }}
  let { query } = param;
  let fields = {}
  User.findOne(query, fields, function (err, userProfile) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    }
    else {
      let stripeCustomerId = ""
      let planId = requestParam.planId

      /**
       * Check user have stripe customer id or not. If not create stripe customer id.
       */
      if( userProfile.stripeCustomerId ) {
        stripeCustomerId = userProfile.stripeCustomerId;
        //If user want to pay with new card, update card details against the user in stripe
        if( requestParam.token != null ) {
          stripe.customers.update(
            stripeCustomerId,
            { source : requestParam.token },
              function(err, customer) {
              if ( err ) {
                switch (err.type) {
                  case 'StripeCardError':
                    // A declined card error
                    //err.message; // => e.g. "Your card's expiration year is invalid."
                    res.send(resFormat.rError(err.message));
                    break;
                  case 'StripeRateLimitError':
                    // Too many requests made to the API too quickly
                    res.send(resFormat.rError(err.message));
                    break;
                  case 'StripeInvalidRequestError':
                    // Invalid parameters were supplied to Stripe's API
                    res.send(resFormat.rError(err.message));
                    break;
                  case 'StripeAPIError':
                    // An error occurred internally with Stripe's API
                    res.send(resFormat.rError(err.message));
                    break;
                  case 'StripeConnectionError':
                    // Some kind of error occurred during the HTTPS communication
                    res.send(resFormat.rError(err.message));
                    break;
                  case 'StripeAuthenticationError':
                    // You probably used an incorrect API key
                    res.send(resFormat.rError(err.message));
                    break;
                  default:
                    // Handle any other types of unexpected errors
                    res.send(resFormat.rError("Invalid access. Try again"));
                    break;
                }
              }
              else{
                chargeForAddon( userProfile, stripeCustomerId, requestParam, res )
              }
              
            }
          );
        }
        else{
          chargeForAddon( userProfile, stripeCustomerId, requestParam, res )
        }
      }
      else{
        stripe.customers.create({
          email:userProfile.username,
          description: 'Customer for '+userProfile.username,
          source: requestParam.token // obtained with Stripe.js
        }, function(err, customer) {
          if( err ) {
            switch (err.type) {
              case 'StripeCardError':
                // A declined card error
                //err.message; // => e.g. "Your card's expiration year is invalid."
                res.send(resFormat.rError(err.message));
                break;
              case 'StripeRateLimitError':
                // Too many requests made to the API too quickly
                res.send(resFormat.rError(err.message));
                break;
              case 'StripeInvalidRequestError':
                // Invalid parameters were supplied to Stripe's API
                res.send(resFormat.rError(err.message));
                break;
              case 'StripeAPIError':
                // An error occurred internally with Stripe's API
                res.send(resFormat.rError(err.message));
                break;
              case 'StripeConnectionError':
                // Some kind of error occurred during the HTTPS communication
                res.send(resFormat.rError(err.message));
                break;
              case 'StripeAuthenticationError':
                // You probably used an incorrect API key
                res.send(resFormat.rError(err.message));
                break;
              default:
                // Handle any other types of unexpected errors
                res.send(resFormat.rError("Invalid access. Try again"));
                break;
            }
          }
          else{
            stripeCustomerId = customer.id
            chargeForAddon( userProfile, stripeCustomerId, requestParam, res )
          }
        });
      }
    }
  })
}

/**
 * Apply to addon plan and update the object against to user
 */
function chargeForAddon( userProfile, stripeCustomerId, requestParam, res ) {
  
  stripe.charges.create({
    customer: stripeCustomerId,
    amount: (requestParam.amount)*100,
    currency: requestParam.currency,
    description: "Addon Charge for "+userProfile.username,
    capture: true,
    receipt_email: userProfile.username,
  }, function(err, charge) {
    if (err) {
      console.log("======================",err)
      switch (err.type) {
        case 'StripeCardError':
          // A declined card error
          //err.message; // => e.g. "Your card's expiration year is invalid."
          res.send(resFormat.rError(err.message));
          break;
        case 'StripeRateLimitError':
          // Too many requests made to the API too quickly
          res.send(resFormat.rError(err.message));
          break;
        case 'StripeInvalidRequestError':
          // Invalid parameters were supplied to Stripe's API
          res.send(resFormat.rError(err.message));
          break;
        case 'StripeAPIError':
          // An error occurred internally with Stripe's API
          res.send(resFormat.rError(err.message));
          break;
        case 'StripeConnectionError':
          // Some kind of error occurred during the HTTPS communication
          res.send(resFormat.rError(err.message));
          break;
        case 'StripeAuthenticationError':
          // You probably used an incorrect API key
          res.send(resFormat.rError(err.message));
          break;
        default:
          // Handle any other types of unexpected errors
          res.send(resFormat.rError("Invalid access. Try again"));
          break;
      }
    }
    else {
      let addOnDetails = {"_id" : objectId,
                          "chargeId" : charge.id,
                          "currency" : charge.currency,
                          "amount" : (charge.amount)/100,
                          "status" : 'paid',
                          "paymentMode" : 'online',
                          "spaceAlloted" : requestParam.spaceAlloted,
                          "spaceDimension" : 'GB',
                          "paidOn" : new Date(),
                          "createdOn" : new Date(),
                          "createdBy" : mongoose.Types.ObjectId(requestParam._id)
                        };
      let userSubscriptionAddOn = []
      if( userProfile.addOnDetails && userProfile.addOnDetails.length > 0 ) {
        userSubscriptionAddOn = userProfile.addOnDetails
      }
      userSubscriptionAddOn.push(addOnDetails)
      //Update user details
      User.updateOne({ _id: requestParam._id }, { $set: { stripeCustomerId : stripeCustomerId, addOnDetails : userSubscriptionAddOn } }, function (err, updated) {
        if (err) {
          res.send(resFormat.rError(err))
        }
        else {
          //subscription purchased email template
          emailTemplatesRoute.getEmailTemplateByCode("AddonSubscription").then((template) => {
            let subscriptionDetails = userProfile.subscriptionDetails
            if(template) {
              template = JSON.parse(JSON.stringify(template));
              let body = template.mailBody.replace("{full_name}", userProfile.firstName ? userProfile.firstName+' '+ (userProfile.lastName ? userProfile.lastName:'') : 'User');
              body = body.replace("{addon_space}",addOnDetails.spaceAlloted+' '+addOnDetails.spaceDimension);
              body = body.replace("{plan_name}",subscriptionDetails[subscriptionDetails.length-1]['planName']);
              body = body.replace("{amount}", currencyFormatter.format(addOnDetails.amount, { code: (addOnDetails.currency).toUpperCase() }));
              body = body.replace("{duration}",subscriptionDetails[subscriptionDetails.length-1]['interval']);
              body = body.replace("{paid_on}",addOnDetails.paidOn);
              body = body.replace("{end_date}",subscriptionDetails[subscriptionDetails.length-1]['endDate']);
              const mailOptions = {
                to : userProfile.username,
                subject : template.mailSubject,
                html: body
              }
              sendEmail(mailOptions)
              res.status(200).send(resFormat.rSuccess({ 'message':'Done' }));
            } else {
              res.status(200).send(resFormat.rSuccess({ 'message':'Done' }));
            }
          })
          //res.status(200).send(resFormat.rSuccess({ 'message':'Done' }));
        }
      })
    }
  });
}

function autoRenewalUpdate(req, res) {
  let requestParam = req.body.query
  let param = {query :{_id:requestParam._id, userType:requestParam.userType }}
  let { query } = param;
  let fields = {}
  User.findOne(query, fields, function (err, userProfile) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } 
    else {
      if( userProfile.stripeCustomerId ) {
        let subscriptionDetails = userProfile.subscriptionDetails ? userProfile.subscriptionDetails : null
        let subscriptionId = subscriptionDetails != null ? subscriptionDetails[(subscriptionDetails.length-1)]['subscriptionId'] : ""
        if( subscriptionId != "" ) {
          let data = {}
          let autoRenewalStatus = requestParam.status
          // Number of days a customer has to pay invoices generated by this subscription. Valid only for subscriptions where collection_method is set to send_invoice
          if( !autoRenewalStatus ) {
            data = { collection_method: 'send_invoice', days_until_due: 30 }
          }
          else{
            data = { collection_method: 'charge_automatically' }
          }
          stripe.subscriptions.update(
            subscriptionId,
            data,
            function(err, confirmation) {
              if( err ) {
                res.status(401).send(resFormat.rError(err))
              }
              let updatedSubscriptionObject = subscriptionDetails
              updatedSubscriptionObject[updatedSubscriptionObject.length-1]['autoRenewal'] = autoRenewalStatus
              User.updateOne({ _id: requestParam._id }, { $set: { subscriptionDetails : updatedSubscriptionObject } }, function (err, updated) {
                if (err) {
                  res.send(resFormat.rError(err))
                }
                res.status(200).send(resFormat.rSuccess({'autoRenewalStatus': autoRenewalStatus, 'message':'Done'}));
              })
          });
        }
        else{
          res.status(401).send(resFormat.rError({'message':'Not subscribed any plan yet'}))
        }
      }
      else{
        res.status(401).send(resFormat.rError({'message':'Unauthorize access'}))
      }
    }
  })
}

function cancelSubscription(req, res) {
  let { query } = req.body;
  let fields = {}
  User.findOne(query, fields, function (err, userProfile) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } 
    else {
      if( userProfile.stripeCustomerId ) {
        let subscriptionDetails = userProfile.subscriptionDetails ? userProfile.subscriptionDetails : null
        let subscriptionId = subscriptionDetails != null ? subscriptionDetails[(subscriptionDetails.length-1)]['subscriptionId'] : ""
        if( subscriptionId != "" ) {
          if( subscriptionDetails[subscriptionDetails.length-1]['status'] == 'paid') {
            stripe.subscriptions.del(
              subscriptionId,
              function(err, confirmation) {
                if( err ) {
                  res.status(401).send(resFormat.rError(err))
                }
                let updatedSubscriptionObject = subscriptionDetails
                updatedSubscriptionObject[updatedSubscriptionObject.length-1]['status'] = confirmation.status
                User.updateOne({ _id: req.body.query._id }, { $set: { subscriptionDetails : updatedSubscriptionObject } }, function (err, updated) {
                  if (err) {
                    res.send(resFormat.rError(err))
                  }

                  //subscription purchased email template
                  emailTemplatesRoute.getEmailTemplateByCode("SubscriptionCanceled").then((template) => {
                    if(template) {
                      template = JSON.parse(JSON.stringify(template));
                      let body = template.mailBody.replace("{full_name}", userProfile.firstName ? userProfile.firstName+' '+ (userProfile.lastName ? userProfile.lastName:'') : 'User');
                      body = body.replace("{canceled_on}",new Date());
                      body = body.replace("{end_date}",updatedSubscriptionObject[updatedSubscriptionObject.length-1]['endDate']);
                      const mailOptions = {
                        to : userProfile.username,
                        subject : template.mailSubject,
                        html: body
                      }
                      sendEmail(mailOptions)
                      res.status(200).send(resFormat.rSuccess({'subscriptionStatus': confirmation.status, 'message':'Done'}));
                    } else {
                      res.status(200).send(resFormat.rSuccess({'subscriptionStatus': confirmation.status, 'message':'Done'}));
                    }
                  })
                  
                })
            });
          }
          else{
            res.status(401).send(resFormat.rError({'message':'You already canceled the subscription.'}))
          }
        }
        else{
          res.status(401).send(resFormat.rError({'message':'Not subscribed any plan yet'}))
        }
      }
      else{
        res.status(401).send(resFormat.rError({'message':'Unauthorize access'}))
      }
    }
  })
}

router.post(["/autorenewalupdate"], autoRenewalUpdate);
router.post(["/cancelsubscription"], cancelSubscription);
router.post(["/getaddon"], getAddon);
router.post(["/getsubscription"], getSubscription);
router.post(["/getproductdetails"], getProductDetails);
router.post(["/getplandetails"], getPlanDetails);
router.post(["/getcustomercard"], getCustomerCard);
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