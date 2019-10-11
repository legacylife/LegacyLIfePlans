var express = require('express')
var router = express.Router()
var passport = require('passport')
var request = require('request')
var jwt = require('express-jwt')
const mongoose = require('mongoose')
var async = require('async')
var crypto = require('crypto')
var fs = require('fs')
var nodemailer = require('nodemailer')
const { isEmpty, cloneDeep,map, _,forEach } = require('lodash')
const Busboy = require('busboy')
const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const lettersMessage = require('./../models/LettersMessages.js')
const s3 = require('./../helpers/s3Upload')
const actitivityLog = require('./../helpers/fileAccessLog')
const Trustee = require('./../models/Trustee.js')
const commonhelper = require('./../helpers/commonhelper')
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})


function LettersMessageList12(req, res) {
  let { fields, offset, query, trusteeQuery, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  lettersMessage.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    lettersMessage.find(query, fields, async function (err, lettersMessagesList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
          Trustee.find(trusteeQuery,{userAccess:1}, function(err, trusteeRecords) {
          
          let accessCount = []; let accessCounts = [];
          let totalTrusteeRecords = 0;
          let index = 0
          if(trusteeRecords.length>0){
            totalTrusteeRecords = trusteeRecords.length;

            async.each(trusteeRecords, (val, callback) => {
              if(val.userAccess.LegacyLifeLettersMessagesManagement.length>0){
                let cnt = 1;let index = 0;
//console.log("var->",val.userAccess.LegacyLifeLettersMessagesManagement)

                // const found = val.userAccess.LegacyLifeLettersMessagesManagement.filter((o) => o.access == "now")
                // console.log('found',found)
                // if(found.length > 0) {
                //   //accessCount[found[0].letterId] = cnt++;
                //   accessCount =  found[0].letterId+'_'+cnt++;
               
                //   index++;
                // }
                // accessCounts.push(accessCount); 
                // callback()
                async.each(val.userAccess.LegacyLifeLettersMessagesManagement, (row, done) => {
                  if(row.access ===  "now") {
                   if(accessCount[row.letterId]){
                    accessCount[row.letterId] =  accessCount[row.letterId];
                   }else{
                    accessCount[row.letterId] =  cnt++;
                  }
                  //  accessCount =  row.letterId+'_'+cnt++;
                  
                    done()
                  } else {
                   // accessCount[row.letterId] = 0;
                    //accessCounts.push(accessCount); 
                    done()
                  }
                 
                }, () => {
                  callback()
                  console.log("iterate1 complete")
                })
                accessCounts.push(accessCount); 
              } else {
                callback()
                console.log("iterate2")
              }
              
            }, function(err) {
              console.log(err)
              console.log("result")
             // console.log("--accessCounts--####->",Object.assign([], accessCount))
             // console.log("--accessCounts--####->",accessCounts)

              // forEach(accessCount, (user) => {
              //   console.log(user);
              // });
            
            
              // accessCount.forEach( ( val, index ) => {
              //   console.log("====>",index,val);
              //  })


             // let accessCounts = {accessCount:'123',accessCount2:'234'};
            //  res.send(resFormat.rSuccess({lettersMessagesList,totalRecords,totalTrusteeRecords,accessCounts}));
            })
            console.log("--accessCounts--####->",accessCounts)
            res.send(resFormat.rSuccess({lettersMessagesList,totalRecords,totalTrusteeRecords,accessCounts}));
          }else{
            console.log("--accessCount---==----->",accessCount)
             
          }
        })

          // let lettersMessagesListTemp = map(lettersMessagesList, (row, index) => {
          //   let updateVl =  _.findIndex(accessCount, function(o) { if( o == row._id) {return o[row._id]}else{ return 0}});
          //   let newRow = Object.assign({}, row, { "count": `${updateVl}` })
          //   return newRow
          // });
          //console.log('lettersMessagesList---',lettersMessagesListTemp);         
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function LettersMessageList(req, res) {
  let { fields, offset, query, trusteeQuery, order, limit, search,  } = req.body;
  // loginUserId
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  lettersMessage.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    lettersMessage.find(query, fields, async function (err, lettersMessagesListTemp) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
         // Trustee.find(trusteeQuery,{userAccess:1}, function(err, trusteeRecords) {
          let totalTrusteeRecords = 0;
          let lettersMessagesList = lettersMessagesListTemp;
          //  let lettersMessagesList = map(lettersMessagesListTemp,  (row, index) => {
          //   //  let updateVl = '5';_.findIndex(accessCount, function(o) { if( o == row._id) {return o[row._id]}else{ return 0}});
          //    let updateVl =  getTrusteeFlag(row._id,trusteeQuery,loginUserId);
          //    let newRow = Object.assign({}, row._doc, { "accessFlag": `${updateVl}` })
          //    return newRow
          //  });
            res.send(resFormat.rSuccess({lettersMessagesList,totalRecords,totalTrusteeRecords}));
       // })
     }
    }).sort(order).skip(offset).limit(limit)
  })
}

async function getTrusteeFlag(id,trusteeQuery,trustId) {
  //console.log("===>",id);
  let trusteeRecords = await Trustee.findOne({"userAccess.LegacyLifeLettersMessagesManagement.letterId":id,"trustId":trustId,status:"Active"},{});
//  console.log("trusteeRecords===>",trusteeRecords);
  if(trusteeRecords){
    trusteeRecords.userAccess.LegacyLifeLettersMessagesManagement.filter(dtype => {
     // console.log("@@@@@@@@@@@@@@@@@@@@@@@===>",dtype.access)
      return dtype.access;
    });//.map(el => el)
    //  async.each(trusteeRecords, (val, callback) => {
    //     console.log("===>",val.userAccess.LegacyLifeLettersMessagesManagement);
    //     return
    //   })
  }else{
    return 'never';
  }
  
}

function LettersMessageFormUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  var logData = {}
  logData.fileName = proquery.title;
  logData.folderName = 'letters-messages';
  logData.subFolderName = 'letters-messages';

  if(query._id){
    lettersMessage.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'added';
          if (custData.title){
            resText = 'updated';
          }
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          proquery.modifiedOn = new Date();
          lettersMessage.updateOne({ _id: custData._id }, { $set: proquery }, async function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);
              //let result = { "message": "Letter and message "+resText+" successfully" }
              let message = resMessage.data( 607, [{key:'{field}',val:"Letter and Message details"},{key:'{status}',val: resText}] )
              let result = { "message": message }
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "Letter and Message "+resText, message, folderName, subFolderName )
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let result = { "message": "No record found." }
          res.send(resFormat.rError(result));
        }
      }
    })
  } 
  else { 
    let { proquery } = req.body;
    var insert = new lettersMessage();
    insert.customerId = proquery.customerId;
    insert.customerLegacyId = proquery.customerLegacyId;
    insert.customerLegacyType = proquery.customerLegacyType;
    insert.title = proquery.title;
    insert.subject = proquery.subject;            
    insert.documents = proquery.documents;
    insert.letterBox = proquery.letterBox;
    insert.status = 'Active';
    insert.createdOn = new Date();
    insert.modifiedOn = new Date();
    insert.save({$set:proquery}, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "Legacy Life Letters & Messages";  
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = query.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        //let result = { "message": "Letter and message details added successfully!" }
        let message = resMessage.data( 607, [{key:'{field}',val:"Letter and message details"},{key:'{status}',val: 'added'}] )
        let result = { "message": message }
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "Letter and Message added", message, folderName, subFolderName )
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function viewLettersMessages(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  lettersMessage.findOne(query, fields, function (err, lettersMessagesList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(lettersMessagesList))
    }
  })
}

function deleteLettersMessages(req, res) {
  let { query } = req.body;
  let fields = { }
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName.replace('/','')
  let { subFolderName } = req.body

  lettersMessage.findOne(query, fields, function (err, Info) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus,documents:[] }
      lettersMessage.update({ _id: Info._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          if(Info.documents.length>0){
            var fileArray = []; 
            let letterMessageFilePath = Info.customerId+'/'+constants.s3Details.letterMessageFilePath;
              async.each(Info.documents, async (val) => {
              await fileArray.push({"Key":letterMessageFilePath+val.tmpName});
            })
            s3.deleteFiles(fileArray,letterMessageFilePath);   
          }
          actitivityLog.removeActivityLog(Info._id);
          //let result = { "message": "Record deleted successfully!" }
          let message = resMessage.data( 607, [{key:'{field}',val:"Letter Messages"},{key:'{status}',val: 'deleted'}] )
          let result = { "message": message }
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Letter Messages deleted ", message, folderName, subFolderName )
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

router.post("/view-lettersMessages-details", viewLettersMessages)
router.post("/letters-message-listing", LettersMessageList)
router.post("/letters-form-submit", LettersMessageFormUpdate)
router.post("/delete-lettersMessages", deleteLettersMessages)
module.exports = router