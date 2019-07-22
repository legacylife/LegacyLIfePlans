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


function getProductDetails() {
  stripe.plans.list( { limit: 3, active:true }, function(err, plans) {
      return plans  
  });
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
  User.find( { 'subscriptionDetails': { $exists: true }, 'subscriptionDetails.autorenewal': { $exists: true } }, {}, function(err,userList) {
    if( !err && userList ) {
      userList.forEach( ( val, index ) => {
        
      })
    }
  })
}

function beforeSubscriptionReminderEmail() {
  User.find( { 'subscriptionDetails': { $exists: false } }, {}, function(err, userList) {
    if( !err && userList ) {
      userList.forEach( ( val, index ) => {
        
      })
    }
  })
}

router.post(["/subscriptionreminderemail"], subscriptionReminderEmail);
router.post(["/beforesubscriptionreminderemail"], beforeSubscriptionReminderEmail);

module.exports = router