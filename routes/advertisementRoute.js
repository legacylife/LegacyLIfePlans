var express = require('express')
var router = express.Router()
var request = require('request')
const mongoose = require('mongoose')
var async = require('async')
const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
var EmailTemplate = require('./../models/EmailTemplates.js')
const advertisement = require('./../models/advertisements.js')
const { isEmpty, cloneDeep, map, sortBy } = require('lodash')

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
    insert.createdOn  = new Date();
    insert.modifiedOn = new Date();
    insert.save(function (err, newUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          console.log('newUser',newUser)
         // let message = resMessage.data( 621, [] )
          let result = { "message": "Enquiry submit successfully!" }
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
         advertisement.findOne(query, function (err, enquirydata) {
          res.send(resFormat.rSuccess({enquirydata,totalRecords}))
       }).populate('customerId').populate("adminReply.adminId");
    })
  }  

  function addEnquiryReply(req, res) {
    let { query } = req.body;
    let { proquery } = req.body;
    advertisement.findOne({_id:query._id}, function (err, found) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {         
        if(found){
            let adminReplyArr = {'status':'Pending',adminId:ObjectId(query.adminId),'zipcodes':proquery.zipcodes,'cost':proquery.cost,'message':proquery.message,'createdOn':new Date()};
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
            advertisement.updateOne({_id:query._id}, {adminReply:adminReplyData}, function (err, logDetails) {
              if (err) {
                res.send(resFormat.rError(err))
              } else {
                let toName = found.customerId.firstName;
                let emailId = found.customerId.username;
                let zips = proquery.zipcodes.join(",")

                let replyContnt = [];
                replyContnt['zipcodes'] = zips;
                replyContnt['cost'] = proquery.cost;

                let fromDate1 = '';let toDate1 = '';
                if(found.fromDate){
                  let  fromDate = found.fromDate.split("-");
                  let fromDate2 = fromDate[2].split("T");
                  fromDate1 = fromDate[0]+'/'+fromDate[1]+'/'+fromDate2[0];
                }
                if(found.toDate){
                  let toDate = found.toDate.split("-");
                  let toDate2 = toDate[2].split("T");
                  toDate1 = toDate[0]+'/'+toDate[1]+'/'+toDate2[0];
                }

                replyContnt['fromDate'] = fromDate1;
                replyContnt['toDate']   = toDate1;
                replyContnt['paymentLink'] = proquery.stripePaymentLink;
                replyContnt['comment'] = proquery.message;

                sendEnquiryReplyMail('AdviserFeturedRequestReply',emailId, toName, replyContnt);
                let result = { "message": "Reply sent successfully!",'logDetails':logDetails }
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


function rejectEnquiry(req, res) {
  let { query } = req.body;console.log('query',query)
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
          advertisement.updateOne({_id:query._id}, {status:"Reject",adminReply:adminReplyData}, function (err, logDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let toName = found.customerId.firstName;
              let emailId = found.customerId.username;
              sendEnquiryReplyMail('AdviserFeturedRequestRejected',emailId,toName,'');
              let result = { "message": "Enquiry has been rejected!" }
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
  let serverUrl = constants.clientUrl + "/customer/signin";
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

router.post("/submitEnquiry",addEnquiry)
router.post("/enquiryList",enquiryListing)
router.post("/viewEnquiry",viewEnquiryDetails)
router.post("/submitEnquiryReply",addEnquiryReply)
router.post("/submitRejectEnquiry",rejectEnquiry)
module.exports = router