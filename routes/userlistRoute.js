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
var zipcodes = require('zipcodes');
const stripe = require("stripe")(constants.stripeSecretKey);
var moment    = require('moment');
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')

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
  let { fromId } = req.body;
  let fields = { id: 1, username: 1, status: 1, stripeCustomerId:1, subscriptionDetails:1, firstName:1, lastName:1 }
  User.findOne(query, fields, function (err, userList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Active';
      let subSection = userList.userType == 'customer' ? 'Customers' : (userList.userType == 'advisor' ? 'Advisors' : 'Admin Users')
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
                        //Update activity logs
                        allActivityLog.updateActivityLogs(fromId, userList._id, 'User '+upStatus, 'Subscription has been canceled successfully.', 'User Management',subSection)

                        res.status(200).send(resFormat.rSuccess({'subscriptionStatus': confirmation.status, 'message':'Done'}));
                      }
                      else {
                        //Update activity logs
                        allActivityLog.updateActivityLogs(fromId, userList._id, 'User '+upStatus, 'Subscription has been canceled successfully.', 'User Management',subSection)

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
          let message = resMessage.data( 607, [{key: '{field}',val: 'Status'}, {key: '{status}',val: 'updated'}] )
          allActivityLog.updateActivityLogs(fromId, userList._id, 'User '+upStatus, message, 'User Management',subSection)
          let result = { userId: updatedUser._id, userType: updatedUser.userType, "message": message }
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
  let { fromId } = req.body
  let fields = { id: 1, username: 1, status: 1 }
  User.findOne(query, function (err, updatedUser) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {      
      let  proquery  = req.body;
      User.update({ _id: updatedUser._id }, { $set: proquery }, function (err, updated) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          User.findOne(query, function (err, updatedUser) {
            let message = resMessage.data( 607, [{key: '{field}',val: 'Profile'}, {key: '{status}',val: 'updated'}] )
            //Update activity logs
            allActivityLog.updateActivityLogs(fromId, updatedUser._id, 'Updated Sub-Admin', message,'Admin Panel','Admin users')
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
  let  {fromId} = req.body
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
    if(user) {
      let message = resMessage.data( 625, [{key: '{userType}',val: user.userType}] )
      res.send(resFormat.rSuccess({ code: "Exist", message: message}))
    }
    else{
          newMem.save(function (err, newMemRecord) {
            if (err) {
              res.status(500).send(resFormat.rError(err))
            }
            else {
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
                  let message = resMessage.data( 616, [] )
                  res.send(resFormat.rSuccess({ code: "Exist", message: message}))
                } else {
                  res.status(401).send(resFormat.rError('Some error Occured'))
                }
              }) // set new password email template ends*/

             
              setTimeout(function(){ 
                var sendMails = sendMailsAdmin(newMemRecord);
              }, 3000);
              let message = resMessage.data( 607, [{key: '{field}',val: 'Member'}, {key: '{status}',val: 'added'}] )
              //Update activity logs
              allActivityLog.updateActivityLogs(fromId, newMemRecord._id, 'Added Sub-Admin', message,'Admin Panel','Admin users')
              res.send(resFormat.rSuccess(message));
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
      if( userProfile && userProfile.stripeCustomerId ) {
        let subscriptionDetails = userProfile.subscriptionDetails ? userProfile.subscriptionDetails : null
        let planId = subscriptionDetails != null ? subscriptionDetails[(subscriptionDetails.length-1)]['planId'] : ""
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
        res.status(200).send(resFormat.rSuccess( { plan:'', "message": "No Details"}))
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
            let result = {}
          // asynchronously called
          if(cards && cards.data.length > 0) {
            let cardData = cards.data[0]
            //console.log(cardData)
            result = { exp_month:cardData.exp_month, exp_year:cardData.exp_year, type:cardData.funding, last4:cardData.last4, brand:cardData.brand, "message": "Yes" }
          }
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
  let subscriptions = []
  let subscriptionStatus = 'added'
  let subscriptionDetails = {"_id" : objectId,
                          "productId" : '',
                          "planId" : planId,
                          "subscriptionId" : '',
                          "startDate" : new Date(),
                          "endDate" : '',
                          "interval" : '',
                          "currency" : '',
                          "amount" : 0,
                          "status" : 'incomplete',
                          "autoRenewal": false,
                          "paymentMode" : '',
                          "planName" : '',
                          "defaultSpace" : 0,
                          "spaceDimension" : '',
                          "paidOn" : '',
                          "createdOn" : new Date(),
                          "createdBy" : mongoose.Types.ObjectId(requestParam._id)
                        };

  if( userProfile.subscriptionDetails && userProfile.subscriptionDetails.length > 0 ) {
    subscriptions = userProfile.subscriptionDetails
    subscriptionStatus = 'updated'
  }
  subscriptions.push(subscriptionDetails)
  User.updateOne({ _id: userProfile._id }, { $set: { stripeCustomerId : stripeCustomerId, subscriptionDetails : subscriptions } }, function (err, updated) {
    if (err) {
      res.send(resFormat.rError(err))
    }
    else {
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
          if(subscription.status == 'active') {
            let subscriptionStartDate = subscription.current_period_start*1000
            let subscriptionEndDate = subscription.current_period_end*1000

            User.findOne({_id:userProfile._id,userType:userProfile.userType}, {}, function (err, userDetails) {
              if (err) {
                res.status(401).send(resFormat.rError(err))
              }
              else {
                
                let userSubscription = userDetails.subscriptionDetails
                let latestSubscription = userSubscription[userSubscription.length-1]
                let subscriptionDetails = {"_id" : latestSubscription._id,
                                          "productId" : subscription.items.data[0]['plan']['product'],
                                          "planId" : latestSubscription.planId,
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
                                          "createdOn" : latestSubscription.createdOn,
                                          "createdBy" : latestSubscription.createdBy
                                        };
                userSubscription[userSubscription.length-1] = subscriptionDetails

                let EmailTemplateName = "NewSubscriptionAdviser";
                if(userDetails.userType == 'customer') {
                  EmailTemplateName = "NewSubscription";
                }

                if( userDetails.subscriptionDetails && userDetails.subscriptionDetails.length > 0 ) {
                  EmailTemplateName = "AutoRenewalAdviser"
                  if(userDetails.userType == 'customer') {
                    EmailTemplateName = "AutoRenewal"
                  }
                }
                //Update user details
                User.updateOne({ _id: requestParam._id }, { $set: { stripeCustomerId : stripeCustomerId, subscriptionDetails : userSubscription, upgradeReminderEmailDay: [], renewalOnReminderEmailDay:[], renewalOffReminderEmailDay:[] } }, function (err, updated) {
                  if (err) {
                    res.send(resFormat.rError(err))
                  }
                  else {
                    let message = resMessage.data( 607, [{key: '{field}',val: 'Subscription'}, {key: '{status}',val: subscriptionStatus}] )
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
                        //Update activity logs
                        allActivityLog.updateActivityLogs(userProfile._id, userProfile._id, 'Subscription', message,'Account Settings')
                        res.status(200).send(resFormat.rSuccess({'subscriptionStartDate':new Date(subscriptionStartDate), 'subscriptionEndDate':new Date(subscriptionEndDate), 'message':message}));
                      } else {
                        //Update activity logs
                        allActivityLog.updateActivityLogs(userProfile._id, userProfile._id, 'Subscription', message,'Account Settings')
                        res.status(200).send(resFormat.rSuccess({'subscriptionStartDate':new Date(subscriptionStartDate), 'subscriptionEndDate':new Date(subscriptionEndDate), 'message':message}));
                      }
                    })
                  }
                })
              }
            })
          }
          else{
            res.send(resFormat.rError("Transaction could not be completed. Please check the details and try again."));
          }
        }
      });
    }
  })
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
  let addOnDetails = {"_id" : objectId,
                      "chargeId" : '',
                      "currency" : '',
                      "amount" : 0,
                      "status" : 'incomplete',
                      "paymentMode" : 'online',
                      "spaceAlloted" : requestParam.spaceAlloted,
                      "spaceDimension" : 'GB',
                      "paidOn" : '',
                      "createdOn" : new Date(),
                      "createdBy" : mongoose.Types.ObjectId(requestParam._id)
                    };

  let subscriptionDetails = userProfile.subscriptionDetails
  if( subscriptionDetails && subscriptionDetails.length > 0 ) {
    currentSubscription = subscriptionDetails[(subscriptionDetails.length-1)]
    currentSubscription['addOnDetails'] = addOnDetails
    subscriptionDetails[(subscriptionDetails.length-1)] = currentSubscription
  
    User.updateOne({ _id: requestParam._id }, { $set: { stripeCustomerId : stripeCustomerId, subscriptionDetails: subscriptionDetails } }, function (err, updated) {
      if (err) {
        res.send(resFormat.rError(err))
      }
      else {
        stripe.charges.create({
          customer: stripeCustomerId,
          amount: (requestParam.amount)*100,
          currency: requestParam.currency,
          description: "Addon Charge for "+userProfile.username,
          capture: true,
          receipt_email: userProfile.username,
        }, function(err, charge) {
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
            if(charge.status == 'succeeded') {
              User.findOne({_id:userProfile._id,userType:userProfile.userType}, {}, function (err, userDetails) {
                if (err) {
                  res.status(401).send(resFormat.rError(err))
                }
                else {
                  let userSubscription = userDetails.subscriptionDetails
                  let latestSubscription = userSubscription[userSubscription.length-1]
                  let addOnDetails = {"_id" : latestSubscription['addOnDetails']['_id'],
                                      "chargeId" : charge.id,
                                      "currency" : charge.currency,
                                      "amount" : (charge.amount)/100,
                                      "status" : 'paid',
                                      "paymentMode" : 'online',
                                      "spaceAlloted" : requestParam.spaceAlloted,
                                      "spaceDimension" : 'GB',
                                      "paidOn" : new Date(),
                                      "createdOn" : latestSubscription['addOnDetails']['createdOn'],
                                      "createdBy" : latestSubscription['addOnDetails']['createdBy']
                                    };
                  latestSubscription['addOnDetails'] = addOnDetails
                  userSubscription[userSubscription.length-1] = latestSubscription
                  
                  //Update user details
                  User.updateOne({ _id: requestParam._id }, { $set: { stripeCustomerId : stripeCustomerId, subscriptionDetails: userSubscription } }, function (err, updated) {
                    if (err) {
                      res.send(resFormat.rError(err))
                    }
                    else {
                      let message = resMessage.data( 607, [{key: '{field}',val: 'Add on plan'}, {key: '{status}',val: 'added'}] )
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
                          //Update activity logs
                          allActivityLog.updateActivityLogs(userProfile._id, userProfile._id, 'Subscription AddOn', 'Addon has been added successfully.','Account Settings')
                          res.status(200).send(resFormat.rSuccess({ 'message':message }));
                        } else {
                          //Update activity logs
                          allActivityLog.updateActivityLogs(userProfile._id, userProfile._id, 'Subscription AddOn', 'Addon has been added successfully.','Account Settings')
                          res.status(200).send(resFormat.rSuccess({ 'message':message }));
                        }
                      })
                    }
                  })
                }
              })
            }
            else{
              res.send(resFormat.rError("Transaction could not be completed. Please check the details and try again."));
            }
          }
        });
      }
    })
  }
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
                let message = resMessage.data( 607, [{key: '{field}',val: 'Auto renewal status'}, {key: '{status}',val: 'updated'}] )
                allActivityLog.updateActivityLogs(userProfile._id, userProfile._id, 'Auto Renewal Status', message,'Account settings')
                res.status(200).send(resFormat.rSuccess({'autoRenewalStatus': autoRenewalStatus, 'message':message}));
              })
          });
        }
        else{
          let message = resMessage.data( 632, [] )
          res.status(401).send(resFormat.rError({'message':message}))
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
                    let message = resMessage.data( 607, [{key: '{field}',val: 'Subscription'}, {key: '{status}',val: 'canceled'}] )
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
                      //Update activity logs
                      allActivityLog.updateActivityLogs(req.body.query._id, req.body.query._id, 'Subscription Canceled', message,'Account settings')
                      res.status(200).send(resFormat.rSuccess({'subscriptionStatus': confirmation.status, 'message':message}));
                    } else {
                      //Update activity logs
                      allActivityLog.updateActivityLogs(req.body.query._id, req.body.query._id, 'Subscription Canceled', message,'Account settings')
                      res.status(200).send(resFormat.rSuccess({'subscriptionStatus': confirmation.status, 'message':message}));
                    }
                  })
                  
                })
            });
          }
          else{
            let message = resMessage.data( 633, [] )
            res.status(401).send(resFormat.rError({'message':message}))
          }
        }
        else{
          let message = resMessage.data( 632, [] )
          res.status(401).send(resFormat.rError({'message':message}))
        }
      }
      else{
        res.status(401).send(resFormat.rError({'message':'Unauthorize access'}))
      }
    }
  })
}

function getUsersListForAdminMap(req, res) {
  let { query } = req.body
  User.find( query, {}, function (err, userList) {
    if (err) {
      res.status(500).send(resFormat.rError(err))
    }
    else {
      if( userList.length > 0 ) {
        let userDetails = []
        userList.forEach( (details, index) => {
          if (details && details.zipcode && details.zipcode != '') {
            var data = zipcodes.lookup(details.zipcode);
            if( data ) {
              let userData = {userId: details._id,
                              fullname: details.firstName!= "" ? details.firstName+' '+(details.lastName != "" ? details.lastName : '') : '',
                              profileImage: '',
                              userType: details.userType,
                              address: details.addressLine1 ? details.addressLine1 + (details.city ? ', '+details.city : '') + (details.state ? ', '+details.state : '') + (details.country ? ', '+details.country : '') : '',
                              zipcode: details.zipcode,
                              business: details.businessType && details.businessType.length > 0 ? details.businessType.join(): '',
                              latitude: data.latitude,
                              longitude: data.longitude,
                              email: details.username,
                              onBoardVia: details.invitedBy && details.invitedBy != "" ? details.invitedBy : 'Self',
                              lastLogin: moment(details.lastLoggedInOn).format("YYYY-MM-DD hh:mm a")
                            }
              userDetails.push(userData)
            }
          }
        })
        res.send(resFormat.rSuccess({ userDetails }))
      }
    }
  })
}

function AddLatitudeLongitude(req, res) {
  let { query } = req.body
  User.find( query, {}, function (err, userList) {
    if (err) {
      res.status(500).send(resFormat.rError(err))
    }
    else {
      if( userList.length > 0 ) {
        let userDetails = []
        userList.forEach( (details, index) => {
          if (details && details.zipcode && details.zipcode != '') {
            calculateZipcode(details.zipcode,details._id);
          }
        })
        res.send(resFormat.rSuccess({ userDetails }))
      }
    }
  })
}

async function calculateZipcode(zipcode,id){
  var data = zipcodes.lookup(zipcode);
  if( data ) {
    if(data.latitude && data.longitude){
      let userData = await User.updateOne({_id:id},{$set:{latitude:data.latitude,longitude:data.longitude}});
    }
  }
}

function renewlegacysubscription( req, res ) {
  
  let requestParam  = req.body.query
  let param         = {query :{_id:requestParam._id, userType:requestParam.userType }}
  let { query }     = param;
  let fields        = {}
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
        //If user want to pay with new card, add card details against the user in stripe and after subscription delete card
        stripeCustomerId = customer.id
        stripe.customers.createSource(
          stripeCustomerId,
          {
            source: requestParam.token,
          },function(err, card) {
            if( err ) {
              stripeErrors( err, res )
            }
            let newStripeCardId = card.id
            
            createLegacySubscription( userProfile, stripeCustomerId, planId, requestParam, res, newStripeCardId )
        })
      }
      else{
        /**
         * create stripe account if not exists
         */
        stripe.customers.create({
          email:userProfile.username,
          description: 'Customer for '+userProfile.username,
        }, function(err, customer) {
          if( err ) {
            stripeErrors( err, res )
          }
          else{
            stripeCustomerId = customer.id
            /**
             * add new card to user stripe account
             */
            stripe.customers.createSource(
              stripeCustomerId,
              {
                source: requestParam.token,
              },function(err, card) {
                if( err ) {
                  stripeErrors( err, res )
                }
                let newStripeCardId = card.id
                createLegacySubscription( userProfile, stripeCustomerId, planId, requestParam, res, newStripeCardId )
            })
          }
        });
      }
    }
  })
}

/**
 * Apply to subscription and update the object against to user
 */
function createLegacySubscription( userProfile, stripeCustomerId, planId, requestParam, res, newStripeCardId ) {
  let subscriptions = []
  let subscriptionStatus = 'added'
  let subscriptionDetails = {"_id" : objectId,
                          "productId" : '',
                          "planId" : planId,
                          "subscriptionId" : '',
                          "startDate" : new Date(),
                          "endDate" : '',
                          "interval" : '',
                          "currency" : '',
                          "amount" : 0,
                          "status" : 'incomplete',
                          "autoRenewal": false,
                          "paymentMode" : '',
                          "planName" : '',
                          "defaultSpace" : 0,
                          "spaceDimension" : '',
                          "paidOn" : '',
                          "createdOn" : new Date(),
                          "createdBy" : mongoose.Types.ObjectId(requestParam._id)
                        };

  if( userProfile.subscriptionDetails && userProfile.subscriptionDetails.length > 0 ) {
    subscriptions = userProfile.subscriptionDetails
    subscriptionStatus = 'updated'
  }
  subscriptions.push(subscriptionDetails)
  User.updateOne({ _id: userProfile._id }, { $set: { stripeCustomerId : stripeCustomerId, subscriptionDetails : subscriptions } }, function (err, updated) {
    if (err) {
      res.send(resFormat.rError(err))
    }
    else {
      /**
       * create new subscription for user
       */
      stripe.subscriptions.create({
        customer: stripeCustomerId,
        collection_method: 'send_invoice',
        days_until_due: 30,
        items: [ 
          { plan: planId }
        ]
      }, function(err, subscription) {
        if (err) {
          stripeErrors( err, res )
        }
        else {
          /**
           * Delete newly added card from customer account once subscription payment done
           */
          stripe.customers.deleteSource(
            stripeCustomerId,
            newStripeCardId,
            function(err, confirmation) {

              if(subscription.status == 'active') {
                let subscriptionStartDate = subscription.current_period_start*1000
                let subscriptionEndDate = subscription.current_period_end*1000

                User.findOne({_id:userProfile._id,userType:userProfile.userType}, {}, function (err, userDetails) {
                  if (err) {
                    res.status(401).send(resFormat.rError(err))
                  }
                  else {
                    
                    let userSubscription = userDetails.subscriptionDetails
                    let latestSubscription = userSubscription[userSubscription.length-1]
                    let subscriptionDetails = {"_id" : latestSubscription._id,
                                              "productId" : subscription.items.data[0]['plan']['product'],
                                              "planId" : latestSubscription.planId,
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
                                              "createdOn" : latestSubscription.createdOn,
                                              "createdBy" : latestSubscription.createdBy
                                            };
                    userSubscription[userSubscription.length-1] = subscriptionDetails

                    let EmailTemplateName = "NewSubscriptionAdviser";
                    if(userDetails.userType == 'customer') {
                      EmailTemplateName = "NewSubscription";
                    }

                    if( userDetails.subscriptionDetails && userDetails.subscriptionDetails.length > 0 ) {
                      EmailTemplateName = "AutoRenewalAdviser"
                      if(userDetails.userType == 'customer') {
                        EmailTemplateName = "AutoRenewal"
                      }
                    }
                    //Update user details
                    User.updateOne({ _id: requestParam._id }, { $set: { stripeCustomerId : stripeCustomerId, subscriptionDetails : userSubscription, upgradeReminderEmailDay: [], renewalOnReminderEmailDay:[], renewalOffReminderEmailDay:[] } }, function (err, updated) {
                      if (err) {
                        res.send(resFormat.rError(err))
                      }
                      else {
                        let message = resMessage.data( 607, [{key: '{field}',val: 'Subscription'}, {key: '{status}',val: subscriptionStatus}] )
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
                            //Update activity logs
                            allActivityLog.updateActivityLogs(userProfile._id, userProfile._id, 'Subscription', message,'Account Settings')
                            res.status(200).send(resFormat.rSuccess({'subscriptionStartDate':new Date(subscriptionStartDate), 'subscriptionEndDate':new Date(subscriptionEndDate), 'message':message}));
                          } else {
                            //Update activity logs
                            allActivityLog.updateActivityLogs(userProfile._id, userProfile._id, 'Subscription', message,'Account Settings')
                            res.status(200).send(resFormat.rSuccess({'subscriptionStartDate':new Date(subscriptionStartDate), 'subscriptionEndDate':new Date(subscriptionEndDate), 'message':message}));
                          }
                        })
                      }
                    })
                  }
                })
              }
              else{
                res.send(resFormat.rError("Transaction could not be completed. Please check the details and try again."));
              }
            }//delete card callback function block ends
          )//delete card block ends
        }
      });// create subscription block ends
    }
  })
}

function stripeErrors( err, res ) {
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

function logout( req, res) {
  let { fromId } = req.body,
      { userType } = req.body
  let activity = 'User Logout',
      message  = resMessage.data( 607, [{key: '{field}',val: userType.toUpperCase()}, {key: '{status}',val: 'logout'}] )
  allActivityLog.updateActivityLogs(fromId, fromId, activity, message )
  res.send(resFormat.rSuccess(message))
}

router.post("/getuserslistforadminmap",getUsersListForAdminMap);
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
router.post("/latitudeLongitude", AddLatitudeLongitude);
router.post(["/renewlegacysubscription"], renewlegacysubscription);
router.post("/logout", logout)
/*router.get(["/view/:id", "/:id"], details)*/

module.exports = router