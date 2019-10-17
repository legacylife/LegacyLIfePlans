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
const executor = require('./../models/MarkAsExecutor.js')
const HiredAdvisors = require('./../models/HiredAdvisors')
const trust = require('./../models/Trustee.js')
const resMessage = require('./../helpers/responseMessages')

async function addExecutor(req, res) {
    let paramData = req.body;
    let legacyHolderName = paramData.legacyHolderName;
    if(paramData.legacyHolderName==' '){
      let userData =  await User.findOne({ _id:paramData.customerId}, {username:1});
      legacyHolderName = userData.username;
    }
    let Advproquery = {};let Trusteeproquery = {};Advproquery.executorStatus = '';Trusteeproquery.executorStatus = '';let error = '';
    await HiredAdvisors.updateMany({customerId:paramData.customerId,'status':'Active' },{$set: {'executorStatus':''} });  
    await trust.updateMany({customerId:paramData.customerId,'status':'Active' },{$set: {'executorStatus':''} });

    if(paramData.userType=='advisor'){  
        Advproquery.executorStatus = 'Active';
        await HiredAdvisors.updateOne({_id:paramData.docId},{$set:Advproquery});
    }else{
        Trusteeproquery.executorStatus = 'Active';
        await trust.updateOne({_id:paramData.docId},{$set:Trusteeproquery});
    }
    
   let oldExecutor = executor.findOne({customerId:paramData.customerId,status:'Active'});
   if(oldExecutor){
    let rmExecuteId = '';
        await executor.updateMany({customerId:paramData.customerId,status:'Active'}, { $set: {'status':'Deleted','modifiedOn':new Date()}});
        if(oldExecutor.userType=='advisor'){        
            rmExecuteId = oldExecutor.advisorId;
        }else{
            rmExecuteId = oldExecutor.trustId;
        }
        if(rmExecuteId){
            let userDetails = await User.findOne({_id:rmExecuteId},{ username: 1,firstName: 1 });
            if(userDetails && userDetails.username){
                await sendExecutorMail(userDetails.username,userDetails.firstName,legacyHolderName,'removeExecutorNotificationMail');
            }
        }
   }

   let executeId = '';
   var executer = new executor();   
   executer.customerId = paramData.customerId;
   executer.userType = paramData.userType;
   if(paramData.userType=='advisor'){        
        executeId =  executer.advisorId = ObjectId(paramData.advisorId);
   }else{
        executeId = executer.trustId = ObjectId(paramData.trustId);
   }
    executer.createdOn = new Date();
    executer.modifiedOn = new Date();
    executer.status = 'Active';
    executer.save({ $set: {} }, async function (err, newEntry) {
       if (err) {
           res.send(resFormat.rError(err))
       } else {
         if(executeId){    
            let userDetails = await User.findOne({_id:executeId},{ username: 1,firstName: 1 });
            if(userDetails && userDetails.username){
                await sendExecutorMail(userDetails.username,userDetails.firstName,legacyHolderName,'markExecutorNotificationMail');
            }
            
            let result = { "message": resMessage.data(700)}
            res.status(200).send(resFormat.rSuccess(result));
         }  
       }
   })
}

async function removeExecutor(req, res) {
    let paramData = req.body;
    let error = '';let rmExecuteId = '';let proquery = {'executorStatus':''};
    if(paramData.userType=='advisor') {  
        await HiredAdvisors.updateOne({ _id:paramData.docId }, {$set: proquery });
    }else{
        await trust.updateOne({ _id: paramData.docId }, { $set: proquery });
    }

    let rmQuery = {};
    if(paramData.userType == 'advisor'){
        rmExecuteId = paramData.advisorId;
        rmQuery = {customerId:paramData.customerId,advisorId:paramData.advisorId,status:'Active'}
    }else{   
        rmExecuteId = paramData.trustId;
        rmQuery = {customerId:paramData.customerId,trustId:paramData.trustId,status:'Active'}
    }

   await executor.updateOne(rmQuery,{$set:{'status':'Deleted','modifiedOn':new Date()}});

   let userDetails = await User.findOne({_id:rmExecuteId},{ username: 1,firstName: 1 });

   if(userDetails && userDetails.username){
    await sendExecutorMail(userDetails.username,userDetails.firstName,paramData.legacyHolderName,'removeExecutorNotificationMail');
   }

   let result = { "message": resMessage.data(701)}
   res.status(200).send(resFormat.rSuccess(result))
}


function sendExecutorMail(emailId,toName,legacyHolderName,template) {
    let serverUrl = constants.clientUrl + "/customer/signin";
  emailTemplatesRoute.getEmailTemplateByCode(template).then((template) => {
    if (template) {
      template = JSON.parse(JSON.stringify(template));
      let body = template.mailBody.replace("{ExecutorName}",toName);
      body = body.replace("{LegacyHolderName}",legacyHolderName);
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

router.post("/addAsExecutor", addExecutor)
router.post("/removeAsExecutor", removeExecutor)
module.exports = router