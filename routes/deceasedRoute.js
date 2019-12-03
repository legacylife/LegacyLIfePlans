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
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')
var moment    = require('moment');

async function viewDeceased(req, res) {
    let { query } = req.body;
    let fields = {}
    if (req.body.fields) {
      fields = req.body.fields
    }
    let deceasedData = await MarkDeceased.findOne(query,fields, {_id:1}).populate('customerId');
    let findQuery = {}; let alreadyDeceased = '';
    let viewUserId = '';
    if(query.trustId){
      findQuery = {customerId:query.customerId,trustId: { $ne: query.trustId },status:"Active"};
      viewUserId = query.trustId;
    }else if(query.advisorId){
      findQuery = {customerId:query.customerId,advisorId: { $ne: query.advisorId},status:"Active"};
      viewUserId = query.advisorId;
    } 
    if(!deceasedData){
      alreadyDeceased = await MarkDeceased.findOne(findQuery, {_id:1,trustId:1,advisorId:1}).populate('customerId');
    }

    let message = resMessage.data( 607, [{key: '{field}',val: 'Legacy Details'}, {key: '{status}',val: 'viwed'}] )
    allActivityLog.updateActivityLogs( viewUserId, query.customerId, 'Legacy Details', message, 'Legacies')
    let result = {'deceasedData':deceasedData,'alreadyDeceased':alreadyDeceased}
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

      let { fromId }        = req.body
      let { toId }          = req.body
      let { folderName }    = req.body
            folderName      = folderName ? folderName.replace('/','') : ''
      let { subFolderName } = req.body

      if(userType=='customer'){
        fromUserId = trustId;
      }
      if(userType=='advisor'){
        fromUserId = advisorId;
      }
      if(userType=='sysadmin'){
        adminId = fromUserId = paramData.adminId;
        let found = await MarkDeceased.findOne({customerId:paramData.customerId,adminId:paramData.adminId,status:"Active"},{_id:1})
        if(found){
          paramData._id = found._id;
        }
      }
      let alreadyMDeceased = '';
      if(paramData._id){
        let findQuery = {_id:paramData._id};

        let deceasedList = await MarkDeceased.findOne(findQuery, {_id:1})
        if (deceasedList != null) {
            let proquery = {'status':'Active','modifiedOn': new Date()};
            await MarkDeceased.updateOne(findQuery,{$set: proquery })
          } 
      }else{
            var insert = new MarkDeceased();
            let findQuery = {};
            insert.customerId = paramData.customerId;
            insert.userType = userType;
            if(advisorId){    
              insert.advisorId = ObjectId(advisorId);
              findQuery = {customerId:paramData.customerId,advisorId:advisorId,status:'Active'};
            }
            if(trustId){    
              insert.trustId = ObjectId(trustId);
              findQuery = {customerId:paramData.customerId,trustId:trustId,status:'Active'};
            }
            if(adminId){    
              insert.adminId = ObjectId(adminId);
              findQuery = {customerId:paramData.customerId,adminId:adminId,status:'Active'};
            }
           
            alreadyMDeceased = await MarkDeceased.findOne(findQuery, {_id:1,deceased:1})
  
            if (alreadyMDeceased == null) {
              insert.status = 'Active';
              insert.createdOn = new Date();
              insert.modifiedOn = new Date();
              insert.save();
            }
      }

      if (!alreadyMDeceased) {
        let AllusersData = await getAllTrustUsers(paramData.customerId);
          let trustList = AllusersData[0]['trustList'];
        let advisorList = AllusersData[1]['advisorList'];
        var totalCnt = advisorList.length + trustList.length;
        let counterLabel = '';       

        let finalStatus = 'Pending'; //finalStatus will be active means user deceased when logout period is end. (using cronjob customer will be deceased.)
        let lockoutLegacyPeriodFlag = false;
         let DeceasedCnt = await MarkDeceased.find({customerId:paramData.customerId,status:"Active"})
         if(DeceasedCnt.length>=3){//When 3 users set mark as Deceased then customer lockout period is start.
          lockoutLegacyPeriodFlag = true; 
         }         

         if(adminId){ //When admin mark as Deceased then customer lockout period is start.
          lockoutLegacyPeriodFlag = true; 
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
          deceasedinfo = {'status':'Active','userType':userType,'advisorId':'','trustId':'','adminId':mongoose.Types.ObjectId(adminId),'createdOn':new Date()}
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
         if(lockoutLegacyPeriodFlag && legacyHolderInfo.lockoutLegacyDate == null){
           if(legacyHolderInfo.lockoutLegacyPeriod){
            lockoutLegacyDate = await getLegacyDate(legacyHolderInfo.lockoutLegacyPeriod);
           }else{
            lockoutLegacyDate = await getLegacyDate(2);
           }
         }else{
            lockoutLegacyDate = legacyHolderInfo.lockoutLegacyDate;
         }

         let deceasedArray = {'status':finalStatus,'trusteeCnt':trustList.length,'advisorCnt':advisorList.length,deceasedinfo:OldDeceasedinfo};
          await User.updateOne({_id:paramData.customerId},{deceased:deceasedArray,lockoutLegacyDate:lockoutLegacyDate});
            let lockoutLegacyDateWithLabel = '';  
         if(lockoutLegacyDate){
            let userdata = await User.findOne({_id:paramData.customerId},{lockoutLegacyDate:1,_id:1});
            var dates = new Date(userdata.lockoutLegacyDate);
            var lockoutLegacyDatee = dates.toISOString().substring(0, 10);
            lockoutLegacyDatee = moment(userdata.lockoutLegacyDate).format("DD-MM-YYYY");
            lockoutLegacyDateWithLabel = '<br />Lockout Legacy Date: '+lockoutLegacyDatee;
         }

         if(totalCnt>2 && DeceasedCnt && DeceasedCnt.length>0 && !adminId){
          counterLabel = '<br>'+DeceasedCnt.length+" Trustee mark as deceased out of "+totalCnt;
         }

         //Customer needs to inform he is set mark as deceased now.
         await sendDeceasedNotifyMails('CustomerMarkAsDeceasedNotificationMail',legacyHolderInfo.username,legacyHolderInfo.firstName,legacyHolderInfo.lastName,legacyHolderName,deceasedFromName,userType,lockoutLegacyDateWithLabel,counterLabel);
         await sendDeceasedNotification('MarkAsDeceasedNotificationMail',trustList,advisorList,legacyHolderName,deceasedFromName,userType,fromUserId,lockoutLegacyDateWithLabel,counterLabel);
        
         let message = resMessage.data( 607, [{key: '{field}',val: 'Mark as deceased'}, {key: '{status}',val: 'updated'}] )
         allActivityLog.updateActivityLogs( fromId, toId, 'Mark As Deceased', message)
         let result = { "message": message,"DeceasedCnt":DeceasedCnt }

         res.status(200).send(resFormat.rSuccess(result));
   
        }else{
          let message = resMessage.data( 607, [{key: '{field}',val: 'Mark as deceased'}, {key: '{status}',val: 'updated'}] )
          let result = { "message": message ,"DeceasedCnt":''}
          res.status(200).send(resFormat.rSuccess(result));
        }        
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


  function sendDeceasedNotification(template,trustList,advisorList,legacyHolderName,deceasedFromName,userType,fromUserId,lockoutLegacyDateWithLabel,counterLabel) {
    if(trustList.length>0){
      trustList.forEach( ( val, index ) => {
       if(val.trustId!=fromUserId){
          User.findOne({_id:val.trustId},{_id:1,username:1,firstName:1,lastName:1},function (err, userDetails) {
                if (err) {
                  res.status(401).send(resFormat.rError(err));
                } else {
                  if(userDetails){
                    sendDeceasedNotifyMails(template,userDetails.username,userDetails.firstName,userDetails.lastName,legacyHolderName,deceasedFromName,userType,lockoutLegacyDateWithLabel,counterLabel);
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
              sendDeceasedNotifyMails(template,userDetails.username,userDetails.firstName,userDetails.lastName,legacyHolderName,deceasedFromName,userType,lockoutLegacyDateWithLabel,counterLabel);
             }
          }
        })
        }
      })
    }
  }

  function sendDeceasedNotifyMails(template,emailId,toFname,toLname,legacyHolderName,deceasedFromName,userType,lockoutLegacyDate='',counterLabel='') {
    
    let serverUrl = constants.clientUrl + "/customer/signin";
      emailTemplatesRoute.getEmailTemplateByCode(template).then((template) => {
        if (template) {
          template = JSON.parse(JSON.stringify(template));
          let mailSubject = template.mailSubject.replace("{LegacyHolderName}",legacyHolderName);
          let body = template.mailBody.replace("{ToFname}",toFname);
          body = body.replace("{LegacyHolderName}",legacyHolderName);
          body = body.replace("{deceasedFromName}",deceasedFromName);
          body = body.replace("{lockoutLegacyDate}",lockoutLegacyDate);
          body = body.replace("{counterLabel}",counterLabel);
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

function revokeDeceased(req, res) {
     let {query} = req.body;
     let {revokeId} = req.body;    
     let {deceasedFromName} = req.body;
     let {userType} = req.body;
     let { fromId }        = req.body
     let { toId }          = req.body
     let { folderName }    = req.body
           folderName      = folderName ? folderName.replace('/','') : ''
     let { subFolderName } = req.body

    MarkDeceased.findOne(query,async function (err,deceasedDetails){
        if (err) {
          res.status(401).send(resFormat.rError(err));
        } else {
          let trustId = advisorId = adminId = '';
         
          let searchDeceasedQuery = {};  
          if(userType=='customer'){
            trustId = revokeId;
            searchDeceasedQuery = {customerId:deceasedDetails.customerId,'trustId':ObjectId(trustId)};
          }else if(userType=='advisor'){
            advisorId = revokeId;
            searchDeceasedQuery = {customerId:deceasedDetails.customerId,'advisorId':ObjectId(advisorId)};
          }else if(userType=='sysadmin'){
            adminId = revokeId;
            searchDeceasedQuery = {customerId:deceasedDetails.customerId,'adminId':ObjectId(adminId)};
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
              insert.revokeId = ObjectId(revokeId);
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
          let deceasedinfo = '';
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

            let message = resMessage.data( 607, [{key: '{field}',val: 'Revoke deceased request'}, {key: '{status}',val: 'updated'}] )
            allActivityLog.updateActivityLogs( fromId, toId, 'Revoke Deceased', message)

            let result = { "message": message,'result':deceasedDetails }
            res.status(200).send(resFormat.rSuccess(result));
          }
    })
}

function revokeOwnerDeceased(req, res) {
  let {query} = req.body;
  let {revokeId} = req.body;    
  let {userType} = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body
 MarkDeceased.findOne({customerId:query.customerId},async function (err,deceasedDetails){
     if (err) {
       res.status(401).send(resFormat.rError(err));
     } else {
   if(deceasedDetails && revokeId==deceasedDetails.customerId){
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
        
          let message = resMessage.data( 607, [{key: '{field}',val: 'Revoke own deceased request'}, {key: '{status}',val: 'updated'}] )
          allActivityLog.updateActivityLogs( fromId, toId, 'Revoke Deceased', message)

          let result = { "message": message,'result':deceasedDetails }
          res.status(200).send(resFormat.rSuccess(result));
        }else{
            let result = { "message": "Invalid Request!"}
            res.status(200).send(resFormat.rSuccess(result));
         }
    }
 })
}


 async function deceaseListing(req, res) {
  let { query } = req.body;
  let { order } = req.body;
  let groupObj = { _id:'$customerId',"customerId":{$first:'$customerId'},"advisorId":{$first: '$advisorId'},"trustId":{$first: '$trustId'},"userType": {$first: '$userType'},"documents": {$first: '$documents'},"status": {$first: '$status'}, "createdOn": {$first: '$createdOn'}, "modifiedOn": {$first: '$modifiedOn'}} 
  await MarkDeceased.aggregate([
   { $match: query }, { $group:  groupObj }
  ]).sort(order).exec(function(err, records) { 
    MarkDeceased.populate(records, {path: 'customerId'}, function(err, deceasedData) {
      let message = 'Deceased customer List!';
      if(deceasedData && deceasedData.length==0){
        message = 'No Records Found!';
      }     
      let result = { "message": message,deceasedData:deceasedData}
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
      HiredAdvisors.find({customerId:query.customerId,status:"Active"},function (err, advisorList) {
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

 //function get details of user from url param
function customerDetails(req, res) {
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
  }).populate('deceased.revokeId')
}

async function markExpire(req, res){
  let { query } = req.body;
  const data = await User.findOne({_id:query.customerId});
  if(data){
    OldDeceasedinfo = data.deceased.deceasedinfo;
    let deceasedArray = {'status':'Active','trusteeCnt':data.deceased.trusteeCnt,'advisorCnt':data.deceased.advisorCnt,deceasedinfo:OldDeceasedinfo};
    const datas = await User.updateOne({_id:query.customerId},{deceased:deceasedArray});

    let AllusersData = await getAllTrustUsers(query.customerId);
    let trustList = AllusersData[0]['trustList'];
    let advisorList = AllusersData[1]['advisorList'];
    let legacyHolderName = data.firstName+' '+data.lastName;
  // await sendDeceasedNotification('CustomerDeceasedNotificationMail',trustList,advisorList,legacyHolderName,'',userType);
    
    let result = { "message": 'Customer Expire',custData:datas}
    res.status(200).send(resFormat.rSuccess(result));
  }
}

async function advisorListing(req, res) {
let { fields, offset, query, order, limit, search,customerId } = req.body
 var existingAdv=[];
 await  HiredAdvisors.find({customerId:customerId,status:'Active'},{'advisorId': 1}).then(advisorLit => {
    advisorLit.forEach(async function(doc){
      existingAdv.push(doc.advisorId)
    });
  })
  let totalUsers = 0
    userList = await User.aggregate([
      {
        $match: {userType:'advisor',status:'Active',"subscriptionDetails.endDate": {$gte : new Date()},_id:{'$nin':existingAdv}}
      },
      {
        $project: {
          createdOn: 1, username:1, firstName:1,lastName:1,renewalOnReminderEmailDay:1,userType:1,zipcode:1,city:1,state:1,
          subscriptionDetails: {$arrayElemAt: ["$subscriptionDetails", -1]},
        }
      }
    ])
    totalUsers = userList.length;
    res.send(resFormat.rSuccess({ userList, totalUsers }));     
}


router.post("/viewDeceaseDetails", viewDeceased)
router.post("/markAsDeceased", markDeceased)
router.post("/revokeAsDeceased", revokeDeceased)
router.post("/revokeOwnDeceased", revokeOwnerDeceased)
router.post("/deceaseList", deceaseListing)
router.post("/deceaseView", deceaseViewDetails)
router.post("/deceaseExecutor", deceaseExecutorsDetails)
router.post("/customerView", customerDetails)
router.post("/advisorList", advisorListing)
router.post("/expire", markExpire)
module.exports = router