var express   = require('express')
var router    = express.Router()
var async     = require('async')
const constants =  require('./../config/constants')
const stripe  = require("stripe")(constants.stripeSecretKey);
const User    = require('./../models/Users')
var moment    = require('moment');
const today   = moment().toDate()
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
var currencyFormatter     = require('currency-formatter');
const mongoose = require('mongoose')
const advertisement = require('./../models/advertisements.js')
var objectId = mongoose.Types.ObjectId();
const HiredAdvisors = require('./../models/HiredAdvisors')
const trust = require('./../models/Trustee.js')
var FreeTrailPeriodSetting = require('./../models/FreeTrialPeriodSettings')
const allActivityLog = require('./../helpers/allActivityLogs')
async function getSelectedPlanDetails( planId ) {
  return await stripe.plans.retrieve( planId );
}

function autoRenewalOnUpdateSubscription ( req, res ) {
  let requestParam = req.body
  if( requestParam != null || requestParam.length >0 ) {
    let eventId = requestParam.id
    let eventType = requestParam.type

    if( eventType == 'invoice.payment_succeeded' ) {
      let returnData =  requestParam.data.object
      let stripeCustomerId = returnData.customer
      let customer_email = returnData.customer_email
      let autoRenewalUpdate = returnData.collection_method
      
      if( autoRenewalUpdate == 'charge_automatically' ) {
                
        let subscriptionData = returnData.lines.data
        User.find( { username: customer_email, stripeCustomerId:stripeCustomerId }, {}, function (err, userData) {
          
          if( !err && userData.length > 0 ) {
            let userProfile = userData[0]
            
            if( subscriptionData[0]['type'] == 'subscription' ) {

              let checkWhetherAddOn = false,
                  newRequestParam = {},
                  isAddOnPurchase

              var currentDate  = new Date();
              var currentSubscriptionEndDate = ''//new Date(subscriptionData[0]['period']['start']*1000);
              let updateuser = false
              let subscriptionDetails   = userProfile.subscriptionDetails ? userProfile.subscriptionDetails : null
              if( subscriptionDetails != null && subscriptionDetails.length > 0 ) {

                if( userProfile.userType == 'customer' ) {
                  isAddOnPurchase    = subscriptionDetails[subscriptionDetails.length - 1]['addOnDetails']
                  checkWhetherAddOn  = isAddOnPurchase ? true : false
                }

                subscriptionEndDate   = subscriptionDetails[(subscriptionDetails.length-1)]['endDate']
                subscriptionStatus    = subscriptionDetails[(subscriptionDetails.length-1)]['status']
                currentSubscriptionEndDate = new Date(subscriptionEndDate)
                if( subscriptionStatus != 'canceled' && currentSubscriptionEndDate < currentDate ) {
                  updateuser = true
                }
              }
              
              if( updateuser ) {

                if( userProfile.userType == 'customer' && checkWhetherAddOn ) {
                  newRequestParam = isAddOnPurchase ? 
                                      { _id: userProfile._id,
                                        userType: userProfile.userType,
                                        currency: isAddOnPurchase.currency,
                                        amount: subscriptionData[0]['plan']['metadata']['addOnCharges'],
                                        spaceAlloted: isAddOnPurchase.spaceAlloted
                                      } : {}
                }
                let subscriptionEndDateNew = new Date(subscriptionData[0]['period']['end']*1000);
                
                let subscriptionDetails = {"_id" : objectId,
                                            "productId" : subscriptionData[0]['plan']['product'],
                                            "planId" : subscriptionData[0]['plan']['id'],
                                            "subscriptionId" : subscriptionData[0]['subscription'],
                                            "startDate" : new Date(subscriptionData[0]['period']['start']*1000),
                                            "endDate" : new Date(subscriptionData[0]['period']['end']*1000),
                                            "interval" : subscriptionData[0]['plan']['interval'],
                                            "currency" : subscriptionData[0]['plan']['currency'],
                                            "amount" : subscriptionData[0]['plan']['amount'] / 100,
                                            "status" : 'paid',
                                            "autoRenewal": autoRenewalUpdate == 'charge_automatically' ? true : false,
                                            "paymentMode" : 'online',
                                            "planName" : subscriptionData[0]['plan']['metadata']['name']+' Plan',
                                            "defaultSpace" : subscriptionData[0]['plan']['metadata']['defaultSpace'],
                                            "spaceDimension" : subscriptionData[0]['plan']['metadata']['spaceDimension'],
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
                //console.log("userFullName",userProfile.firstName ? userProfile.firstName+' '+ (userProfile.lastName ? userProfile.lastName:'') : '',"email: -",userProfile.username,  "created on :-",userProfile.createdOn);
                //Update user details
                User.updateOne({ _id: userProfile._id }, { $set: { userSubscriptionEnddate : new Date(subscriptionEndDateNew),subscriptionDetails : userSubscription, upgradeReminderEmailDay: [], renewalOnReminderEmailDay:[], renewalOffReminderEmailDay:[] } }, async function (err, updated) {
                  if (err) {
                    res.send(resFormat.rError(err))
                  }
                  else {
                    let userDetails = await User.find( { username: customer_email, stripeCustomerId:stripeCustomerId })
                    //subscription purchased email template
                    emailTemplatesRoute.getEmailTemplateByCode(EmailTemplateName).then((template) => {
                      if(template) {
                        template = JSON.parse(JSON.stringify(template));
                        let body = template.mailBody.replace("{full_name}", userProfile.firstName ? userProfile.firstName+' '+ (userProfile.lastName ? userProfile.lastName:'') : '');
                        body = body.replace("{plan_name}",subscriptionDetails.planName);
                        body = body.replace("{amount}", currencyFormatter.format(subscriptionDetails.amount, { code: (subscriptionDetails.currency).toUpperCase() }));
                        body = body.replace("{duration}",subscriptionDetails.interval);
                        body = body.replace("{paid_on}",subscriptionDetails.paidOn);
                        body = body.replace("{start_date}",subscriptionDetails.startDate);
                        body = body.replace("{end_date}",subscriptionDetails.endDate);
                        if(userProfile.userType == 'customer') {
                          body = body.replace("{space_alloted}",subscriptionDetails.defaultSpace+' '+subscriptionDetails.spaceDimension);
                          if(subscriptionData.items && subscriptionData.items.data){ //added by PK
                            body = body.replace("{more_space}", subscriptionData.items.data[0]['plan']['metadata']['addOnSpace']+' '+subscriptionDetails.spaceDimension);
                          }
                        }
                        body = body.replace("{subscription_id}",subscriptionDetails.subscriptionId);
                        const mailOptions = {
                          to : userProfile.username,
                          subject : template.mailSubject,
                          html: body
                        }
                        sendEmail(mailOptions)
                        console.log("email sent")
                        if( userProfile.userType == 'customer' && checkWhetherAddOn ) {
                          chargeForAddon( userDetails, stripeCustomerId, newRequestParam, res )
                        }
                        else{
                          res.json({received: true});
                        }
                      } else {
                        console.log("email sent")
                        if( userProfile.userType == 'customer' && checkWhetherAddOn ) {
                          chargeForAddon( userDetails, stripeCustomerId, newRequestParam, res )
                        }
                        else{
                          res.json({received: true});
                        }
                      }
                    })
                  }
                })
              }
            }
          }
        })
      }
    }
  }
}


/**
 * Request from customer itself - Apply to addon plan and update the latest subscription object against to user
 * @param {*} userProfile 
 * @param {*} stripeCustomerId 
 * @param {*} requestParam 
 * @param {*} res 
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
            stripeErrors( err, res )
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
                          //allActivityLog.updateActivityLogs(userProfile._id, userProfile._id, 'Subscription AddOn', 'Addon has been auto renewed successfully.','Account Settings')
                          res.json({received: true});
                        } else {
                          //Update activity logs
                          //allActivityLog.updateActivityLogs(userProfile._id, userProfile._id, 'Subscription AddOn', 'Addon has been auto renewed successfully.','Account Settings')
                          res.json({received: true});
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

function updateSubscriptionDetailsIfFails ( req, res ) {
  let requestParam = req.body
  if( requestParam != null || requestParam.length >0 ) {
    let eventId = requestParam.id
    let eventType = requestParam.type

    if( eventType == 'customer.subscription.created' ) {
      let returnData =  requestParam.data.object
      let customerId = returnData.customer
      
      if( returnData.object == 'subscription' ) {
        User.find( { stripeCustomerId: customerId }, {}, function (err, userData) {
          let subscriptionData = returnData.items.data      
          if( !err && userData.length > 0 ) {
            let userProfile = userData[0]
            let updateSubscription = false
            let usersSubscription = userProfile.subscriptionDetails ? userProfile.subscriptionDetails : null
            let latestSubscription  = []
            if( usersSubscription != null && usersSubscription.length > 0 ) {
              latestSubscription = usersSubscription[(usersSubscription.length-1)]
              subscriptionStatus = latestSubscription['status']
              if( subscriptionStatus == 'incomplete' ) {
                updateSubscription = true
              }
            }
              
            if( updateSubscription ) {
              let subscriptionDetails = {"_id" : latestSubscription['_id'],
                                          "productId" : subscriptionData[0]['plan']['product'],
                                          "planId" : subscriptionData[0]['plan']['id'],
                                          "subscriptionId" : subscriptionData[0]['subscription'],
                                          "startDate" : new Date(returnData.current_period_start*1000),
                                          "endDate" : new Date(returnData.current_period_end*1000),
                                          "interval" : subscriptionData[0]['plan']['interval'],
                                          "currency" : subscriptionData[0]['plan']['currency'],
                                          "amount" : subscriptionData[0]['plan']['amount'] / 100,
                                          "status" : 'paid',
                                          "autoRenewal": returnData.collection_method == 'charge_automatically' ? true : false,
                                          "paymentMode" : 'online',
                                          "planName" : subscriptionData[0]['plan']['metadata']['name']+' Plan',
                                          "defaultSpace" : subscriptionData[0]['plan']['metadata']['defaultSpace'],
                                          "spaceDimension" : subscriptionData[0]['plan']['metadata']['spaceDimension'],
                                          "paidOn" : new Date(),
                                          "createdOn" : latestSubscription['createdOn'],
                                          "createdBy" : latestSubscription['createdBy']
                                        };
              usersSubscription[(usersSubscription.length-1)] = subscriptionDetails
              let userSubscription = usersSubscription
              let EmailTemplateName = "NewSubscriptionAdviser";
              if(userProfile.userType == 'customer') {
                EmailTemplateName = "NewSubscription";
              }
        
              if( userProfile.subscriptionDetails && userProfile.subscriptionDetails.length > 1 ) {
                //userSubscription = userProfile.subscriptionDetails
                EmailTemplateName = "AutoRenewalAdviser"
                if(userProfile.userType == 'customer') {
                  EmailTemplateName = "AutoRenewal"
                }
              }
              //console.log("usersSubscription",usersSubscription)
              //return false;
              //Update user details
              User.updateOne({ _id: userProfile._id }, { $set: { subscriptionDetails : usersSubscription, upgradeReminderEmailDay: [], renewalOnReminderEmailDay:[], renewalOffReminderEmailDay:[] } }, function (err, updated) {
                if (err) {
                  res.send(resFormat.rError(err))
                }
                else {
                  //subscription purchased email template
                  emailTemplatesRoute.getEmailTemplateByCode(EmailTemplateName).then((template) => {
                    if(template) {
                      template = JSON.parse(JSON.stringify(template));
                      let body = template.mailBody.replace("{full_name}", userProfile.firstName ? userProfile.firstName+' '+ (userProfile.lastName ? userProfile.lastName:'') : '');
                      body = body.replace("{plan_name}",subscriptionDetails.planName);
                      body = body.replace("{amount}", currencyFormatter.format(subscriptionDetails.amount, { code: (subscriptionDetails.currency).toUpperCase() }));
                      body = body.replace("{duration}",subscriptionDetails.interval);
                      body = body.replace("{paid_on}",subscriptionDetails.paidOn);
                      body = body.replace("{start_date}",subscriptionDetails.startDate);
                      body = body.replace("{end_date}",subscriptionDetails.endDate);
                      if(userProfile.userType == 'customer') {
                        body = body.replace("{space_alloted}",subscriptionDetails.defaultSpace+' '+subscriptionDetails.spaceDimension);
                        body = body.replace("{more_space}", subscriptionData[0]['plan']['metadata']['addOnSpace']+' '+subscriptionDetails.spaceDimension);
                      }
                      body = body.replace("{subscription_id}",subscriptionDetails.subscriptionId);
                      
                      const mailOptions = {
                        to : userProfile.username,
                        subject : template.mailSubject,
                        html: body
                      }
                      
                      sendEmail(mailOptions)
                      console.log("email sent")
                      res.json({received: true});
                    } else {
                      console.log("email sent")
                      res.json({received: true});
                    }
                  })
                }
              })
            }
            else{
              res.json({received: true});
            }
          }
        })
      }
    }
  }
}

function autoRenewalOnReminderEmail() {
  User.aggregate([
    {
      $project: {
        createdOn: 1, username:1, firstName:1,lastName:1,renewalOnReminderEmailDay:1,userType:1,
        subscriptionDetails: {$arrayElemAt: ["$subscriptionDetails", -1]},
      }
    },
    {
      $match: {"subscriptionDetails.autoRenewal": true,"subscriptionDetails.status": "paid"}
    }
  ], async function(err,userList) {
    if( !err && userList ) {
      if( userList.length > 0 ) {
        let customerProductDetails= await getSelectedPlanDetails( 'C_YEARLY');
        let customerPlanDetails   = { amount: customerProductDetails.amount / 100,
                                      planInterval: customerProductDetails.interval,
                                      planName: customerProductDetails.metadata.name+' Plan',
                                      planAmount: currencyFormatter.format( (customerProductDetails.amount/100), { code: (customerProductDetails.currency).toUpperCase() }),
                                      defaultSpace: customerProductDetails.metadata.defaultSpace+' '+customerProductDetails.metadata.spaceDimension
                                    }
        let advisorProductDetails = await getSelectedPlanDetails( 'A_MONTHLY');
        let advisorPlanDetails    = { amount: advisorProductDetails.amount / 100,
                                      planInterval: advisorProductDetails.interval,
                                      planName: advisorProductDetails.metadata.name+' Plan',
                                      planAmount: currencyFormatter.format( (advisorProductDetails.amount/100), { code: (advisorProductDetails.currency).toUpperCase() })
                                    }

        userList.forEach( ( val, index ) => {
          let subscriptionDetails   = val.subscriptionDetails,
              daysRemainingToExpire = Math.abs(getDateDiff( today, moment(subscriptionDetails.endDate).toDate(), 'asHours' ))
          
          if ( daysRemainingToExpire > 0 ) {
            let userCreatedOn = val.createdOn,
                userId        = val._id,
                userEmailId   = val.username;
            let userFullName  = val.firstName ? val.firstName+' '+(val.lastName ? val.lastName : '') : 'User';
                
            let sendEmailReminder         = false,
                whichDayEmailReminderSend = null,
                freeAccessRemainingDays   = 0;
            
            //If the auto-payment option is On, the system will send reminder notifications on the user’s email (1 day) before renewal date
            if( daysRemainingToExpire > 0 && daysRemainingToExpire <= 1 && !val.renewalOnReminderEmailDay.includes(1) ) {
              //reminder before 1day of premium access expires
              sendEmailReminder         = true
              whichDayEmailReminderSend = 1
              freeAccessRemainingDays   = '1 day'
            }
            
            //console.log("userFullName",userFullName,"email: -",val.username,  "created on :-",val.createdOn,  'freePremiumAccessRemainDays:- ',daysRemainingToExpire ,"reminder:-",whichDayEmailReminderSend);
            //send email reminder if above conditions true
            if( sendEmailReminder && whichDayEmailReminderSend != null ) {
              let reminderSentDays = []
              if( val.renewalOnReminderEmailDay ) {
                reminderSentDays = val.renewalOnReminderEmailDay
              }
              reminderSentDays.push(whichDayEmailReminderSend)
              
              //free premium plan expiry plan reminer email
              emailTemplatesRoute.getEmailTemplateByCode('autoRenewalOnReminderEmail').then( (template) => {
                if(template) {
                  let planData = {}
                  if( val.userType == 'customer' ) {
                    planData = customerPlanDetails
                  }
                  else{
                    planData = advisorPlanDetails
                  }
                  template = JSON.parse(JSON.stringify(template));
                  let body = template.mailBody.replace("{full_name}", userFullName);
                      body = body.replace("{renewal_date}", new Date(subscriptionDetails.endDate));
                      body = body.replace("{amount}", planData.planAmount);
                      body = body.replace("{duration}", planData.planInterval);
                      

                  const mailOptions = { to : userEmailId,
                                        subject : template.mailSubject,
                                        html: body
                                      }
                  sendEmail( mailOptions, (response) => {
                    if( response ) {
                      User.updateOne({ _id: val._id }, { $set: { renewalOnReminderEmailDay: reminderSentDays } }, function (err, updated) {
                        if ( !err ) {
                          console.log("updated")
                        }
                      })
                    }
                  })
                }
              })
            }
          }
        })
      }
    }
  })
}

function autoRenewalOffReminderEmail() {
  User.aggregate([
    {
      $project: {
        createdOn: 1, username:1, firstName:1,lastName:1,renewalOffReminderEmailDay:1,userType:1,
        subscriptionDetails: {$arrayElemAt: ["$subscriptionDetails", -1]},
      }
    },
    {
      $match: {"subscriptionDetails.autoRenewal": false, "subscriptionDetails.status": "paid"}
    }
  ], async function(err,userList) {
    if( !err && userList ) {
      if( userList.length > 0 ) {
        let customerProductDetails= await getSelectedPlanDetails( 'C_YEARLY');
        let customerPlanDetails   = { amount: customerProductDetails.amount / 100,
                                      planInterval: customerProductDetails.interval,
                                      planName: customerProductDetails.metadata.name+' Plan',
                                      planAmount: currencyFormatter.format( (customerProductDetails.amount/100), { code: (customerProductDetails.currency).toUpperCase() }),
                                      defaultSpace: customerProductDetails.metadata.defaultSpace+' '+customerProductDetails.metadata.spaceDimension
                                    }
        let advisorProductDetails = await getSelectedPlanDetails( 'A_MONTHLY');
        let advisorPlanDetails    = { amount: advisorProductDetails.amount / 100,
                                      planInterval: advisorProductDetails.interval,
                                      planName: advisorProductDetails.metadata.name+' Plan',
                                      planAmount: currencyFormatter.format( (advisorProductDetails.amount/100), { code: (advisorProductDetails.currency).toUpperCase() })
                                    }

        userList.forEach( ( val, index ) => {
          let subscriptionDetails   = val.subscriptionDetails,
              daysRemainingToExpire = Math.abs(getDateDiff( today, moment(subscriptionDetails.endDate).toDate() , 'asHours' ))
          
          if ( daysRemainingToExpire > 0 ) {
            let userCreatedOn = val.createdOn,
                userId        = val._id,
                userEmailId   = val.username,
                userFullName  = val.firstName ? val.firstName+' '+(val.lastName ? val.lastName : '') : 'User';
                
            let sendEmailReminder         = false,
                whichDayEmailReminderSend = null,
                freeAccessRemainingDays   = 0;
            
            //If the auto-payment option is OFF, the system will send reminder notifications on the user’s email (30 days, 7 days, 3 days, 1 day) before expiring plan date
            if( val.userType == 'customer' && daysRemainingToExpire <= 30 && daysRemainingToExpire > 29 && !val.renewalOffReminderEmailDay.includes(30) ) {
              //reminder before 30days of premium access expires
              sendEmailReminder         = true
              whichDayEmailReminderSend = 30
              freeAccessRemainingDays   = '30 days'
            }
            if( daysRemainingToExpire <= 7 && daysRemainingToExpire > 6 && !val.renewalOffReminderEmailDay.includes(7) ) {
              //reminder before 7days of premium access expires
              sendEmailReminder         = true
              whichDayEmailReminderSend = 7
              freeAccessRemainingDays   = '7 days'
            }
            if( daysRemainingToExpire <= 3 && daysRemainingToExpire > 2 && !val.renewalOffReminderEmailDay.includes(3) ) {
              //reminder before 3days of premium access expires
              sendEmailReminder         = true
              whichDayEmailReminderSend = 3
              freeAccessRemainingDays   = '3 days'
            }
            if( daysRemainingToExpire <= 1 && daysRemainingToExpire > 0 && !val.renewalOffReminderEmailDay.includes(1) ) {
              //reminder before 1day of premium access expires
              sendEmailReminder         = true
              whichDayEmailReminderSend = 1
              freeAccessRemainingDays   = '1 day'
            }
            
            //console.log("userFullName",userFullName,"email: -",val.username,  "created on :-",val.createdOn, 'daysRemainingToExpire:-',daysRemainingToExpire, 'freePremiumAccessRemainDays:- ',freeAccessRemainingDays ,"reminder:-",whichDayEmailReminderSend);
            //send email reminder if above conditions true
            if( sendEmailReminder && whichDayEmailReminderSend != null ) {
              let reminderSentDays = []
              if( val.renewalOffReminderEmailDay ) {
                reminderSentDays = val.renewalOffReminderEmailDay
              }
              reminderSentDays.push(whichDayEmailReminderSend)
              
              //free premium plan expiry plan reminer email
              emailTemplatesRoute.getEmailTemplateByCode('autoRenewalOffReminderEmail').then( (template) => {
                if(template) {
                  let planData = {}
                  if( val.userType == 'customer' ) {
                    planData = customerPlanDetails
                  }
                  else{
                    planData = advisorPlanDetails
                  }
                
                  template = JSON.parse(JSON.stringify(template));
                  let body = template.mailBody.replace("{full_name}", userFullName);
                      body = body.replace("{expiring_date}", new Date(subscriptionDetails.endDate));
                      body = body.replace("{amount}", planData.planAmount);
                      body = body.replace("{duration}", planData.planInterval);

                  const mailOptions = { to : userEmailId,
                                        subject : template.mailSubject,
                                        html: body
                                      }
                  sendEmail(mailOptions, (response) => {
                    if( response ) {
                      User.updateOne({ _id: val._id }, { $set: { renewalOffReminderEmailDay: reminderSentDays } }, function (err, updated) {
                        if ( !err ) {
                          console.log("updated")
                        }
                      })
                    }
                  })
                }
              })
            }
          }
        })
      }
    }
  })
}

function beforeSubscriptionReminderEmail() {
  User.find( { 'subscriptionDetails': { $exists: false }, 'userType': 'customer' }, {}, async function(err, userList) {
    if( !err && userList ) {
      let productDetails= await getSelectedPlanDetails( 'C_YEARLY');
      let amount        = productDetails.amount / 100,
          planInterval  = productDetails.interval,
          planName      = productDetails.metadata.name+' Plan',
          planAmount    = currencyFormatter.format( amount, { code: (productDetails.currency).toUpperCase() }),
          defaultSpace  = productDetails.metadata.defaultSpace+' '+productDetails.metadata.spaceDimension;

      userList.forEach( ( val, index ) => {
        
        let userCreatedOn = val.createdOn,
            userId        = val._id,
            userEmailId   = val.username,
            userFullName  = val.firstname ? val.firstname+' '+(val.lastname ? val.lastname : '') : 'User',
            today         = moment().toDate(),
            diff          = Math.round( getDateDiff( moment(userCreatedOn).toDate(), today, 'asHours' ));

        let freePremiumAccessRemainDays = Math.abs( diff - 24 ), //The first time registered customer gets free access to all premium features for 30 days
            sendEmailReminder           = false,
            whichDayEmailReminderSend   = null,
            freeAccessRemainingDays     = 0;
        
        //The system will send reminder notifications on the customer’s email (7 days, 3 days, 1 day before free trial expiry date)
        if( freePremiumAccessRemainDays <= 7 && freePremiumAccessRemainDays > 6 && !val.upgradeReminderEmailDay.includes(7) ) {
          //reminder before 7days of free premium access expires
          sendEmailReminder       = true
          whichDayEmailReminderSend  = 7
          freeAccessRemainingDays = '7 days'
        }
        else if( freePremiumAccessRemainDays <= 3 && freePremiumAccessRemainDays > 2 && !val.upgradeReminderEmailDay.includes(3) ) {
          //reminder before 3days of free premium access expires
          sendEmailReminder       = true
          whichDayEmailReminderSend  = 3
          freeAccessRemainingDays = '3 days'
        }
        else if( freePremiumAccessRemainDays <= 1 && freePremiumAccessRemainDays > 0 && !val.upgradeReminderEmailDay.includes(1) ) {
          //reminder before 1day of free premium access expires
          sendEmailReminder       = true
          whichDayEmailReminderSend  = 1
          freeAccessRemainingDays = '1 day'
        }
        //console.log("userType",val.userType,"email: -",val.username,  "created on :-",val.createdOn,  " date diff:-",diff, 'freePremiumAccessRemainDays:- ',freePremiumAccessRemainDays ,"reminder:-",whichDayEmailReminderSend);
        //send email reminder if above conditions true
        if( sendEmailReminder && whichDayEmailReminderSend != null ) {
          let reminderSentDays = []
          if( val.upgradeReminderEmailDay ) {
            reminderSentDays = val.upgradeReminderEmailDay
          }
          reminderSentDays.push(whichDayEmailReminderSend)
          emailTemplatesRoute.getEmailTemplateByCode('beforeSubscriptionReminderEmail').then( (template) => {
            if(template) {
              template = JSON.parse(JSON.stringify(template));
              let body = template.mailBody.replace("{full_name}", userFullName);
                  body = body.replace("{plan_name}",planName);
                  body = body.replace("{amount}", planAmount);
                  body = body.replace("{duration}",planInterval);
                  body = body.replace("{space_alloted}",defaultSpace);
                  body = body.replace("{remaining_days}",freeAccessRemainingDays);

              const mailOptions = { to : userEmailId,
                                    subject : template.mailSubject,
                                    html: body
                                  }
              sendEmail(mailOptions, (response )=> {
                if( response ) {
                  User.updateOne({ _id: val._id }, { $set: { upgradeReminderEmailDay: reminderSentDays } }, function (err, updated) {
                    if ( !err ) {
                      console.log("updated")
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
}

/**
 * return date difference in days
 * @param startDate 
 * @param endDate 
 */
function getDateDiff( startDate, endDate, returnAs=null ) {
  if( returnAs == 'asHours') {
    return moment.duration( 
      moment(endDate).diff( moment(startDate) ) 
    ).asHours()  
  }
  else if(returnAs == 'asDays') {
    return moment.duration( 
      moment(endDate).diff( moment(startDate) ) 
    ).asDays()
  }
  else{
    return moment.duration( 
      moment(endDate).diff( moment(startDate) ) 
    ).asMonths()
  }
}


async function deceasedCustomers(req, res){
  let message = 'Mark as deceased by cron job hit working';
  allActivityLog.updateActivityLogs('5d08f91a8d5c2e0cfcd8aad0', '5d08f91a8d5c2e0cfcd8aad0', 'Mark As Deceased cron job', message)
  await User.find({'deceased':{$ne:null},'deceased.status':{$ne:'Active'},'lockoutLegacyDate':{$ne:null}},{}, async function (err, result) {
    if (err) {
      res.status(500).send(resFormat.rError(err))
    } else if (result) {     
      if(result.length>0){
         result.forEach( async (key,index) => {   
        if(new Date(key.lockoutLegacyDate) < new Date()) {
          let OldDeceasedinfo = key.deceased.deceasedinfo;
          let deceasedArray = {'status':'Active','trusteeCnt':key.deceased.trusteeCnt,'advisorCnt':key.deceased.advisorCnt,deceasedinfo:OldDeceasedinfo};
           await User.updateOne({_id:key._id},{deceased:deceasedArray});
           let message = 'Mark as deceased by cron job';
           allActivityLog.updateActivityLogs(key._id, key._id, 'Mark As Deceased cron job', message)
        }
      });
     }
    }
  })

}

/*
After customer deceased and subscription expire 90 free access for trustee, advisors then system sent and email to executor.
*/
async function deceasedCustomersReminders(req, res){
  let message = 'Mark as deceased reminders by cron job hit working';
  //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',message)
  allActivityLog.updateActivityLogs('5d08f91a8d5c2e0cfcd8aad0', '5d08f91a8d5c2e0cfcd8aad0', 'Mark As Deceased Reminders cron job', message);

  await User.find({'userType':"customer",'deceased':{$ne:null},'deceased.status':'Active',status:'Active'},{_id:1,username:1,firstName:1,lastName:1,subscriptionDetails:1,createdOn:1}, async function (err, result) {
    if (err) {
      res.status(500).send(resFormat.rError(err))
    } else if (result) {     
     if(result.length>0){
         result.forEach( async (key,index) => {   
          let deceasedEmail = key.username;let deceasedFullName = key.firstName+' '+key.lastName;
          var currentDate  = new Date();
          var currentSubscriptionEndDate = '';
          let updateuser = false
          let subscriptionDetails   = key.subscriptionDetails ? key.subscriptionDetails : null;
       
          if( subscriptionDetails != null && subscriptionDetails.length > 0 ) {
              isAddOnPurchase    = subscriptionDetails[subscriptionDetails.length - 1]['addOnDetails']
              checkWhetherAddOn  = isAddOnPurchase ? true : false
              subscriptionEndDate   = subscriptionDetails[(subscriptionDetails.length-1)]['endDate'];
              subscriptionStatus    = subscriptionDetails[(subscriptionDetails.length-1)]['status']
              currentSubscriptionEndDate = new Date(subscriptionEndDate)
              if( subscriptionStatus != 'canceled' && currentSubscriptionEndDate < currentDate ) {
                updateuser = true
              }
          }else{  //Never subscribe
            updateuser = true;                           
            let FreeTrail = await FreeTrailPeriodSetting.findOne({}, {});
            let start = moment(key.createdOn, 'YYYY-MM-DD');         
            var timestamp = start.add(FreeTrail.customerFreeAccessDays, 'days');
            currentSubscriptionEndDate = new Date(timestamp);    
            if(currentSubscriptionEndDate < currentDate){
              updateuser = true
            }        
          }
         
        if(updateuser){
            let exAccDays = 90;
            let start = moment(currentSubscriptionEndDate,'YYYY-MM-DD');
            var timestamp = start.add(exAccDays, 'days');
            var AfterExAccDays = new Date(timestamp); //After  90 days date
            if(AfterExAccDays > currentDate) {
             for(var i=0;i<=12;i++) {
              if ((i % 2) === 0) {
                if(i>0) {
                  m = moment(currentSubscriptionEndDate,'YYYY-MM-DD');
                  var timestamp2 = m.add(i, 'week');
                  var weekDate = new Date(timestamp2,'YYYY-MM-DD');
                  let todayDate = new Date('','YYYY-MM-DD');
                  if(AfterExAccDays>weekDate && todayDate==weekDate) {
                    let subscriptionEndDate =  moment(currentSubscriptionEndDate);
                    let AfterExAccDate = moment(AfterExAccDays);
                      let executor = await HiredAdvisors.findOne({_id:ObjectId(key._id),'executorStatus':'Active'},{_id:1,username:1,firstName:1,lastName:1});  
                    // testing  let executor = await User.findOne({_id:ObjectId("5cf60d6525b0a12c70d8bae5")},{_id:1,username:1,firstName:1,lastName:1});  
                      if(!executor){
                        executor = await trust.findOne({_id:ObjectId(key._id),'executorStatus':'Active'},{_id:1,username:1,firstName:1,lastName:1});
                      }
                      if(executor){
                        console.log('executor',executor)
                        message = deceasedFullName+' deceased and his executor is '+executor.username+' by cron job ';
                        allActivityLog.updateActivityLogs(key._id, key._id, 'Mark As Deceased executor cron job', message)

                        await sendingMail('DeceasedRemiderEmailToExecutor',executor.username,executor.firstName,deceasedEmail,deceasedFullName,subscriptionEndDate,AfterExAccDate);
                      }else{//send mail to admin to inform deceased user scrscription date and deceased user didn't have any executor
                   
                      message = deceasedFullName+' deceased  and have not executor by cron job ';
                      allActivityLog.updateActivityLogs(key._id, key._id, 'Mark As Deceased executor cron job', message)
                   
                      let adminUSer = await User.find({userType:"sysadmin","sectionAccess.deceasedrequest":"fullaccess"},{_id:1,firstName:1,lastName:1,username:1});
                          adminUSer.forEach( async (row,index) => {   
                            await sendingMail('DeceasedRemiderEmailToAdmin',row.username,row.firstName,deceasedEmail,deceasedFullName,subscriptionEndDate,AfterExAccDate);
                          });
                      }
                      //res.send(resFormat.rSuccess({"Meesage":"123","Executor":executor,"EndDate":currentSubscriptionEndDate}))
                  }
                }
              }               
            }//weekly For loop
          }//Accound should be close for these customers.          
          //   res.send(resFormat.rSuccess({"Meesage":"1234566768"}))
          }     
        });
      }else{
        console.log('Record not found')  
      }
    }
  })

  res.send(resFormat.rSuccess({"Meesage":""}))
}


function sendingMail(templateCode,emailId,toName,deceasedEmail,deceasedFullName,currentSubscriptionEndDate,AfterExAccDays) {
  let serverUrl = constants.clientUrl + "/signin";
  let adminEmail = 'support@legacylifeplans.com';
 
  emailTemplatesRoute.getEmailTemplateByCode(templateCode).then((template) => {
    if (template) {
      template = JSON.parse(JSON.stringify(template));
      let body = template.mailBody.replace("{ToFname}",toName);
      body = body.replace("{LegacyHolderName}",deceasedFullName);
      body = body.replace("{SubscriptionExpireDate}",currentSubscriptionEndDate);
      body = body.replace("{CloseAccountDate}",AfterExAccDays);
      body = body.replace("{adminEmail}",adminEmail);
      body = body.replace("{deceasedEmail}",deceasedEmail);
      body = body.replace("{SERVER_LINK}",serverUrl);
      const mailOptions = {
        to: emailId,
        subject: template.mailSubject,
        html: body
      }
      sendEmail(mailOptions);
     return true;
    } else {
      return false;
    }
  })
}

async function featuredAdvisorFromDate(req, res){
  let AdvData = await advertisement.find({status:"Active",sponsoredStatus:'Pending',"adminReply.status": "Done"},{_id:1,customerId:1,fromDate:1,toDate:1,status:1,zipcodes:1,adminReply:1});
 
  if(AdvData.length>0){
      AdvData.forEach( async (key,index) => {   
      let dates = key.fromDate.toISOString().substring(0, 10);
  
      if(new Date(dates) <= new Date()){            
        let message = key;
        let newArray = [];
        let UserData = await User.findOne({_id:key.customerId},{_id:1,username:1,firstName:1,lastName:1,sponsoredAdvisor:1,status:1,sponsoredZipcodes:1});
        if(UserData){
              let replyData = key.adminReply.map(function (keys, index) {
                if(keys.status=='Done') {
                  if(UserData.sponsoredZipcodes) {
                    return keys.zipcodes.concat(UserData.sponsoredZipcodes);
                  }else{
                    return keys.zipcodes;
                  }
                }
              });            
              if(replyData[0]){
                newArray = replyData[0];
              }else{
                newArray = replyData;
              }
             await User.updateOne({_id:key.customerId},{sponsoredAdvisor:'yes',sponsoredZipcodes:newArray});
             await advertisement.updateOne({_id:key._id},{sponsoredStatus:'Active'});
        }
        //res.send(resFormat.rSuccess({AdvData,message,UserData,newArray}));
      }
    });
  }
}

async function featuredAdvisorEndDate(req, res){
  let AdvData = await advertisement.find({sponsoredStatus:'Active'},{_id:1,customerId:1,fromDate:1,toDate:1,status:1,zipcodes:1,adminReply:1});
  if(AdvData.length>0){
      AdvData.forEach( async (key,index) => {   
      let endDate = key.toDate.toISOString().substring(0, 10);
      let todayDate = new Date(); 
       todayDate = todayDate.toISOString().substring(0, 10);
      if(endDate < todayDate){      
        let UserData = await User.findOne({_id:key.customerId},{_id:1,username:1,firstName:1,lastName:1,sponsoredAdvisor:1,status:1,sponsoredZipcodes:1});
        if(UserData){
             await User.updateOne({_id:key.customerId},{sponsoredAdvisor:'no',sponsoredZipcodes:[]});
             await advertisement.updateOne({_id:key._id},{sponsoredStatus:'Expired',status:'Expired'});
        }
      }
    });
  }
}

async function featuredAdvisorReminder(req, res){
  let AdvData = await advertisement.find({sponsoredStatus:'Active'},{_id:1,customerId:1,fromDate:1,toDate:1,status:1,zipcodes:1,adminReply:1,remiderMailstatus:1});
  if(AdvData.length>0){
      AdvData.forEach( async (key,index) => {   
        let daysToExpire =  ''; let mailSentStatus = 'no';var days = '';
      let userData = await User.findOne({_id:key.customerId,sponsoredAdvisor:'yes'},{username:1,firstName:1,lastName:1});
      if(userData){
             daysToExpire = getDateDiff(today, moment(key.toDate).toDate(), 'asDays' );            
            if((daysToExpire>=3 && daysToExpire<4) || daysToExpire>=7 && daysToExpire<8){
                days = Math.floor(daysToExpire);
                let remiderMail = days;
                
                if(key.remiderMailstatus && key.remiderMailstatus.length){
                    var found = key.remiderMailstatus.indexOf(days);
                    if(!found){
                      remiderMail = key.remiderMailstatus.concat(days);
                      mailSentStatus = 'sent';
                    }
                }else{
                    mailSentStatus = 'sent';
                }  
                if(mailSentStatus=='sent'){
                  let zips = key.zipcodes;
                  let replyContnt = [];
                  replyContnt['zipcodes'] = zips;
                  replyContnt['days'] = days;
                  replyContnt['toDate'] = key.toDate;
                  // if(key.toDate){
                  //   console.log('key.toDate',key.toDate)
                  //   let toDate2 = key.toDate.split("T"); console.log('key.toDate ))))) ',toDate2)
                  //   toDate1 = toDate2[0];//+'/'+toDate2[1]+'/'+toDate2[0];
                  //   replyContnt['toDate'] = toDate1;
                  // }
                  await sendFeaturedAdvisorMail('AdviserFeturedRemiderEmail',userData.username,userData.firstName,replyContnt);
                }
               await advertisement.updateOne({_id:key._id},{remiderMailstatus:remiderMail});
            }
      }
      res.send(resFormat.rSuccess({daysToExpire,mailSentStatus}));
    });
  }
}


function sendFeaturedAdvisorMail(templateCode,emailId, toName, replyContnt) {
  let serverUrl = constants.clientUrl + "/signin";
  emailTemplatesRoute.getEmailTemplateByCode(templateCode).then((template) => {
    if (template) {
      template = JSON.parse(JSON.stringify(template));
      let body = template.mailBody.replace("{toName}",toName);
      if(replyContnt){
      body = body.replace("{zipcodes}",replyContnt['zipcodes']);
      body = body.replace("{toDate}",replyContnt['toDate']);
      body = body.replace("{days}",replyContnt['days']);
      }
      body = body.replace("{SERVER_LINK}",serverUrl);
      const mailOptions = {
        to: emailId,//'pankajk@arkenea.com',//emailId
        subject: template.mailSubject,
        html: body
      }
      sendEmail(mailOptions);
     return true;
    } else {
      return false;
    }
  })
}

router.post(["/auto-renewal-on-update-subscription"], autoRenewalOnUpdateSubscription);
router.post(["/update-subscription-details-if-fails"], updateSubscriptionDetailsIfFails);
router.get("/auto-renewal-on-reminder-email", autoRenewalOnReminderEmail);
router.get("/auto-renewal-off-reminder-email", autoRenewalOffReminderEmail);
router.get("/before-subscription-reminder-email", beforeSubscriptionReminderEmail);
router.get("/check-deceased-customers", deceasedCustomers);
router.get("/deceased-customers-reminders", deceasedCustomersReminders);
//router.post("/deceased-customers-reminders", deceasedCustomersReminders);
router.get("/check-featured-advisor-frmdate", featuredAdvisorFromDate);
router.get("/check-featured-advisor-enddate", featuredAdvisorEndDate);
router.get("/check-featured-advisor-remider-mail", featuredAdvisorReminder);

module.exports = router