var express = require('express')
var router = express.Router()
var passport = require('passport')
var request = require('request')
var jwt = require('express-jwt')
const mongoose = require('mongoose')
var objectId = mongoose.Types.ObjectId();
const stripe = require("stripe")("sk_test_eXXvQMZIUrR3N1IEAqRQVTlw");

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
var moment = require('moment');

async function getProductDetails() {
  return await stripe.plans.list( { limit: 3, active:true });
}

async function getSelectedPlanDetails( planId ) {
  return await stripe.plans.retrieve( planId );
}

function getPlanDetails( stripeCustomerId, userProfile ) {
  if( stripeCustomerId ) {
    let subscriptionDetails = userProfile.subscriptionDetails ? userProfile.subscriptionDetails : null
    let planId = subscriptionDetails != null ? subscriptionDetails[(subscriptionDetails.length-1)]['planId'] : ""
    if( planId != "" ) {
      stripe.plans.retrieve(
        planId,
        function(err, plan) {
          if ( !err ) {
            return plan
          }
      });
    }
  }
}

function subscriptionReminderEmail() {
  User.find( { 'subscriptionDetails': { $exists: true }, 'subscriptionDetails': { $elemMatch: { 'autorenewal': { $exists: true} } } }, {}, function(err,userList) {
    if( !err && userList ) {
      userList.forEach( ( val, index ) => {
        
      })
    }
  })
}

function beforeSubscriptionReminderEmail(req, res) {
  User.find( { 'subscriptionDetails': { $exists: false }, 'userType': 'customer' }, {}, async function(err, userList) {
    if( !err && userList ) {
      let productDetails= await getSelectedPlanDetails( 'C_YEARLY');
      console.log("productDetails:-",productDetails)
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
            diff          = Math.round( getDateDiff( moment(userCreatedOn).toDate(), today ));
            /* if( userEmailId == 'dangejasmine@gmail.com') {
              console.log("val:-",val)
            } */
        let freePremiumAccessRemainDays = Math.abs( diff - 30 ), //The first time registered customer gets free access to all premium features for 30 days
            sendEmailReminder           = false,
            whichEmailReminderSend      = null,
            freeAccessRemainingDays     = 0;
        
        //The system will send reminder notifications on the customer’s email (7 days, 3 days, 1 day before free trial expiry date)

        if( freePremiumAccessRemainDays <= 7 && freePremiumAccessRemainDays > 6 && !val.SevenDaysReminder) {
          //reminder before 7days of free premium access expires
          sendEmailReminder       = true
          whichEmailReminderSend  = 'sevenDaysReminder'
          freeAccessRemainingDays = '7 days'
        }
        else if( freePremiumAccessRemainDays <= 3 && freePremiumAccessRemainDays > 2 && !val.ThreeDaysReminder) {
          //reminder before 3days of free premium access expires
          sendEmailReminder       = true
          whichEmailReminderSend  = 'threeDaysReminder'
          freeAccessRemainingDays = '3 days'
        }
        else if( freePremiumAccessRemainDays <= 1 && freePremiumAccessRemainDays > 0 && !val.OneDayReminder) {
          //reminder before 1day of free premium access expires
          sendEmailReminder       = true
          whichEmailReminderSend  = 'oneDayReminder'
          freeAccessRemainingDays = '1 day'
        }
        else{
          sendEmailReminder       = false
          whichEmailReminderSend  = null
          freeAccessRemainingDays = ''
        }
        console.log("userType",val.userType,"email: -",val.username,  "created on :-",val.createdOn,  " date diff:-",diff, 'freePremiumAccessRemainDays:- ',freePremiumAccessRemainDays ,"reminder:-",whichEmailReminderSend);
        //send email reminder if above conditions true
        if( sendEmailReminder && whichEmailReminderSend != null ) {
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
                sendEmail(mailOptions, (response)=>{
                  //console.log("response",response)
                  if( response ) {
                    User.updateOne({ _id: userId }, { $set: { whichEmailReminderSend : true } }, function (err, updated) {
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

  /**
   * return date difference in days
   * @param startDate 
   * @param endDate 
   */
  function getDateDiff( startDate, endDate ) {
    return moment.duration( 
        moment(endDate).diff( moment(startDate) ) 
      ).asDays()
  }

router.post(["/subscriptionreminderemail"], subscriptionReminderEmail);
router.post(["/beforesubscriptionreminderemail"], beforeSubscriptionReminderEmail);

module.exports = router