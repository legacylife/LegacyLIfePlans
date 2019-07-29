var express   = require('express')
var router    = express.Router()
var async     = require('async')
const stripe  = require("stripe")("sk_test_eXXvQMZIUrR3N1IEAqRQVTlw");
const User    = require('./../models/Users')
var moment    = require('moment');
const today   = moment().toDate()
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
var currencyFormatter     = require('currency-formatter');
const mongoose = require('mongoose')
var objectId = mongoose.Types.ObjectId();

async function getSelectedPlanDetails( planId ) {
  return await stripe.plans.retrieve( planId );
}

function autoRenewalOnUpdateSubscription ( req, res ) {
  let requestParam = req.body
  //console.log("requestParamrequestParam==========",requestParam)
  if( requestParam != null || requestParam.length >0 ) {
    let eventId = requestParam.id
    let eventType = requestParam.type

    if( eventType == 'customer.subscription.updated' ) {
      let subscriptionData =  requestParam.data.object
      let customerId = subscriptionData.customer
      User.find( { stripeCustomerId:customerId }, {}, function (err, userData) {
        if( !err && userData.length > 0 ) {
          let userProfile = userData[0]
          if( subscriptionData.object == 'subscription' ) {
            let subscriptionDetails = {"_id" : objectId,
                                        "productId" : subscriptionData.items.data[0]['plan']['product'],
                                        "planId" : subscriptionData.items.data[0]['plan']['id'],
                                        "subscriptionId" : subscriptionData.id,
                                        "startDate" : new Date(subscriptionData.current_period_start*1000),
                                        "endDate" : new Date(subscriptionData.current_period_end*1000),
                                        "interval" : subscriptionData.items.data[0]['plan']['interval'],
                                        "currency" : subscriptionData.items.data[0]['plan']['currency'],
                                        "amount" : subscriptionData.items.data[0]['plan']['amount'] / 100,
                                        "status" : 'paid',
                                        "autoRenewal": subscriptionData.collection_method == 'charge_automatically' ? true : false,
                                        "paymentMode" : 'online',
                                        "planName" : subscriptionData.items.data[0]['plan']['metadata']['name']+' Plan',
                                        "defaultSpace" : subscriptionData.items.data[0]['plan']['metadata']['defaultSpace'],
                                        "spaceDimension" : subscriptionData.items.data[0]['plan']['metadata']['spaceDimension'],
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
            //console.log(userSubscription)
            //Update user details
            User.updateOne({ _id: userProfile._id }, { $set: { subscriptionDetails : userSubscription, upgradeReminderEmailDay: [], renewalOnReminderEmailDay:[], renewalOffReminderEmailDay:[] } }, function (err, updated) {
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
                      body = body.replace("{more_space}", subscription.items.data[0]['plan']['metadata']['addOnSpace']+' '+subscriptionDetails.spaceDimension);
                    }
                    body = body.replace("{subscription_id}",subscriptionDetails.subscriptionId);
                    const mailOptions = {
                      to : userProfile.username,
                      subject : template.mailSubject,
                      html: body
                    }
                    sendEmail(mailOptions)
                    console.log("email sent")
                    return true;
                  } else {
                    console.log("email sent")
                    return true;
                  }
                })
              }
            })
          }
        }
      })
    }
  }
}

function autoRenewalOnReminderEmail() {
  User.aggregate([
    {
      $project: {
        createdOn: 1, username:1, firstName:1,lastName:1,renewalOnReminderEmailDay:1,
        subscriptionDetails: {$arrayElemAt: ["$subscriptionDetails", -1]},
      }
    },
    {
      $match: {"subscriptionDetails.autoRenewal": true}
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
                userEmailId   = val.username,
                userFullName  = val.firstName ? val.firstName+' '+(val.lastName ? val.lastName : '') : 'User';
                
            let sendEmailReminder         = false,
                whichDayEmailReminderSend = null,
                freeAccessRemainingDays   = 0;
            
            //If the auto-payment option is On, the system will send reminder notifications on the user’s email (1 day) before renewal date
            if( daysRemainingToExpire > 0 && daysRemainingToExpire <= 1 && ( !val.renewalOnReminderEmailDay || !val.renewalOnReminderEmailDay.includes(1) )) {
              //reminder before 1day of premium access expires
              sendEmailReminder         = true
              whichDayEmailReminderSend = 1
              freeAccessRemainingDays   = '1 day'
            }
            
            console.log("userFullName",userFullName,"email: -",val.username,  "created on :-",val.createdOn,  'freePremiumAccessRemainDays:- ',daysRemainingToExpire ,"reminder:-",whichDayEmailReminderSend);
            //send email reminder if above conditions true
            if( sendEmailReminder && whichDayEmailReminderSend != null ) {
              let reminderSentDays = []
              if( val.renewalOnReminderEmailDay ) {
                reminderSentDays = val.renewalOnReminderEmailDay
              }
              reminderSentDays.push(whichDayEmailReminderSend)
              User.updateOne({ _id: val._id }, { $set: { renewalOnReminderEmailDay: reminderSentDays} }, function (err, updated) {
                if (err) {
                  res.send(resFormat.rError(err))
                }
                else {
                  //free premium plan expiry plan reminer email
                  emailTemplatesRoute.getEmailTemplateByCode('autoRenewalOnReminderEmail').then( (template) => {
                    if(template) {
                      let planData = {}
                      if( userList.userType == 'customer' ) {
                        planData = customerPlanDetails
                      }
                      else{
                        planData = advisorPlanDetails
                      }
                      template = JSON.parse(JSON.stringify(template));
                      let body = template.mailBody.replace("{full_name}", userFullName);
                          body = template.mailBody.replace("{renewal_date}", new Date(subscriptionDetails.endDate));
                          body = body.replace("{amount}", planData.planAmount);
                          body = body.replace("{duration}", planData.planInterval);
                          

                      const mailOptions = { to : userEmailId,
                                            subject : template.mailSubject,
                                            html: body
                                          }
                      sendEmail( mailOptions, (response) => {
                        if( response ) {
                          User.updateOne({ _id: userId }, { $set: { renewalOnReminderEmailDay: whichDayEmailReminderSend } }, function (err, updated) {
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
        createdOn: 1, username:1, firstName:1,lastName:1,renewalOffReminderEmailDay:1,
        subscriptionDetails: {$arrayElemAt: ["$subscriptionDetails", -1]},
      }
    },
    {
      $match: {"subscriptionDetails.autoRenewal": false}
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
            if( daysRemainingToExpire <= 10 && daysRemainingToExpire > 9 && ( !val.renewalOffReminderEmailDay || !val.renewalOffReminderEmailDay.includes(30) )) {
              //reminder before 30days of premium access expires
              sendEmailReminder         = true
              whichDayEmailReminderSend = 30
              freeAccessRemainingDays   = '30 days'
            }
            else if( daysRemainingToExpire <= 7 && daysRemainingToExpire > 6 && ( !val.renewalOffReminderEmailDay || !val.renewalOffReminderEmailDay.includes(7) )) {
              //reminder before 7days of premium access expires
              sendEmailReminder         = true
              whichDayEmailReminderSend = 7
              freeAccessRemainingDays   = '7 days'
            }
            else if( daysRemainingToExpire <= 3 && daysRemainingToExpire > 2 && ( !val.renewalOffReminderEmailDay || !val.renewalOffReminderEmailDay.includes(3) )) {
              //reminder before 3days of premium access expires
              sendEmailReminder         = true
              whichDayEmailReminderSend = 3
              freeAccessRemainingDays   = '3 days'
            }
            else if( daysRemainingToExpire <= 1 && daysRemainingToExpire > 0 && ( !val.renewalOffReminderEmailDay || !val.renewalOffReminderEmailDay.includes(1) )) {
              //reminder before 1day of premium access expires
              sendEmailReminder         = true
              whichDayEmailReminderSend = 1
              freeAccessRemainingDays   = '1 day'
            }
            
            console.log("userFullName",userFullName,"email: -",val.username,  "created on :-",val.createdOn,  'freePremiumAccessRemainDays:- ',daysRemainingToExpire ,"reminder:-",whichDayEmailReminderSend);
            //send email reminder if above conditions true
            if( sendEmailReminder && whichDayEmailReminderSend != null ) {
              let reminderSentDays = []
              if( val.renewalOffReminderEmailDay ) {
                reminderSentDays = val.renewalOffReminderEmailDay
              }
              reminderSentDays.push(whichDayEmailReminderSend)
              User.updateOne({ _id: val._id }, { $set: { renewalOffReminderEmailDay: reminderSentDays} }, function (err, updated) {
                if (err) {
                  res.send(resFormat.rError(err))
                }
                else {
                  //free premium plan expiry plan reminer email
                  emailTemplatesRoute.getEmailTemplateByCode('autoRenewalOffReminderEmail').then( (template) => {
                    if(template) {
                      let planData = {}
                      if( userList.userType == 'customer' ) {
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
                          User.updateOne({ _id: userId }, { $set: { renewalOffReminderEmailDay: whichDayEmailReminderSend } }, function (err, updated) {
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
          }
        })
      }
    }
  })
/*   User.find( { 'subscriptionDetails': { $exists: true }, 'subscriptionDetails': { $elemMatch: { 'autorenewal': false } } }, {}, function(err,userList) {
    
  }) */
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

        let freePremiumAccessRemainDays = Math.abs( diff - 30 ), //The first time registered customer gets free access to all premium features for 30 days
            sendEmailReminder           = false,
            whichDayEmailReminderSend   = null,
            freeAccessRemainingDays     = 0;
        
        //The system will send reminder notifications on the customer’s email (7 days, 3 days, 1 day before free trial expiry date)
        if( freePremiumAccessRemainDays <= 7 && freePremiumAccessRemainDays > 6 && ( !val.upgradeReminderEmailDay || !val.upgradeReminderEmailDay.includes(7)) ) {
          //reminder before 7days of free premium access expires
          sendEmailReminder       = true
          whichDayEmailReminderSend  = 7
          freeAccessRemainingDays = '7 days'
        }
        else if( freePremiumAccessRemainDays <= 3 && freePremiumAccessRemainDays > 2 && ( !val.upgradeReminderEmailDay || !val.upgradeReminderEmailDay.includes(3)) ) {
          //reminder before 3days of free premium access expires
          sendEmailReminder       = true
          whichDayEmailReminderSend  = 3
          freeAccessRemainingDays = '3 days'
        }
        else if( freePremiumAccessRemainDays <= 1 && freePremiumAccessRemainDays > 0 && ( !val.upgradeReminderEmailDay || !val.upgradeReminderEmailDay.includes(1)) ) {
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
          User.updateOne({ _id: val._id }, { $set: { upgradeReminderEmailDay: reminderSentDays} }, function (err, updated) {
            if (err) {
              res.send(resFormat.rError(err))
            }
            else {
            //free premium plan expiry plan reminer email
            /* if( userEmailId == 'dangejasmine@gmail.com') {
              userEmailId = 'nileshy@arkenea.com' */
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
                      User.updateOne({ _id: userId }, { $set: { upgradeReminderEmailDay: reminderSentDays } }, function (err, updated) {
                        if ( !err ) {
                          console.log("updated")
                        }
                      })
                    }
                  })
                }
              })
            /* } */
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

router.post(["/auto-renewal-on-update-subscription"], autoRenewalOnUpdateSubscription);
router.get("/auto-renewal-on-reminder-email", autoRenewalOnReminderEmail);
router.get("/auto-renewal-off-reminder-email", autoRenewalOffReminderEmail);
router.get("/before-subscription-reminder-email", beforeSubscriptionReminderEmail);

module.exports = router