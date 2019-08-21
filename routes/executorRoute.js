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

function addExecutor(req, res) {
    let paramData = req.body;
    let Advproquery = {};let Trusteeproquery = {};
    Advproquery.executorStatus = '';Trusteeproquery.executorStatus = '';let error = '';
    HiredAdvisors.updateMany({ customerId:paramData.customerId,'status':'Active' }, {$set: {'executorStatus':''} }, function (err, updatedDetails) {
        if (err) {
            error = err;
        } else {
            if(paramData.userType=='advisor'){  
                Advproquery.executorStatus = 'Active';
                HiredAdvisors.updateOne({ _id:paramData.docId }, {$set: Advproquery }, function (err, updatedDetails) {
                    if (err) {
                        error += err;
                    } else {

                    }
                })
            }
        }
    }) 


    trust.updateMany({ customerId:paramData.customerId,'status':'Active' }, { $set: {'executorStatus':''} }, function (err, updatedDetails) {
        if (err) {
            error += err;
        } else {
         if(paramData.userType=='customer'){    
            Trusteeproquery.executorStatus = 'Active';
            trust.updateOne({ _id: paramData.docId }, { $set: Trusteeproquery }, function (err, updatedDetails) {
                if (err) {
                    error += err;
                } else {
    
                }
            })
         }
        }
      })

    if(error){
        res.send(resFormat.rError(error))
    }else{
        executor.findOne({customerId:paramData.customerId,status:'Active'}, function (err, oldExecutor) {
            if (err) {
            } else {
        executor.updateMany({customerId:paramData.customerId,status:'Active'}, { $set: {'status':'Deleted','modifiedOn':new Date()} }, function (err, updatedDetails) {
            if (err) {
            } else {
                let executeId = '';let rmExecuteId = '';
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
                    executer.save({ $set: {} }, function (err, newEntry) {
                    if (err) {
                        res.send(resFormat.rError(err))
                    } else {
                        if(oldExecutor.userType){
                            if(oldExecutor.userType=='advisor'){        
                                rmExecuteId = oldExecutor.advisorId;
                            }else{
                                rmExecuteId = oldExecutor.trustId;
                            }
                            User.findOne({_id:rmExecuteId},{ username: 1,firstName: 1 }, function (err, userDetails) {
                                if (err) {
                                    error += err;
                                } else {
                                    if(userDetails){
                                        let remExecuteName = userDetails.firstName;
                                        let rmExecuteEmail = userDetails.username;
                                        stat = sendExecutorMail(rmExecuteEmail,remExecuteName,paramData.legacyHolderName,'removeExecutorNotificationMail');
                                    }
                                }
                            })
                        }
                      if(executeId){    
                        User.findOne({_id:executeId},{username: 1,firstName: 1}, function (err, userDetails) {
                            if (err) {
                              res.status(401).send(resFormat.rError(error+' '+err))
                            } else {
                                if(userDetails){
                                    let executeName = userDetails.firstName;
                                    let executeEmail = userDetails.username;
                                    stat = sendExecutorMail(executeEmail,executeName,paramData.legacyHolderName,'markExecutorNotificationMail');
                                }
                                let result = { "message": "Set user as executor successfully!!" }
                                res.status(200).send(resFormat.rSuccess(result));
                            }
                        })
                      }  
                    }
                })
             }
          })
        }
     })  
  }
}


function removeExecutor(req, res) {
    let paramData = req.body;
    let error = '';let rmExecuteId = '';
    let proquery = {'executorStatus':''};
    if(paramData.userType=='advisor') {  
        HiredAdvisors.updateOne({ _id:paramData.docId }, {$set: proquery }, function (err, updatedDetails) {
            if (err) {
                error += err;
            } else {
      
            }
        })
    }   
    if(paramData.userType=='customer'){        
        trust.updateOne({ _id: paramData.docId }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
                error += err;
            } else {
    
            }
        })
    }  

    if(error){
        res.send(resFormat.rError(error))
    }else{
        let rmQuery = {};
        if(paramData.userType == 'advisor'){
            rmExecuteId = paramData.advisorId;
            rmQuery = {customerId:paramData.customerId,advisorId:paramData.advisorId,status:'Active'}
          }else{   
            rmExecuteId = paramData.trustId;
            rmQuery = {customerId:paramData.customerId,trustId:paramData.trustId,status:'Active'}
          }

        executor.updateOne(rmQuery, { $set: {'status':'Deleted','modifiedOn':new Date()} }, function (err, updatedDetails) {
            if (err) {
                res.send(resFormat.rError(err))
            } else {

                User.findOne({_id:rmExecuteId},{ username: 1,firstName: 1 }, function (err, userDetails) {
                    if (err) {
                        error += err;
                    } else {
                        if(userDetails){
                            let remExecuteName = userDetails.firstName;
                            let rmExecuteEmail = userDetails.username;
                            stat = sendExecutorMail(rmExecuteEmail,remExecuteName,paramData.legacyHolderName,'removeExecutorNotificationMail');
                        }
                    }
                })
                let result = { "message": "Remove an executor successfully!!" }
                res.status(200).send(resFormat.rSuccess(result))
            }
        })
  }
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
        to: 'pankajk@arkenea.com',//emailId,
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