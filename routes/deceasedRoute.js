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
    let deceasedData = await MarkDeceased.findOne(query,fields, {_id:1}).populate('customerId');
    let findQuery = {}; let alreadyDeceased = '';

    if(query.trustId){
      findQuery = {customerId:query.customerId,trustId: { $ne: query.trustId },status:"Active"};
    }else if(query.advisorId){
      findQuery = {customerId:query.customerId,advisorId: { $ne: query.advisorId},status:"Active"};
    } 
    if(!deceasedData){
      alreadyDeceased = await MarkDeceased.findOne(findQuery, {_id:1,trustId:1,advisorId:1}).populate('customerId');
    }

    let result = {'deceasedData':deceasedData,'alreadyDeceased':alreadyDeceased}
    res.status(200).send(resFormat.rSuccess(result));

  }

  async function markDeceasedTest(req, res) {
    let paramData = req.body;
    
    let legacyHolderInfo = await User.findOne({_id:'5d25d5f2362713b484d2c4e6'},{_id:1,username:1,firstName:1,lastName:1,deceased:1,lockoutLegacyPeriod:1});
    var period = constants.lockLegacyPeriodType[legacyHolderInfo.lockoutLegacyPeriod];
    var today               = new Date();

    if(period==1){
      var lockoutLegacyDate = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
    }else{
      var lockoutLegacyDate   = new Date().setDate(today.getDate()+period);
    }
    console.log("period===> ",period,"date ==>",lockoutLegacyDate);
    await User.updateOne({_id:'5d25d5f2362713b484d2c4e6'},{lockoutLegacyDate:lockoutLegacyDate});
    let result = {"message": "Mark as deceased successfully!"}
    res.status(200).send(resFormat.rSuccess(result));
  }

  async function markDeceased(req, res) {
      let paramData = req.body;

      let legacyHolderName = paramData.legacyHolderName;
      let deceasedFromName = paramData.deceasedFromName;
      let userType = paramData.userType;
    
      let trustId = paramData.trustId;
      let advisorId = paramData.advisorId;
      let fromUserId = '';let adminId = '';
      if(userType=='customer'){
        fromUserId = trustId;
      }
      if(userType=='advisor'){
        fromUserId = advisorId;
      }
      if(userType=='sysadmin'){
        adminId = fromUserId = paramData.adminId;
      }

      if(paramData._id){
        let findQuery = {_id:paramData._id};

        let deceasedList = await MarkDeceased.findOne(findQuery, {_id:1})
        if (deceasedList._id) {
            let proquery = {'status':'Active','modifiedOn': new Date()};
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
            if(adminId){    
              insert.adminId = ObjectId(adminId);
            }
            insert.status = 'Active';
            insert.createdOn = new Date();
            insert.modifiedOn = new Date();
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

         if(adminId){ 
          finalStatus = 'Active';//When admin mark as Deceased then customer will directly deceased.
         }

         let searchQuery = {customerId:paramData.customerId};
         if(userType=='customer'){
          searchQuery = {_id:paramData.customerId,'deceased.deceasedinfo.trustId':ObjectId(trustId)};
         }else if(userType=='advisor'){
          searchQuery = {_id:paramData.customerId,'deceased.deceasedinfo.advisorId':ObjectId(advisorId)};//'deceased.deceasedinfo.status':'Active',
         }else if(userType=='sysadmin'){
          searchQuery = {_id:paramData.customerId,'deceased.deceasedinfo.adminId':ObjectId(adminId)};//'deceased.deceasedinfo.status':'Active',
         }
                  
         let legacyHolderInfo = await User.findOne(searchQuery,{_id:1,username:1,firstName:1,lastName:1,deceased:1,lockoutLegacyPeriod:1});
         let deceasedinfo = [];
         if(advisorId){
           deceasedinfo = {'status':'Active','userType':userType,'trustId':'','advisorId':mongoose.Types.ObjectId(advisorId),'createdOn':new Date()}
         }
         if(trustId){
           deceasedinfo = {'status':'Active','userType':userType,'trustId':mongoose.Types.ObjectId(trustId),'advisorId':'','createdOn':new Date()}
         }
         if(adminId){
          deceasedinfo = {'status':'Active','userType':userType,'advisorId':'','trustId':'','createdOn':new Date()}//'adminId':mongoose.Types.ObjectId(adminId),
         }
       
         let legacyHolderData = await User.findOne({_id:paramData.customerId},{_id:1,username:1,firstName:1,lastName:1,deceased:1,lockoutLegacyPeriod:1});

         let OldDeceasedinfo = deceasedinfo;
         if(legacyHolderInfo && legacyHolderInfo.deceased.deceasedinfo){
              OldDeceasedinfo = legacyHolderInfo.deceased.deceasedinfo;
              if(trustId){
                let currentObject = OldDeceasedinfo.findIndex( (x)=> { return x.trustId == trustId });
                OldDeceasedinfo[currentObject] = deceasedinfo;
              }
              if(advisorId){
                let currentObject = OldDeceasedinfo.findIndex( (x)=> { return x.advisorId == advisorId });
                OldDeceasedinfo[currentObject] = deceasedinfo;
              }
              if(adminId){
                let currentObject = OldDeceasedinfo.findIndex( (x)=> { return x.adminId == adminId });
                OldDeceasedinfo[currentObject] = deceasedinfo;
              }
         } else {
              OldDeceasedinfo = [OldDeceasedinfo];
              if(legacyHolderData.deceased){ 
               let LegacyUserDataInfo = legacyHolderData.deceased.deceasedinfo
                OldDeceasedinfo =  LegacyUserDataInfo.concat(OldDeceasedinfo);
              }
         }

         if(!legacyHolderInfo){
          legacyHolderInfo = legacyHolderData;
         }
         let lockoutLegacyDate = '';
         if(finalStatus == 'Active'){
          lockoutLegacyDate = await getLegacyDate(legacyHolderInfo.lockoutLegacyPeriod);
          console.log('lockoutLegacyDate:- ',lockoutLegacyDate,'Period:- ',legacyHolderInfo.lockoutLegacyPeriod);
         }
         
         //Customer needs to inform he is set mark as deceased now.
         await sendDeceasedNotifyMails('CustomerMarkAsDeceasedNotificationMail',legacyHolderInfo.username,legacyHolderInfo.firstName,legacyHolderInfo.lastName,legacyHolderName,deceasedFromName,userType,lockoutLegacyDate);
         let deceasedArray = {'status':finalStatus,'trusteeCnt':trustList.length,'advisorCnt':advisorList.length,deceasedinfo:OldDeceasedinfo};
         await User.updateOne({_id:paramData.customerId},{deceased:deceasedArray,lockoutLegacyDate:lockoutLegacyDate});
           
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

  async function getLegacyDate(lockoutLegacyPeriod) {
    var lockoutLegacyDate = '';
    if(lockoutLegacyPeriod){
      var period = constants.lockLegacyPeriodType[lockoutLegacyPeriod];
      var today = new Date(); 
      if(period){
        if(period==1){
          lockoutLegacyDate = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
        }else{
          lockoutLegacyDate   = new Date().setDate(today.getDate()+period);
        }
      }
    }
      return lockoutLegacyDate;
  }


  function sendDeceasedNotification(template,trustList,advisorList,legacyHolderName,deceasedFromName,userType,fromUserId) {
    if(trustList.length>0){
      trustList.forEach( ( val, index ) => {
       if(val.trustId!=fromUserId){
          User.findOne({_id:val.trustId},{_id:1,username:1,firstName:1,lastName:1},function (err, userDetails) {
                if (err) {
                  res.status(401).send(resFormat.rError(err));
                } else {
                  if(userDetails){
                    sendDeceasedNotifyMails(template,userDetails.username,userDetails.firstName,userDetails.lastName,legacyHolderName,deceasedFromName,userType);
                  }
                }
            })
          }
      })
    }

    if(advisorList.length>0){
      advisorList.forEach( ( val, index ) => {
        if(val.advisorId!=fromUserId){
         User.findOne({_id:val.advisorId},{_id:1,username:1,firstName:1,lastName:1},function (err, userDetails) {
          if (err) {
            res.status(401).send(resFormat.rError(err));
          } else {
             if(userDetails){
              sendDeceasedNotifyMails(template,userDetails.username,userDetails.firstName,userDetails.lastName,legacyHolderName,deceasedFromName,userType);
             }
          }
        })
        }
      })
    }
  }

  function sendDeceasedNotifyMails(template,emailId,toFname,toLname,legacyHolderName,deceasedFromName,userType,lockoutLegacyDate='') {
    
    let serverUrl = constants.clientUrl + "/customer/signin";
      emailTemplatesRoute.getEmailTemplateByCode(template).then((template) => {
        if (template) {
          template = JSON.parse(JSON.stringify(template));
          let mailSubject = template.mailSubject.replace("{LegacyHolderName}",legacyHolderName);
          let body = template.mailBody.replace("{ToFname}",toFname);
          body = body.replace("{LegacyHolderName}",legacyHolderName);
          body = body.replace("{deceasedFromName}",deceasedFromName);
          body = body.replace("{lockoutLegacyDate}",lockoutLegacyDate);
          body = body.replace("{userType}",userType);
          body = body.replace("{SERVER_LINK}",serverUrl);
          const mailOptions = {
            to: 'pankajk@arkenea.com',
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

function revokeDeceased(req, res) {
     let {query} = req.body;
     let {revokeId} = req.body;    
     let {deceasedFromName} = req.body;
     let {userType} = req.body;
    MarkDeceased.findOne(query,async function (err,deceasedDetails){
        if (err) {
          res.status(401).send(resFormat.rError(err));
        } else {
          let trustId = advisorId = adminId = '';
          if(!userType){
           userType = deceasedDetails.userType;
          }

          let searchDeceasedQuery = {};  
          if(userType=='customer'){
            trustId = deceasedDetails.trustId;
            searchQuery = {customerId:deceasedDetails.customerId,'trustId':ObjectId(revokeId)};
          }else if(userType=='advisor'){
            advisorId = deceasedDetails.advisorId;
            searchQuery = {customerId:deceasedDetails.customerId,'advisorId':ObjectId(revokeId)};
          }else if(userType=='sysadmin'){
            adminId = deceasedDetails.adminId;
            searchQuery = {customerId:deceasedDetails.customerId,'adminId':ObjectId(revokeId)};
          }
          let MarkDeceaseddata = '';
          if(searchDeceasedQuery){
            MarkDeceaseddata = await MarkDeceased.findOne(searchDeceasedQuery);
          }
            if (MarkDeceaseddata == null) {
              var insert = new MarkDeceased();
              insert.customerId = revokeId;
              insert.userType = userType;
              if(advisorId){    
                insert.advisorId = ObjectId(advisorId);
              }
              if(trustId){    
                insert.trustId = ObjectId(trustId);
              }
              if(adminId){    
                insert.adminId = ObjectId(adminId);
              }
              insert.status = 'Revoke';
              insert.createdOn = new Date();
              insert.modifiedOn = new Date();
              insert.save();
            }

          let AllusersData = await getAllTrustUsers(deceasedDetails.customerId);
          let trustList = AllusersData[0]['trustList'];
          let advisorList = AllusersData[1]['advisorList'];
          var totalCnt = advisorList.length + trustList.length;
          let finalStatus = 'Revoke';
          
          let proquery = {status:"Revoke",revokeId:ObjectId(revokeId),'modifiedOn': new Date()};
           await MarkDeceased.updateMany({customerId:deceasedDetails.customerId,status: { $ne: 'Revoke' }},{$set: proquery })

          let searchQuery = {customerId:deceasedDetails.customerId};
          if(userType=='customer'){
           searchQuery = {_id:deceasedDetails.customerId,'deceased.deceasedinfo.trustId':ObjectId(trustId)};
          }else if(userType=='advisor'){
           searchQuery = {_id:deceasedDetails.customerId,'deceased.deceasedinfo.advisorId':ObjectId(advisorId)};///deceased.deceasedinfo.status':'Active',
          }else if(userType=='sysadmin'){
            searchQuery = {_id:deceasedDetails.customerId,'deceased.deceasedinfo.userType':userType};///deceased.deceasedinfo.status':'Active',
          }

          let legacyHolderInfo = await User.findOne(searchQuery, {_id:1,username:1,firstName:1,lastName:1,deceased:1});
        
          if(advisorId){
              deceasedinfo = {'status':'Revoke','userType':userType,'trustId':'','advisorId':mongoose.Types.ObjectId(advisorId),'createdOn':new Date()};
          }
          if(trustId){
              deceasedinfo = {'status':'Revoke','userType':userType,'trustId':mongoose.Types.ObjectId(trustId),'advisorId':'','createdOn':new Date()};
          }
          if(adminId){
            deceasedinfo = {'status':'Revoke','userType':userType,'advisorId':'','trustId':'','createdOn':new Date()};//'adminId':mongoose.Types.ObjectId(adminId),
          }
          let legacyHolderName = '';
          let OldDeceasedinfo = deceasedinfo;
            if(legacyHolderInfo && legacyHolderInfo.deceased.deceasedinfo){
                OldDeceasedinfo = legacyHolderInfo.deceased.deceasedinfo;
               
                if(trustId){
                  let currentObject = OldDeceasedinfo.findIndex( (x)=> { return x.trustId == trustId });
                  OldDeceasedinfo[currentObject] = deceasedinfo;
                }
                if(advisorId){
                  let currentObject = OldDeceasedinfo.findIndex( (x)=> { return x.advisorId == advisorId });
                  OldDeceasedinfo[currentObject] = deceasedinfo;
                }
                if(adminId){
                  let currentObject = OldDeceasedinfo.findIndex( (x)=> { return x.userType == userType });
                  OldDeceasedinfo[currentObject] = deceasedinfo;
                }

                legacyHolderName = legacyHolderInfo.firstName+' '+legacyHolderInfo.lastName;
            } else {
                OldDeceasedinfo = [OldDeceasedinfo];
                let LegacyUserData = await User.findOne({_id:deceasedDetails.customerId},{_id:1,username:1,firstName:1,lastName:1,deceased:1});
                if(LegacyUserData.deceased){ 
                  let LegacyUserDataInfo = LegacyUserData.deceased.deceasedinfo
                  OldDeceasedinfo =  LegacyUserDataInfo.concat(OldDeceasedinfo);
                }
                legacyHolderInfo = LegacyUserData;
                legacyHolderName = legacyHolderInfo.firstName+' '+legacyHolderInfo.lastName;
            }
            let deceasedArray = {'status':finalStatus,revokeId:ObjectId(revokeId),'trusteeCnt':trustList.length,'advisorCnt':advisorList.length,deceasedinfo:OldDeceasedinfo};
            await User.updateOne({_id:deceasedDetails.customerId},{deceased:deceasedArray,lockoutLegacyDate:''});
           
            //Customer needs to inform he is set mark as deceased now.
            await sendDeceasedNotifyMails('CustomerRevokeAsDeceasedNotificationMail',legacyHolderInfo.username,legacyHolderInfo.firstName,legacyHolderInfo.lastName,legacyHolderName,deceasedFromName,userType);            
            await sendDeceasedNotification('RevokeAsDeceasedNotificationMail',trustList,advisorList,legacyHolderName,deceasedFromName,userType,revokeId);
            let result = { "message": "Revoke deceased successfully!",'result':deceasedDetails }
            res.status(200).send(resFormat.rSuccess(result));
          }
    })
}

function revokeOwnerDeceased(req, res) {
  let {query} = req.body;
  let {revokeId} = req.body;    
  let {userType} = req.body;
 MarkDeceased.findOne(query,async function (err,deceasedDetails){
     if (err) {
       res.status(401).send(resFormat.rError(err));
     } else {
   if(revokeId==deceasedDetails.customerId){
      let trustId = advisorId = adminId = '';
       if(!userType){
        userType = deceasedDetails.userType;
       }
       let searchDeceasedQuery = {};  
       if(userType=='customer'){
        trustId = deceasedDetails.trustId;
        searchDeceasedQuery = {customerId:deceasedDetails.customerId,'trustId':ObjectId(revokeId)};
       }else if(userType=='advisor'){
        advisorId = deceasedDetails.advisorId;
        searchDeceasedQuery = {customerId:deceasedDetails.customerId,'advisorId':ObjectId(revokeId)};
       }else if(userType=='sysadmin'){
        adminId = deceasedDetails.adminId;
        searchDeceasedQuery = {customerId:deceasedDetails.customerId,'adminId':ObjectId(revokeId)};
       }
       let MarkDeceaseddata = '';
       if(searchDeceasedQuery){
          MarkDeceaseddata = await MarkDeceased.findOne(searchDeceasedQuery);
       }

       if (MarkDeceaseddata == null) {
           var insert = new MarkDeceased();
           insert.customerId = deceasedDetails.customerId;
           insert.userType = userType;
           if(advisorId){    
             insert.advisorId = ObjectId(advisorId);
           }
           if(trustId){    
             insert.trustId = ObjectId(trustId);
           }
           if(adminId){    
             insert.adminId = ObjectId(adminId);
           }
           insert.status = 'Revoke';
           insert.createdOn = new Date();
           insert.modifiedOn = new Date();
           insert.save();
         }
         let proquery = {status:"Revoke",revokeId:ObjectId(revokeId),'modifiedOn': new Date()};
         await MarkDeceased.updateMany({customerId:deceasedDetails.customerId,status: { $ne: 'Revoke' }},{$set: proquery })

         let LegacyUserData = await User.findOne({_id:deceasedDetails.customerId},{_id:1,username:1,firstName:1,lastName:1,deceased:1});
         let updateDeceasedinfo = {'status':'Revoke','userType':userType,trustId:ObjectId(revokeId),'createdOn':new Date()};
         
         let LegacyUserDataInfo = LegacyUserData.deceased.deceasedinfo;
         let OldDeceasedinfo =  LegacyUserDataInfo.concat(updateDeceasedinfo);

         let AllusersData = await getAllTrustUsers(deceasedDetails.customerId);
         let trustList = AllusersData[0]['trustList'];let advisorList = AllusersData[1]['advisorList'];

         let deceasedArray = {status:'Revoke',revokeId:ObjectId(revokeId),'trusteeCnt':trustList.length,'advisorCnt':advisorList.length,deceasedinfo:OldDeceasedinfo};
         await User.updateOne({_id:deceasedDetails.customerId},{deceased:deceasedArray,lockoutLegacyDate:''});
        
         let legacyHolderName = LegacyUserData.firstName+' '+LegacyUserData.lastName;
         await sendDeceasedNotification('OwnerRevokeAsDeceasedNotificationMail',trustList,advisorList,legacyHolderName,'',userType,revokeId);
        
          let result = { "message": "Revoke deceased successfully!",'result':deceasedDetails }
          res.status(200).send(resFormat.rSuccess(result));
        }else{
            let result = { "message": "Invalid Request!"}
            res.status(200).send(resFormat.rSuccess(result));
         }
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
     // let advisorList =  HiredAdvisors.find({customerId:query.customerId});      //,status:{ $ne: 'Rejected' }
      HiredAdvisors.find({customerId:query.customerId},function (err, advisorList) {
        if (err) {
          res.status(401).send(resFormat.rError(err))
        } else {         
          let result = { "message": 'deceased records',deceasedData:deceasedData,advisorsList:advisorList}
          res.status(200).send(resFormat.rSuccess(result));
        }
      }).sort(order).populate('advisorId');
     }
  }).sort(order).populate('customerId').populate('trustId').populate('advisorId').populate('adminId').populate('revokeId')
 }

router.post("/viewDeceaseDetails", viewDeceased)
router.post("/markAsDeceased", markDeceased)
router.post("/revokeAsDeceased", revokeDeceased)
router.post("/revokeOwnDeceased", revokeOwnerDeceased)
router.post("/deceaseList", deceaseListing)
router.post("/deceaseView", deceaseViewDetails)
router.post("/deceaseExecutor", deceaseExecutorsDetails)
module.exports = router