var express = require('express')
var router = express.Router()
var request = require('request')
const mongoose = require('mongoose')
var async = require('async')
const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const stripeHelper = require('./../helpers/stripeInvoiceHelper')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
var EmailTemplate = require('./../models/EmailTemplates.js')
const advertisement = require('./../models/advertisements.js')
const { isEmpty, cloneDeep, map, sortBy } = require('lodash')
var moment    = require('moment');
const stripe          = require("stripe")(constants.stripeSecretKey);
const resMessage      = require('./../helpers/responseMessages')
const allActivityLog  = require('./../helpers/allActivityLogs')

function addEnquiry(req, res) {
    let { query } = req.body;
    let { proquery } = req.body;

    var insert = new advertisement();
    insert.zipcodes   = proquery.zipcodes.join(',');
    insert.userType   = query.userType;
    insert.customerId = ObjectId(query.customerId);
    insert.fromDate   = proquery.fromDate;
    insert.toDate     = proquery.toDate;
    insert.message    = proquery.message;
    insert.status     = 'Active';
    insert.sponsoredStatus = 'Pending';
    insert.createdOn  = new Date();
    insert.modifiedOn = new Date();
    insert.save(function (err, newUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let message = resMessage.data( 607, [{key: '{field}',val: 'Advertisement Enquiry'}, {key: '{status}',val: 'submitted'}] )
          //Update activity logs
          allActivityLog.updateActivityLogs( query.customerId, query.customerId, "Advertisement Enquiry", message, "Get Featured" )
          let result = { "message": message }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
}

function enquiryListing(req, res) {
    let { fields, offset, query, order, limit, search } = req.body
    let totalRecords = 0
    if (search && !isEmpty(query)) {
      Object.keys(query).map(function (key, index) {
        if (key !== "status") {
          query[key] = new RegExp(query[key], 'i')
        }
      })
    }
    advertisement.countDocuments(query, function (err, listCount) {
      if (listCount) {
        totalRecords = listCount
      }
      advertisement.find(query, fields, function (err, advertisementList) {
        if (err) {
          res.status(401).send(resFormat.rError(err))
        } else {   
            res.send(resFormat.rSuccess({advertisementList,totalRecords}))
        }
      }).sort(order).skip(offset).limit(limit).populate('customerId');
    })
}
  
function viewEnquiryDetails(req, res) {
    let { query } = req.body
    let totalRecords = 0
     advertisement.countDocuments(query, function (err, listCount) {
        if (listCount) {
          totalRecords = listCount
        }
         advertisement.findOne({_id: mongoose.Types.ObjectId(query._id)}, function (err, enquirydata) {
          res.send(resFormat.rSuccess({enquirydata,totalRecords}))
       }).populate('customerId').populate("adminReply.adminId");
    })
}  

function addEnquiryReply(req, res) {
    let { query } = req.body;
    let { proquery } = req.body;
    advertisement.findOne({_id:query._id}, async function (err, found) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {         
        if(found) {
          console.log("1 >>>>>>>>>>>>");
            let adminReplyArr = {'status':'Pending',adminId:ObjectId(query.adminId),'zipcodes':proquery.zipcodes,'cost':proquery.cost,'message':proquery.message,'createdOn':new Date()};
            let adminReplyData = '', invoiceDetails = ''
            let userData = await User.findOne({_id: found.customerId},{})
            
            if( !userData ) {
              console.log("2 >>>>>>>>>>>>");
              res.send(resFormat.rError('Not found'))
            }
          
            if( found.adminReply.length > 0 ) {
              console.log("3 >>>>>>>>>>>>");
              adminReplyData = found.adminReply;
              let newarry = [];  
              let list = await adminReplyData.map(async function (row, index) {
                if(row.status=='Pending') {
                  console.log("4 >>>>>>>>>>>>");
                  let oldData = row.paymentDetails,
                      paymentDetails = {
                        invoiceId: oldData.invoiceId,
                        invoiceItemId: oldData.invoiceItemId,
                        status: 'Deleted', //pending, done, delete, void
                        createdOn: oldData.createdOn,
                        modifiedOn: new Date()
                      }
                  
                  let newRow = Object.assign({}, row, { "status": 'Expired', "paymentDetails": paymentDetails })
                  newarry.push(newRow);
                }
                else {
                  console.log("5 >>>>>>>>>>>>");
                  newarry.push(row);
                }

                adminReplyData =  newarry
              })
              

              /**
               * Create stripe user if not exists
               */
              let userDetails = found.customerId,
                  stripeCustomerId = userDetails.stripeCustomerId
              /**
               * Add payment link data
               */
              await stripeHelper.createInvoice(userData.username, stripeCustomerId, proquery.cost, 'USD', userDetails ).then( response => {
                console.log("6 >>>>>>>>>>>>");
                invoiceDetails = response
                stripeCustomerId = response.stripeCustomerId
                let paymentDetails = {
                  invoiceId: invoiceDetails.invoiceId,
                  invoiceItemId: invoiceDetails.invoiceItemId,
                  status: 'Pending', //pending, done, delete, void
                  createdOn: new Date(),
                  modifiedOn: new Date()
                }
                adminReplyArr = Object.assign(adminReplyArr,{paymentDetails:paymentDetails})
              })

              adminReplyData =  adminReplyData.concat(adminReplyArr);
            }
            else {
              console.log("7 >>>>>>>>>>>>");
              adminReplyData = adminReplyArr;
              /**
               * Create stripe user if not exists
               */
              let userDetails = found.customerId,
                  stripeCustomerId = userDetails.stripeCustomerId,
                  newStripeCustomerId = ''
              /**
               * Add payment link data
               */
              
              await stripeHelper.createInvoice(userData.username, stripeCustomerId, proquery.cost, 'USD', userDetails ).then( async(response) => {
                console.log("8 >>>>>>>>>>>>");
                invoiceDetails = response
                newStripeCustomerId = invoiceDetails.stripeCustomerId
                let paymentDetails = {
                  invoiceId: invoiceDetails.invoiceId,
                  invoiceItemId: invoiceDetails.invoiceItemId,
                  status: 'Pending', //pending, done, delete, void
                  createdOn: new Date(),
                  modifiedOn: new Date()
                }
                adminReplyData = Object.assign(adminReplyData,{paymentDetails:paymentDetails})
                if( !stripeCustomerId && newStripeCustomerId != "" ) {
                  console.log("9 >>>>>>>>>>>>");
                  await User.updateOne({_id: userDetails._id}, {stripeCustomerId:newStripeCustomerId})
                }

              })
            }
            let uniqueId = Math.random().toString(36).slice(2)
            advertisement.updateOne({_id:query._id}, {fromDate:proquery.fromDate,toDate:proquery.toDate,adminReply:adminReplyData,uniqueId:uniqueId}, function (err, logDetails) {
              if (err) {
                res.send(resFormat.rError(err))
              } else {
                console.log("10 >>>>>>>>>>>>");
                let toName = found.customerId.firstName;
                let emailId = found.customerId.username;
                let zips = [];
                if(proquery.zipcodes){
                  zips = proquery.zipcodes.join(",")
                }
                

                let replyContnt = [];
                replyContnt['zipcodes'] = zips;
                replyContnt['cost'] = proquery.cost;

                let fromDate1 = '';let toDate1 = '';
                if(proquery.fromDate){
                  let  fromDate = proquery.fromDate.split("-");
                  let fromDate2 = fromDate[2].split("T");
                  fromDate1 = fromDate[0]+'/'+fromDate[1]+'/'+fromDate2[0];
                }
                if(proquery.toDate){
                  let toDate = proquery.toDate.split("-");
                  let toDate2 = toDate[2].split("T");
                  toDate1 = toDate[0]+'/'+toDate[1]+'/'+toDate2[0];
                }

                let encryptedCustomerId = Buffer.from(String(found.customerId._id), 'binary').toString('base64'),
                    encryptedInvoiceId  = Buffer.from(String(invoiceDetails.invoiceId), 'binary').toString('base64')

                let PaymentLink = constants.clientUrl+'/advertisement-payment/'+encryptedCustomerId+'/'+encryptedInvoiceId+'/'+uniqueId
              //  console.log("\n****PaymentLink****",PaymentLink)
                replyContnt['fromDate'] = fromDate1;
                replyContnt['toDate']   = toDate1;
                replyContnt['paymentLink'] = PaymentLink
                replyContnt['comment'] = proquery.message;
                //console.log("\n****replyContnt****",replyContnt)

                sendEnquiryReplyMail('AdviserFeturedRequestReply', emailId, toName, replyContnt);
                
                let message = resMessage.data( 607, [{key: '{field}',val: 'Payment link'}, {key: '{status}',val: 'sent'}] ) 
                //Update activity logs
                allActivityLog.updateActivityLogs( query.adminId, found.customerId._id, "Advertisement Enquiry Reply", message, "Admin Panel" )
                
                let result = { "message": message,'logDetails':logDetails }
                res.status(200).send(resFormat.rSuccess(result))
              }
            })
       }else{
        console.log("11 >>>>>>>>>>>>");
        let result = { "message": "Something wrong, Please try again later!" }
        res.status(200).send(resFormat.rSuccess(result))
       }
      }
    }).populate('customerId');
}

function rejectEnquiry(req, res) {
  let { query } = req.body;
  advertisement.findOne({_id:query._id}, function (err, found) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {         
      if(found){
          let adminReplyArr = {'status':'Reject',adminId:ObjectId(query.adminId),'createdOn':new Date()};//'message':proquery.message
          let adminReplyData = '';
          if(found.adminReply){
            adminReplyData = found.adminReply;
            let newarry = [];  
            let list = map(adminReplyData, (row, index) => {
              if(row.status=='Pending'){
                let newRow = Object.assign({}, row, { "status": 'Expired' })
                newarry.push(newRow);
              }else{
                newarry.push(row);
              }
            });
            adminReplyData =  newarry.concat(adminReplyArr);
          }else{
            adminReplyData = adminReplyArr;
          }
          advertisement.updateOne({_id:query._id}, {status:"Reject",'sponsoredStatus':'Reject',adminReply:adminReplyData}, function (err, logDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let toName = found.customerId.firstName;
              let emailId = found.customerId.username;
              sendEnquiryReplyMail('AdviserFeturedRequestRejected',emailId,toName,'');

              let message = resMessage.data( 607, [{key: '{field}',val: 'Advertisement Enquiry'}, {key: '{status}',val: 'rejected'}] )
              //Update activity logs
              allActivityLog.updateActivityLogs( query.adminId, found.customerId._id, "Advertisement Enquiry", message, "Admin Panel" )

              let result = { "message": message }
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
     }else{
      let result = { "message": "Something wrong, Please try again later!" }
      res.status(200).send(resFormat.rSuccess(result))
     }
    }
  }).populate('customerId');

}

function sendEnquiryReplyMail(templateCode,emailId, toName, replyContnt) {
  let serverUrl = constants.clientUrl + "/signin";
  emailTemplatesRoute.getEmailTemplateByCode(templateCode).then((template) => {
    if (template) {
      template = JSON.parse(JSON.stringify(template));
      let body = template.mailBody.replace("{toName}",toName);
      if(replyContnt){
      body = body.replace("{zipcodes}",replyContnt['zipcodes']);
      body = body.replace("{cost}",replyContnt['cost']);
      body = body.replace("{fromdate}",replyContnt['fromDate']);
      body = body.replace("{toDate}",replyContnt['toDate']);
      body = body.replace("{paymentLink}",replyContnt['paymentLink']);
      body = body.replace("{comment}",replyContnt['comment']);
      }
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

/**
 * @description return date difference in days
 * @param startDate 
 * @param endDate 
 */
function getDateDiff( startDate, endDate ) {
  return moment.duration( 
      moment(endDate).diff( moment(startDate) ) 
  ).asDays()
}

async function getInvoiceDetails( req, res ) {
  let { userId } = req.body,
      { invoice } = req.body,
      { uniqueId } = req.body,
      customerId = Buffer.from( String(userId),'base64').toString('binary'),
      invoiceId = Buffer.from( String(invoice),'base64').toString('binary')

  let advertisementData = await advertisement.findOne({customerId: customerId, uniqueId: uniqueId}).populate('customerId','firstName lastName')
  let adminReply = advertisementData.adminReply.filter( elem => elem.status==='Pending' && elem.paymentDetails.invoiceId === invoiceId )
  let advertisementDetails = {} 
  
  if( adminReply && adminReply.length > 0 ) {
    let totalDays = getDateDiff( advertisementData.fromDate, advertisementData.toDate)
    let invoiceSentDays = getDateDiff( adminReply[0]['paymentDetails']['createdOn'], moment() )
    advertisementDetails = {
      cost: adminReply[0]['cost'],
      fromDate: advertisementData.fromDate,
      toDate: advertisementData.toDate,
      totalDays: totalDays,
      status: adminReply[0]['paymentDetails']['status'],
      invoiceSentDays: invoiceSentDays,
      userName: advertisementData.customerId.firstName+' '+advertisementData.customerId.lastName
    }
  }
  res.status(200).send(resFormat.rSuccess(advertisementDetails))
  
}

async function completeTransaction( req, res ) {
  let { userId } = req.body.query,
      { invoice } = req.body.query,
      { uniqueId } = req.body.query,
      { token } = req.body.query,

      customerId = Buffer.from( String(userId),'base64').toString('binary'),
      invoiceId = Buffer.from( String(invoice),'base64').toString('binary')

  let advertisementData = await advertisement.findOne({customerId: customerId, uniqueId: uniqueId}).populate('customerId','firstName lastName stripeCustomerId')
  let OldAdminReply = advertisementData.adminReply
  let adminReply = advertisementData.adminReply.filter( elem => elem.status==='Pending' && elem.paymentDetails.invoiceId === invoiceId )
  let advertisementDetails = {}; 
  if( adminReply ) {
    /* let totalDays = getDateDiff( advertisementData.fromDate, advertisementData.toDate)
    let invoiceSentDays = getDateDiff( advertisementData.fromDate, moment() ) */
    let invoiceStatus = adminReply[0]['paymentDetails']['status']
    if( invoiceStatus === 'Pending') {
      stripeHelper.payInvoice( invoiceId, token, advertisementData.customerId.stripeCustomerId ).then(async(response) => {
        if( response ) {
          let currentInvoiceIndex = OldAdminReply.findIndex(elem => elem.status==='Pending' && elem.paymentDetails.invoiceId === invoiceId)
          let oldPaymentDetails   = OldAdminReply[currentInvoiceIndex]['paymentDetails'];
          let newPaymentDetails   = Object.assign({}, oldPaymentDetails, { "status": "Done" });
          let updatedOldAdminReply= Object.assign({}, OldAdminReply[currentInvoiceIndex], { "status": "Done", "paymentDetails": newPaymentDetails })
          OldAdminReply[currentInvoiceIndex] = updatedOldAdminReply
          newAdminReply = OldAdminReply;

          /*
          If advisor from date is today date and complete his payment then he should be directly sponsored advisor
          */
         console.log('advertisementData fromDate-=====>',advertisementData.fromDate)
          let updateStatus = advertisementData.sponsoredStatus;
          let dates = advertisementData.fromDate.toISOString().substring(0, 10);
          if(new Date(dates) <= new Date()){  
            console.log('first date ', new Date(dates) ,'======', new Date());
            updateStatus = 'Active';
            let newArray = [];
            let UserData = await User.findOne({_id:customerId},{_id:1,username:1,firstName:1,lastName:1,sponsoredAdvisor:1,status:1,sponsoredZipcodes:1});
            if(UserData){
                  console.log('adminReply-=====>',adminReply)                  
                  if(adminReply[0].zipcodes.length > 0) {
                    newArray = adminReply[0].zipcodes;
                  }
                 await User.updateOne({_id:customerId},{sponsoredAdvisor:'yes',sponsoredZipcodes:newArray});
            }
          }else{  console.log(' date not match ', new Date(dates) ,'======', new Date());}  
        
          advertisement.updateOne({customerId: customerId, uniqueId: uniqueId},{sponsoredStatus:updateStatus,adminReply: newAdminReply}, function (err, logDetails) {
            if( err ) {
              res.send(resFormat.rError(err))
            }
            else{
              let message = resMessage.data( 607, [{key: '{field}',val: 'Advertisement Payment'}, {key: '{status}',val: 'done'}] )
              //Update activity logs
              allActivityLog.updateActivityLogs( customerId, customerId, "Advertisement Enquiry", message, "Payment page" )
              res.status(200).send(resFormat.rSuccess({"message":message}))   
            }
          })
        }
        else{
          res.status(200).send(resFormat.rError("Payment not done, please try again later"))
        }
      })
    }
    else{
      res.status(200).send(resFormat.rError("Invoice payment link is expired."))
    }
  }
  else{
    res.status(200).send(resFormat.rError("Incorrect invoice payment link."))
  }
}


async function manageSponsoredStatus(req, res){
  let { query } = req.body;
  let { proquery } = req.body;
  let AdvData = await advertisement.findOne(query,{});
  if(AdvData){
      if(AdvData.sponsoredStatus=='Active'){
        let UserData = await User.findOne({_id:AdvData.customerId},{_id:1,username:1,firstName:1,lastName:1,sponsoredAdvisor:1,status:1,sponsoredZipcodes:1});
        if(UserData){
              let newArray = [];
              let oldArray = AdvData.adminReply.map(function (keys, index) {
                if(keys.status=='Done') {
                    return keys.zipcodes;
                }
              });    
              
              if(UserData.sponsoredZipcodes) {
                  UserData.sponsoredZipcodes.forEach((key,index) => {   
                    var found = oldArray.indexOf(key);
                    if(!found){         
                      console.log('------',key)            
                      //newArray = newArray.concat(key);
                      newArray = newArray[key];
                    }else{
                      console.log('+++++',key)            
                    }
                });
                console.log('------####+++++++++++---',UserData.sponsoredZipcodes,"newArray  ",newArray);
                //newArray = AdvData.zipcodes.concat(UserData.sponsoredZipcodes);
              }
             //await User.updateOne({_id:key.customerId},{sponsoredAdvisor:'no'});
             //await advertisement.updateOne(query,{sponsoredStatus:'Inactive',status:'Inactive'});
        }else{

        }
      }
  }
  res.status(200).send(resFormat.rError("Payment not done, please try again later"))
}

async function stripeErrors( err ) {
  switch (err.type) {
    case 'StripeCardError':
      // A declined card error
      //err.message; // => e.g. "Your card's expiration year is invalid."
      return err.message;
      break;
    case 'StripeRateLimitError':
      // Too many requests made to the API too quickly
      return err.message;
      break;
    case 'StripeInvalidRequestError':
      // Invalid parameters were supplied to Stripe's API
      return err.message;
      break;
    case 'StripeAPIError':
      // An error occurred internally with Stripe's API
      return err.message;
      break;
    case 'StripeConnectionError':
      // Some kind of error occurred during the HTTPS communication
      return err.message;
      break;
    case 'StripeAuthenticationError':
      // You probably used an incorrect API key
      return err.message;
      break;
    default:
      // Handle any other types of unexpected errors
      return "Invalid access. Try again";
      break;
  }
}

router.post("/submitEnquiry",addEnquiry)
router.post("/enquiryList",enquiryListing)
router.post("/viewEnquiry",viewEnquiryDetails)
router.post("/submitEnquiryReply",addEnquiryReply)
router.post("/submitRejectEnquiry",rejectEnquiry)
router.post("/get-invoice-details",getInvoiceDetails)
router.post("/complete-transaction",completeTransaction)
router.post("/manage-sponsored-status",manageSponsoredStatus)
module.exports = router