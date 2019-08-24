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
const MarkDeceased = require('../models/MarkAsDeceased.js')
const trust = require('./../models/Trustee.js')
const HiredAdvisors = require('./../models/HiredAdvisors.js')
const executor = require('./../models/MarkAsExecutor.js')
var async = require('async');

async function viewDeceased(req, res) {
    let { query } = req.body;
    let fields = {}
    if (req.body.fields) {
      fields = req.body.fields
    }
    let deceasedList = await MarkDeceased.findOne(query,fields, {_id:1})
    let findQuery = {}; let alreadyDeceased = '';
    if(query.trustId){
      findQuery = {customerId:query.customerId,trustId: { $ne: query.trustId }};
    }else if(query.advisorId){
      findQuery = {customerId:query.customerId,advisorId: { $ne: query.advisorId}};
    } 
    if(!deceasedList){
      alreadyDeceased = await MarkDeceased.findOne(findQuery, {_id:1,trustId:1,advisorId:1})
    }

    let result = {'deceasedList':deceasedList,'alreadyDeceased':alreadyDeceased}
    res.status(200).send(resFormat.rSuccess(result));

  }


  async function markDeceased(req, res) {
      let paramData = req.body;
      
      let legacyHolderName = paramData.legacyHolderName;
      let deceasedFromName = paramData.deceasedFromName;
      let userType = paramData.userType;
    
      let trustId = paramData.trustId;
      let advisorId = paramData.advisorId;
      let fromUserId = '';
      if(userType=='customer'){
        fromUserId = trustId;
      }
      if(userType=='advisor'){
        fromUserId = advisorId;
      }

      if(paramData._id){
        let findQuery = {_id:paramData._id};

        let deceasedList = await MarkDeceased.findOne(findQuery, {_id:1})
        if (deceasedList._id) {
            let proquery = {'status':'Active'};
            await MarkDeceased.updateOne(findQuery,{$set: proquery })
          } 
      }else{
            var insert = new MarkDeceased();
            insert.customerId = paramData.customerId;
            insert.userType = userType;
            if(advisorId){    
              insert.advisorId = ObjectId(advisorId);
            }
            if(trustId){    
              insert.trustId = ObjectId(trustId);
            }
            insert.status = 'Active';
            insert.createdOn = new Date();
            insert.save();
      }

        let AllusersData = await getAllTrustUsers(paramData.customerId);
        let trustList = AllusersData[0]['trustList'];
        let advisorList = AllusersData[1]['advisorList'];
        var totalCnt = advisorList.length + trustList.length;

        let finalStatus = 'Pending';

         let DeceasedCnt = await MarkDeceased.find({customerId:paramData.customerId,status:"Active"})
         if(DeceasedCnt>=3){
          finalStatus = 'Active';
         }

         let searchQuery = '';
         if(userType=='customer'){
          searchQuery = {_id:paramData.customerId,'deceased.deceasedinfo.trustId':ObjectId(trustId)};
         }else{
          searchQuery = {_id:paramData.customerId,'deceased.deceasedinfo.advisorId':ObjectId(advisorId)};//'deceased.deceasedinfo.status':'Active',
         }

         let legacyHolderInfo = await User.findOne(searchQuery,{_id:1,deceased:1});
         
         let deceasedinfo = [];
         if(advisorId){
           deceasedinfo = {'status':'Active1','userType':userType,'trustId':'','advisorId':mongoose.Types.ObjectId(advisorId),'createdOn':new Date()}
         }
         if(trustId){
           deceasedinfo = {'status':'Active','userType':userType,'trustId':mongoose.Types.ObjectId(trustId),'advisorId':'','createdOn':new Date()}
         }
       
         let OldDeceasedinfo = deceasedinfo;
         if(legacyHolderInfo && legacyHolderInfo.deceased.deceasedinfo){
              OldDeceasedinfo = legacyHolderInfo.deceased.deceasedinfo;
              let currentObject = OldDeceasedinfo.findIndex( (x)=> { return x.trustId == trustId });
              OldDeceasedinfo[currentObject] = deceasedinfo;
         } else {
          OldDeceasedinfo = [OldDeceasedinfo];
          let LegacyUserData = await User.findOne({_id:paramData.customerId},{_id:1,deceased:1});
              if(LegacyUserData.deceased){ 
               let LegacyUserDataInfo = LegacyUserData.deceased.deceasedinfo
                OldDeceasedinfo =  LegacyUserDataInfo.concat(OldDeceasedinfo);
              }
         }
        let deceasedArray = {'status':finalStatus,'trusteeCnt':trustList.length,'advisorCnt':advisorList.length,deceasedinfo:OldDeceasedinfo};
        await User.updateOne({_id:paramData.customerId},{deceased:deceasedArray});
        await sendDeceasedNotification('MarkAsDeceasedNotificationMail',trustList,advisorList,legacyHolderName,deceasedFromName,userType,fromUserId);
        let result = { "message": "Mark as deceased successfully!" }
        res.status(200).send(resFormat.rSuccess(result));
  }

  async function getAllTrustUsers(customerId) {
    let respArray = [];
    let findQuery = {customerId:ObjectId(customerId),status:'Active'};

    let trustList = await trust.find(findQuery, {_id:1,trustId:1})
    let advisorList = await HiredAdvisors.find(findQuery, {_id:1,advisorId:1})
    respArray.push({trustList:trustList},{advisorList:advisorList});

    return respArray;
  }


  function sendDeceasedNotification(template,trustList,advisorList,legacyHolderName,deceasedFromName,userType,fromUserId) {
    if(trustList.length>0){
      trustList.forEach( ( val, index ) => {
       if(val.trustId!=fromUserId){
          User.findOne({_id:val.trustId},{_id:1,username:1,firstName:1,lastName:1,userType:1},function (err, userDetails) {
                if (err) {
                  res.status(401).send(resFormat.rError(err));
                } else {
                  if(userDetails){
                    sendDeceasedNotifyMails(template,userDetails.username,userDetails.firstName,userDetails.lastName,legacyHolderName,deceasedFromName,userDetails.userType);
                  }
                }
            })
          }
      })
    }

    if(advisorList.length>0){
      advisorList.forEach( ( val, index ) => {
        if(val.advisorId!=fromUserId){
         User.findOne({_id:val.advisorId},{_id:1,username:1,firstName:1,lastName:1,userType:1},function (err, userDetails) {
          if (err) {
            res.status(401).send(resFormat.rError(err));
          } else {
             if(userDetails){
              sendDeceasedNotifyMails(template,userDetails.username,userDetails.firstName,userDetails.lastName,legacyHolderName,deceasedFromName,userDetails.userType);
             }
          }
        })
        }
      })
    }
  }

  function sendDeceasedNotifyMails(template,emailId,toFname,toLname,legacyHolderName,deceasedFromName,userType) {
    let serverUrl = constants.clientUrl + "/customer/signin";
      emailTemplatesRoute.getEmailTemplateByCode(template).then((template) => {
        if (template) {
          template = JSON.parse(JSON.stringify(template));
          let mailSubject = template.mailSubject.replace("{LegacyHolderName}",legacyHolderName);
          let body = template.mailBody.replace("{ToFname}",toFname);
          body = body.replace("{LegacyHolderName}",legacyHolderName);
          body = body.replace("{deceasedFromName}",deceasedFromName);
          body = body.replace("{userType}",userType);
          body = body.replace("{SERVER_LINK}",serverUrl);
          const mailOptions = {
            to: emailId,
            subject: mailSubject,
            html: body
          }
          sendEmail(mailOptions);
          return true;
        } else {
          return false;
        }
      })
}


async function revokeDeceasedTest(req, res) {
    let searchQuery = '';
    let advisorId = '';
    let userType = 'customer';
    let customerId = '5d257abf362713b484cf3f36';
    let trustId = '5cc9cb111955852c18c5b735';
    
    if(userType=='customer'){
      searchQuery = {_id:customerId,'deceased.deceasedinfo.trustId':ObjectId(trustId)};
    }else{
      searchQuery = {_id:customerId,'deceased.deceasedinfo.advisorId':ObjectId(advisorId)};//'deceased.deceasedinfo.status':'Active',
    }

     let legacyHolderInfo = await User.findOne(searchQuery,{_id:1,deceased:1});
     let deceasedinfo = [];
     if(advisorId){
       deceasedinfo = {'status':'Active1','userType':userType,'trustId':'','advisorId':mongoose.Types.ObjectId(advisorId),'createdOn':new Date()}
     }
     if(trustId){
       deceasedinfo = {'status':'Active-PK','userType':userType,'trustId':mongoose.Types.ObjectId(trustId),'advisorId':'','createdOn':new Date()}
     }
   
     let OldDeceasedinfo = deceasedinfo;
     if(legacyHolderInfo && legacyHolderInfo.deceased.deceasedinfo){
          OldDeceasedinfo = legacyHolderInfo.deceased.deceasedinfo;
          let currentObject = OldDeceasedinfo.findIndex( (x)=> { return x.trustId == trustId });
          OldDeceasedinfo[currentObject] = deceasedinfo;
     } else {
      OldDeceasedinfo = [OldDeceasedinfo];
      let LegacyUserData = await User.findOne({_id:customerId},{_id:1,deceased:1});
          if(LegacyUserData.deceased){ 
           let LegacyUserDataInfo = LegacyUserData.deceased.deceasedinfo
            OldDeceasedinfo =  LegacyUserDataInfo.concat(OldDeceasedinfo);
          }
     }

      let finalStatus = 'Pending';
      let deceasedArray = {'status':finalStatus,'trusteeCnt':'4','advisorCnt':'4',deceasedinfo:OldDeceasedinfo};
      await User.updateOne({_id:customerId},{deceased:deceasedArray});

     let result = { "message": "Revoke deceased successfully!" }
     res.status(200).send(resFormat.rSuccess(result));
 }

 function revokeDeceased(req, res) {
     let {query} = req.body;
     let {revokeId} = req.body;    
     let {deceasedFromName} = req.body;
    //console.log('findQuery :- ',query,'revokeId :- ',revokeId,'deceasedFromName :-',deceasedFromName);
     MarkDeceased.findOne(query,async function (err,deceasedDetails){
        if (err) {
          res.status(401).send(resFormat.rError(err));
        } else {
          let trustId = advisorId = '';
          let userType = deceasedDetails.userType;
          if(userType=='customer'){
            trustId = deceasedDetails.trustId;
          }else if(userType=='advisor'){
            advisorId = deceasedDetails.advisorId;
          }

          let AllusersData = await getAllTrustUsers(deceasedDetails.customerId);
          let trustList = AllusersData[0]['trustList'];
          let advisorList = AllusersData[1]['advisorList'];
          var totalCnt = advisorList.length + trustList.length;
          let finalStatus = 'Pending';

          let proquery = {status:"Revoke",revokeId:ObjectId(revokeId)};
           await MarkDeceased.updateOne(query,{$set: proquery })

          let searchQuery = '';
          if(userType=='customer'){
           searchQuery = {_id:deceasedDetails.customerId,'deceased.deceasedinfo.trustId':ObjectId(trustId)};
          }else{
           searchQuery = {_id:deceasedDetails.customerId,'deceased.deceasedinfo.advisorId':ObjectId(advisorId)};///deceased.deceasedinfo.status':'Active',
          }

          let legacyHolderInfo = await User.findOne(searchQuery, {_id:1,firstName:1,lastName:1,deceased:1});
          if(advisorId){
              deceasedinfo = {'status':'Revoke','userType':userType,'trustId':'','advisorId':mongoose.Types.ObjectId(advisorId),'createdOn':new Date()};
          }
          if(trustId){
              deceasedinfo = {'status':'Revoke','userType':userType,'trustId':mongoose.Types.ObjectId(trustId),'advisorId':'','createdOn':new Date()};
          }

          //To check how much users say to Deceased confirm
          let DeceasedCnt = await MarkDeceased.find({customerId:deceasedDetails.customerId,status:"Active"})
          if(DeceasedCnt>=3){
          finalStatus = 'Active';
          }

          let OldDeceasedinfo = deceasedinfo;
            if(legacyHolderInfo && legacyHolderInfo.deceased.deceasedinfo){
                OldDeceasedinfo = legacyHolderInfo.deceased.deceasedinfo;
                let currentObject = OldDeceasedinfo.findIndex( (x)=> { return x.trustId == trustId });
                OldDeceasedinfo[currentObject] = deceasedinfo;
            } else {
                OldDeceasedinfo = [OldDeceasedinfo];
                let LegacyUserData = await User.findOne({_id:deceasedDetails.customerId},{_id:1,deceased:1});
                if(LegacyUserData.deceased){ 
                  let LegacyUserDataInfo = LegacyUserData.deceased.deceasedinfo
                  OldDeceasedinfo =  LegacyUserDataInfo.concat(OldDeceasedinfo);
                }
            }
            let deceasedArray = {'status':finalStatus,'trusteeCnt':trustList.length,'advisorCnt':advisorList.length,deceasedinfo:OldDeceasedinfo};
            await User.updateOne({_id:deceasedDetails.customerId},{deceased:deceasedArray});


            await sendDeceasedNotification('RevokeAsDeceasedNotificationMail',trustList,advisorList,legacyHolderInfo.firstName,legacyHolderInfo.lastName,deceasedFromName,userType,revokeId);
            let result = { "message": "Revoke deceased successfully!",'result':deceasedDetails }
            res.status(200).send(resFormat.rSuccess(result));
          }
      })
}

 async function deceaseListing(req, res) {
    let { query } = req.body
    let groupObj = { _id : "$customerId","customerId":{$first: '$customerId'},"advisorId": {$first: '$advisorId'},"trustId": {$first: '$trustId'},"userType": {$first: '$userType'},"documents": {$first: '$documents'},"status": {$first: '$status'}, "createdOn": {$first: '$createdOn'}} 
    await MarkDeceased.aggregate([ 
      { $match: query },
      { $group:  groupObj }
    ]) .exec(function(err, records) {
      MarkDeceased.populate(records, {path: 'customerId'}, function(err, deceasedData) {
        let message = 'Revoke deceased successfully!';
        if(deceasedData.length==0){
          message = 'No Records Found!';
        }
        let result = { "message": message,deceasedData:deceasedData }
        res.status(200).send(resFormat.rSuccess(result));
      });
  });
 }
 
 function deceaseExecutorsDetails(req, res) {
    let { query } = req.body;
    executor.findOne(query, function (err, executorData) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        let result = { "message": 'executor record',executorData:executorData}
        res.status(200).send(resFormat.rSuccess(result));
      }
    }).populate('trustId').populate('advisorId');

}

 function deceaseViewDetails(req, res) {
  let { query,order } = req.body;
  MarkDeceased.find(query, function (err, deceasedData) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      let result = { "message": 'deceased records',deceasedData:deceasedData }
      res.status(200).send(resFormat.rSuccess(result));
    }
  }).sort(order).populate('customerId').populate('trustId').populate('advisorId');
 }

router.post("/viewDeceaseDetails", viewDeceased)
router.post("/markAsDeceased", markDeceased)
router.post("/revokeAsDeceased", revokeDeceased)
router.post("/deceaseList", deceaseListing)
router.post("/deceaseView", deceaseViewDetails)
router.post("/deceaseExecutor", deceaseExecutorsDetails)
module.exports = router