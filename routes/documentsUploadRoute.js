var express = require('express')
var router = express.Router()
const resFormat = require('./../helpers/responseFormat')
var fs = require('fs')
var path = require('path')
var cors = require('cors')
const Busboy = require('busboy')
var constants = require('./../config/constants')
const s3 = require('./../helpers/s3Upload')
const User = require('./../models/Users')
const personalIdProof = require('./../models/personalIdProof.js')
const LegalStuff = require('./../models/LegalStuff.js')
const finalWish = require('./../models/FinalWishes.js')
const pet = require('./../models/Pets.js')
const timeCapsule = require('./../models/TimeCapsule.js')
const insurance = require('../models/Insurance.js')
const Finance = require('../models/Finances.js')
const Invite = require('../models/Invite.js')
const InviteTemp = require('../models/InviteTemp.js')
const MarkDeceased = require('../models/MarkAsDeceased.js')
const coachCorner = require('../models/coachCorner.js')
var s3Archiver = require('s3-archiver');
var async = require('async');
var archiver = require('archiver');
var stream =require('stream');
const AWS = require('aws-sdk')
var S3Sizer = require('aws-s3-size');
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')
var customerCms = require('./../models/CustomerCms.js')

//const XmlStream = require('xml-stream')
const docFilePath = constants.s3Details.advisorsDocumentsPath;
const IDdocFilePath = constants.s3Details.myEssentialsDocumentsPath;
const legalStuffdocFilePath = constants.s3Details.legalStuffDocumentsPath;
const finalWishesFilePath = constants.s3Details.finalWishesFilePath;
const petsFilePath = constants.s3Details.petsFilePath;
const timeCapsuleFilePath = constants.s3Details.timeCapsuleFilePath;
const insuranceFilePath = constants.s3Details.insuranceFilePath;
const financeFilePath = constants.s3Details.financeFilePath;
const letterMessageFilePath = constants.s3Details.letterMessageFilePath;
const inviteDocumentsPath = constants.s3Details.inviteDocumentsPath;
const deceasedFilessPath = constants.s3Details.deceasedFilessPath;
const coachCornerArticlePath = constants.s3Details.coachCornerArticlePath;
const assetsPath = constants.s3Details.assetsPath;
const lettersMessage = require('./../models/LettersMessages.js')
var DIR = './uploads/';

process.setMaxListeners(0);
router.post('/advisorDocument', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    const {query:{userId}} = req;
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      let tmpallfiles = {};
      let oldTmpFiles = [];
      if(userId){
        User.findOne({ _id: userId,userType: 'advisor' },{advisorDocuments:1,_id:1}, function (err, result) {
          if (err) {
            res.status(500).send(resFormat.rError(err))
          } else if (result) {           
           
          let ext = filename.split('.')
          ext = ext[ext.length - 1];
          var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc"];
          let resp = isExtension(ext,fileExts);

          if(resp){          
              const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
              fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
              file.pipe(fstream);
              fstream.on('close', async function () {
                await s3.uploadFile(newFilename, userId+'/'+docFilePath);  
                if(result.advisorDocuments){
                  oldTmpFiles = result.advisorDocuments;
                }
                tmpallfiles = {
                  "title" : filename,
                  "size" : encoding,
                  "extention" : mimetype,
                  "tmpName" : newFilename
                }
                oldTmpFiles.push(tmpallfiles);           
                User.updateOne({ _id: userId }, { $set: { advisorDocuments: oldTmpFiles } }, function (err, updatedUser) {
                  if (err) {
                    res.send(resFormat.rError(err))
                  } else {
                    getuserFolderSize(userId);
                    let message = resMessage.data( 607, [{key: '{field}',val: 'Advisor Document'}, {key: '{status}',val: 'uploaded'}] )
                    //Update activity logs
                    allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, advisorDocuments, '', fileName)
                    
                    let result = { userId:userId, allDocs:tmpallfiles, "message": message }
                    res.send(resFormat.rSuccess(result))
                  }
                })
              })
          }else{
            if(result.advisorDocuments){
              oldTmpFiles = result.advisorDocuments;
            }
            let results = { userId:userId, allDocs:oldTmpFiles, "message": "Invalid file extension!" }
            res.send(resFormat.rSuccess(results));
         }
        }
      })
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

router.post('/myEssentialsID', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    const {query:{userId}} = req;
    const {query:{ProfileId}} = req;
  
    let q = {customerId: userId}
    if(ProfileId && ProfileId!=''){
      q = {_id : ProfileId}
    }
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      let tmpallfiles = {};
      let oldTmpFiles = [];
      if(userId){
          let ext = filename.split('.')
          ext = ext[ext.length - 1];
          var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc"];
          let resp = isExtension(ext,fileExts);
          if(!resp){
            let results = { userId:userId, allDocs:oldTmpFiles, "message": "Invalid file extension!" }
            res.send(resFormat.rSuccess(results))
          } else{
             if(ProfileId){
              const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
                fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
                file.pipe(fstream);
                fstream.on('close', async function () {
                  await s3.uploadFile(newFilename,userId+'/'+IDdocFilePath);  
                  tmpallfiles = {
                    "title" : filename,
                    "size" : encoding,
                    "extention" : mimetype,
                    "tmpName" : newFilename
                  }
              
                  personalIdProof.findOne(q,{documents:1,_id:1}, function (err, result) {
                    if (err) {
                        res.status(500).send(resFormat.rError(err))
                    } else {       
                    if (result) {                              
                        if(result.documents){
                          oldTmpFiles = result.documents;
                        }
                        oldTmpFiles.push(tmpallfiles); 
                        personalIdProof.updateOne(q, { $set: { documents: oldTmpFiles } }, function (err, updatedUser) {
                          if (err) {
                            res.send(resFormat.rError(err))
                          } else {
                            getuserFolderSize(userId);
                            let message = resMessage.data( 607, [{key: '{field}',val: 'ID proof Document'}, {key: '{status}',val: 'uploaded'}] )
                            //Update activity logs
                            allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, IDdocFilePath, '', fileName)
                    
                            let result = { userId:userId, allDocs:tmpallfiles, "message": message }
                            res.send(resFormat.rSuccess(result))
                          }
                       })
                      }
                    } 
                    })
                  })
              }else{
                const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
                fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
                file.pipe(fstream);
                fstream.on('close', async function () {
                  await s3.uploadFile(newFilename,userId+'/'+IDdocFilePath);  
                  
                  tmpallfiles = {
                    "title" : filename,
                    "size" : encoding,
                    "extention" : mimetype,
                    "tmpName" : newFilename
                  }
                oldTmpFiles.push(tmpallfiles); 
                var personal = new personalIdProof();
                personal.customerId = userId;
                personal.documents = oldTmpFiles;
                personal.status = 'Pending';
                personal.createdOn = new Date();
                personal.save({}, function (err, newEntry) {
                if (err) {
                  res.send(resFormat.rError(err))
                   } else {
                     getuserFolderSize(userId);
                     let message = resMessage.data( 607, [{key: '{field}',val: 'ID proof Document'}, {key: '{status}',val: 'uploaded'}] )
                    //Update activity logs
                    allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, IDdocFilePath, '', fileName)
                    let result = { "message": message }
                     
                     res.status(200).send(resFormat.rSuccess(result))
                   }
                 })
                })   
          }
         } 
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

router.post('/legalStuff', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    const {query:{userId}} = req;
    const {query:{ProfileId}} = req;
    const {query:{folderName}} = req;
    
    let q = {customerId: userId}
    if(ProfileId && ProfileId!=''){
      q = {_id : ProfileId}
    }
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      let tmpallfiles = {};
      let oldTmpFiles = [];
      if(userId){
          let ext = filename.split('.')
          ext = ext[ext.length - 1];
          var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc"];
          let resp = isExtension(ext,fileExts);
          if(!resp){
            let results = { userId:userId, allDocs:oldTmpFiles, "message": "Invalid file extension!" }
            res.send(resFormat.rSuccess(results))
          } else{
                 
          if(ProfileId){
              const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
              fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
              file.pipe(fstream);
              fstream.on('close', async function () {
                await s3.uploadFile(newFilename,userId+'/'+legalStuffdocFilePath);                  
                tmpallfiles = {
                  "title" : filename,
                  "size" : encoding,
                  "extention" : mimetype,
                  "tmpName" : newFilename
                }
              LegalStuff.findOne(q,{documents:1,_id:1}, function (err, result) {
                    if (err) {
                        res.status(500).send(resFormat.rError(err))
                    } else {       
                    if (result) {                   
                        if(result.documents){
                          oldTmpFiles = result.documents;
                        }                
                        oldTmpFiles.push(tmpallfiles);  
                        LegalStuff.updateOne(q, { $set: { documents: oldTmpFiles } }, function (err, updatedUser) {
                          if (err) {
                            res.send(resFormat.rError(err))
                          } else {
                            getuserFolderSize(userId);
                            let message = resMessage.data( 607, [{key: '{field}',val: 'Legal Stuff Document'}, {key: '{status}',val: 'uploaded'}] )
                            //Update activity logs
                            allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, legalStuffdocFilePath, '', fileName)
                            
                            let result = { userId:userId, allDocs:tmpallfiles, "message": message }
                            res.send(resFormat.rSuccess(result))
                          }
                       })
                      }
                    } 
                    })
                 })
              }else{
                const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
                fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
                file.pipe(fstream);
                fstream.on('close', async function () {
                  await s3.uploadFile(newFilename,userId+'/'+legalStuffdocFilePath);  
                  tmpallfiles = {
                    "title" : filename,
                    "size" : encoding,
                    "extention" : mimetype,
                    "tmpName" : newFilename
                  }
              oldTmpFiles.push(tmpallfiles);  
               var legal = new LegalStuff();
                  legal.customerId = userId;
                  legal.subFolderName = folderName;
                  legal.documents = oldTmpFiles;
                  legal.status = 'Pending';
                  legal.createdOn = new Date();
                  legal.save({}, function (err, newEntry) {
                  if (err) {
                  res.send(resFormat.rError(err))
                   } else {
                    getuserFolderSize(userId);
                    let message = resMessage.data( 607, [{key: '{field}',val: 'Legal Stuff Document'}, {key: '{status}',val: 'uploaded'}] )
                    //Update activity logs
                    allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, legalStuffdocFilePath, '', fileName)
                    let result = { "message": message }
                    
                     res.status(200).send(resFormat.rSuccess(result))
                   }
                 })

              })
           }
         } 
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

router.post('/finalWishes', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    const {query:{userId}} = req;
    const {query:{ProfileId}} = req;
    const {query:{folderName}} = req;
    
    let q = {customerId: userId}
    if(ProfileId && ProfileId!=''){
      q = {_id : ProfileId}
    }
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      let tmpallfiles = {};
      let oldTmpFiles = [];
      if(userId){
          let ext = filename.split('.')
          ext = ext[ext.length - 1];
          var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc"];
          let resp = isExtension(ext,fileExts);
          if(!resp){
            let results = { userId:userId, allDocs:oldTmpFiles, "message": "Invalid file extension!" }
            res.send(resFormat.rSuccess(results))
          } else{
                 
          if(ProfileId){
              const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
              fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
              file.pipe(fstream);
              fstream.on('close', async function () {
                await s3.uploadFile(newFilename,userId+'/'+finalWishesFilePath);                  
                tmpallfiles = {
                  "title" : filename,
                  "size" : encoding,
                  "extention" : mimetype,
                  "tmpName" : newFilename
                }
                finalWish.findOne(q,{documents:1,_id:1}, function (err, result) {
                    if (err) {
                        res.status(500).send(resFormat.rError(err))
                    } else {       
                    if (result) {                          
                        if(result.documents){
                          oldTmpFiles = result.documents;
                        }             
                        oldTmpFiles.push(tmpallfiles);  
                        finalWish.updateOne(q, { $set: { documents: oldTmpFiles } }, function (err, updatedUser) {
                          if (err) {
                            res.send(resFormat.rError(err))
                          } else {
                            getuserFolderSize(userId);
                            let message = resMessage.data( 607, [{key: '{field}',val: 'Final Wishesh Document'}, {key: '{status}',val: 'uploaded'}] )
                            //Update activity logs
                            allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, finalWishesFilePath, '', fileName)
                            
                            let result = { userId:userId, allDocs:tmpallfiles, "message": message }
                            res.send(resFormat.rSuccess(result))
                          }
                       })
                      }
                    } 
                    })
                 })
              }else{
                const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
                fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
                file.pipe(fstream);
                fstream.on('close', async function () {
                  await s3.uploadFile(newFilename,userId+'/'+finalWishesFilePath);  
                  tmpallfiles = {
                    "title" : filename,
                    "size" : encoding,
                    "extention" : mimetype,
                    "tmpName" : newFilename
                  }
              oldTmpFiles.push(tmpallfiles);  
                var insert = new finalWish();
                insert.customerId = userId;
                insert.subFolderName = folderName;
                insert.documents = oldTmpFiles;
                insert.status = 'Pending';
                insert.createdOn = new Date();
                insert.save({}, function (err, newEntry) {
                  if (err) {
                  res.send(resFormat.rError(err))
                   } else {
                    getuserFolderSize(userId);
                    let message = resMessage.data( 607, [{key: '{field}',val: 'Final Wishesh Document'}, {key: '{status}',val: 'uploaded'}] )
                    //Update activity logs
                    allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, finalWishesFilePath, '', fileName)
                    let result = { "message": message }
                    
                     res.status(200).send(resFormat.rSuccess(result))
                   }
                 })

              })
           }
         } 
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

router.post('/petsdocuments', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    const {query:{userId}} = req;
    const {query:{ProfileId}} = req;
    const {query:{folderName}} = req;
    
    let q = {customerId: userId}
    if(ProfileId && ProfileId!=''){
      q = {_id : ProfileId}
    }
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      let tmpallfiles = {};
      let oldTmpFiles = [];
      if(userId){
          let ext = filename.split('.')
          ext = ext[ext.length - 1];
          var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc"];
          let resp = isExtension(ext,fileExts);
          if(!resp){
            let results = { userId:userId, allDocs:oldTmpFiles, "message": "Invalid file extension!" }
            res.send(resFormat.rSuccess(results))
          } else{
                 
          if(ProfileId){
              const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
              fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
              file.pipe(fstream);
              fstream.on('close', async function () {
                await s3.uploadFile(newFilename,userId+'/'+petsFilePath);                  
                tmpallfiles = {
                  "title" : filename,
                  "size" : encoding,
                  "extention" : mimetype,
                  "tmpName" : newFilename
                }
                pet.findOne(q,{documents:1,_id:1}, function (err, result) {
                    if (err) {
                        res.status(500).send(resFormat.rError(err))
                    } else {       
                    if (result) {                          
                        if(result.documents){
                          oldTmpFiles = result.documents;
                        }             
                        oldTmpFiles.push(tmpallfiles);  
                        pet.updateOne(q, { $set: { documents: oldTmpFiles } }, function (err, updatedUser) {
                          if (err) {
                            res.send(resFormat.rError(err))
                          } else {
                            getuserFolderSize(userId);
                            let message = resMessage.data( 607, [{key: '{field}',val: 'Pets Document'}, {key: '{status}',val: 'uploaded'}] )
                            //Update activity logs
                            allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, petsFilePath, '', fileName)
                            
                            let result = { userId:userId, allDocs:tmpallfiles, "message": message }
                            res.send(resFormat.rSuccess(result))
                          }
                       })
                      }
                    } 
                    })
                 })
              }else{
                const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
                fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
                file.pipe(fstream);
                fstream.on('close', async function () {
                  await s3.uploadFile(newFilename,userId+'/'+petsFilePath);  
                  tmpallfiles = {
                    "title" : filename,
                    "size" : encoding,
                    "extention" : mimetype,
                    "tmpName" : newFilename
                  }
              oldTmpFiles.push(tmpallfiles);  
                var insert = new pet();
                insert.customerId = userId;
                insert.documents = oldTmpFiles;
                insert.status = 'Pending';
                insert.createdOn = new Date();
                insert.save({}, function (err, newEntry) {
                  if (err) {
                  res.send(resFormat.rError(err))
                   } else {
                    getuserFolderSize(userId);
                    let message = resMessage.data( 607, [{key: '{field}',val: 'Pets Document'}, {key: '{status}',val: 'uploaded'}] )
                    //Update activity logs
                    allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, petsFilePath, '', fileName)
                    let result = { "message": message }
                    
                     res.status(200).send(resFormat.rSuccess(result))
                   }
                 })

              })
           }
         } 
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

router.post('/timeCapsuledocuments', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    const {query:{userId}} = req;
    const {query:{ProfileId}} = req;
    const {query:{folderName}} = req;
    
    let q = {customerId: userId}
    if(ProfileId && ProfileId!=''){
      q = {_id : ProfileId}
    }
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      let tmpallfiles = {};
      let oldTmpFiles = [];
      if(userId){
          let ext = filename.split('.')
          ext = ext[ext.length - 1];
          var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc","mov","mp3", "mpeg", "wav", "ogg", "opus", "bmp", "tiff", "svg", "webm", "mpeg4", "3gpp", "avi", "mpegps", "wmv", "flv"];
          
          let resp = isExtension(ext,fileExts);
          if(!resp){
            let results = { userId:userId, allDocs:oldTmpFiles, "message": "Invalid file extension!" }
            res.send(resFormat.rSuccess(results))
          } else{
                 
          if(ProfileId){
              const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
              fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
              file.pipe(fstream);
              fstream.on('close', async function () {
                await s3.uploadFile(newFilename,userId+'/'+timeCapsuleFilePath);                  
                tmpallfiles = {
                  "title" : filename,
                  "size" : encoding,
                  "extention" : mimetype,
                  "tmpName" : newFilename
                }
                timeCapsule.findOne(q,{documents:1,_id:1}, function (err, result) {
                    if (err) {
                        res.status(500).send(resFormat.rError(err))
                    } else {       
                    if (result) {                          
                        if(result.documents){
                          oldTmpFiles = result.documents;
                        }             
                        oldTmpFiles.push(tmpallfiles);  
                        timeCapsule.updateOne(q, { $set: { documents: oldTmpFiles } }, function (err, updatedUser) {
                          if (err) {
                            res.send(resFormat.rError(err))
                          } else {
                            getuserFolderSize(userId);
                            let message = resMessage.data( 607, [{key: '{field}',val: 'Time capsule Document'}, {key: '{status}',val: 'uploaded'}] )
                            //Update activity logs
                            allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, timeCapsuleFilePath, '', fileName)
                            
                            let result = { userId:userId, allDocs:tmpallfiles, "message": "Document uploaded successfully!" }
                            res.send(resFormat.rSuccess(result))
                          }
                       })
                      }
                    } 
                    })
                 })
              }else{
                const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
                fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
                file.pipe(fstream);
                fstream.on('close', async function () {
                  await s3.uploadFile(newFilename,userId+'/'+timeCapsuleFilePath);  
                  tmpallfiles = {
                    "title" : filename,
                    "size" : encoding,
                    "extention" : mimetype,
                    "tmpName" : newFilename
                  }
              oldTmpFiles.push(tmpallfiles);  
                var insert = new timeCapsule();
                insert.customerId = userId;
                insert.documents = oldTmpFiles;
                insert.status = 'Pending';
                insert.createdOn = new Date();
                insert.save({}, function (err, newEntry) {
                  if (err) {
                  res.send(resFormat.rError(err))
                   } else {
                    getuserFolderSize(userId);
                    let message = resMessage.data( 607, [{key: '{field}',val: 'Time capsule Document'}, {key: '{status}',val: 'uploaded'}] )
                    //Update activity logs
                    allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, timeCapsuleFilePath, '', fileName)
                    let result = { "message": message }
                     res.status(200).send(resFormat.rSuccess(result))
                   }
                 })

              })
           }
         } 
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

router.post('/insuranceDocuments', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    const {query:{userId}} = req;
    const {query:{ProfileId}} = req;
    const {query:{folderName}} = req;
    
    let q = {customerId: userId}
    if(ProfileId && ProfileId!=''){
      q = {_id : ProfileId}
    }
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      let tmpallfiles = {};
      let oldTmpFiles = [];
      if(userId){
          let ext = filename.split('.')
          ext = ext[ext.length - 1];
          var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc"];
          let resp = isExtension(ext,fileExts);
          if(!resp){
            let results = { userId:userId, allDocs:oldTmpFiles, "message": "Invalid file extension!" }
            res.send(resFormat.rSuccess(results))
          } else{
                 
          if(ProfileId){
              const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
              fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
              file.pipe(fstream);
              fstream.on('close', async function () {
                await s3.uploadFile(newFilename,userId+'/'+insuranceFilePath);                  
                tmpallfiles = {
                  "title" : filename,
                  "size" : encoding,
                  "extention" : mimetype,
                  "tmpName" : newFilename
                }
                insurance.findOne(q,{documents:1,_id:1}, function (err, result) {
                    if (err) {
                        res.status(500).send(resFormat.rError(err))
                    } else {       
                    if (result) {                          
                        if(result.documents){
                          oldTmpFiles = result.documents;
                        }             
                        oldTmpFiles.push(tmpallfiles);  
                        insurance.updateOne(q, { $set: { documents: oldTmpFiles } }, function (err, updatedUser) {
                          if (err) {
                            res.send(resFormat.rError(err))
                          } else {
                            getuserFolderSize(userId);
                            let message = resMessage.data( 607, [{key: '{field}',val: 'Insurance Document'}, {key: '{status}',val: 'uploaded'}] )
                            //Update activity logs
                            allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, insuranceFilePath, '', fileName)
                            let result = { userId:userId, allDocs:tmpallfiles, "message": message }
                            res.send(resFormat.rSuccess(result))
                          }
                       })
                      }
                    } 
                    })
                 })
              }else{
                const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
                fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
                file.pipe(fstream);
                fstream.on('close', async function () {
                  await s3.uploadFile(newFilename,userId+'/'+insuranceFilePath);  
                  tmpallfiles = {
                    "title" : filename,
                    "size" : encoding,
                    "extention" : mimetype,
                    "tmpName" : newFilename
                  }
              oldTmpFiles.push(tmpallfiles);  
                var insert = new insurance();
                insert.customerId = userId;
                insert.documents = oldTmpFiles;
                insert.status = 'Pending';
                insert.createdOn = new Date();
                insert.save({}, function (err, newEntry) {
                  if (err) {
                  res.send(resFormat.rError(err))
                   } else {
                    getuserFolderSize(userId);
                    let message = resMessage.data( 607, [{key: '{field}',val: 'Insurance Document'}, {key: '{status}',val: 'uploaded'}] )
                    //Update activity logs
                    allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, insuranceFilePath, '', fileName)
                    let result = { "message": message }
                    //let result = { "message": "Document uploaded successfully!" }
                     res.status(200).send(resFormat.rSuccess(result))
                   }
                 })
              })
           }
         } 
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

router.post('/financeDocuments', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    const {query:{userId}} = req;
    const {query:{ProfileId}} = req;
    const {query:{folderName}} = req;
    
    let q = {customerId: userId}
    if(ProfileId && ProfileId!=''){
      q = {_id : ProfileId}
    }
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      let tmpallfiles = {};
      let oldTmpFiles = [];
      if(userId){
          let ext = filename.split('.')
          ext = ext[ext.length - 1];
          var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc"];
          let resp = isExtension(ext,fileExts);
          if(!resp){
            let results = { userId:userId, allDocs:oldTmpFiles, "message": "Invalid file extension!" }
            res.send(resFormat.rSuccess(results))
          } else{
                 
          if(ProfileId){
              const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
              fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
              file.pipe(fstream);
              fstream.on('close', async function () {
                await s3.uploadFile(newFilename,userId+'/'+financeFilePath);                  
                tmpallfiles = {
                  "title" : filename,
                  "size" : encoding,
                  "extention" : mimetype,
                  "tmpName" : newFilename
                }
                Finance.findOne(q,{documents:1,_id:1}, function (err, result) {
                    if (err) {
                        res.status(500).send(resFormat.rError(err))
                    } else {       
                    if (result) {                          
                        if(result.documents){
                          oldTmpFiles = result.documents;
                        }             
                        oldTmpFiles.push(tmpallfiles);  
                        Finance.updateOne(q, { $set: { documents: oldTmpFiles } }, function (err, updatedUser) {
                          if (err) {
                            res.send(resFormat.rError(err))
                          } else {
                            getuserFolderSize(userId);
                            let message = resMessage.data( 607, [{key: '{field}',val: 'Finance Document'}, {key: '{status}',val: 'uploaded'}] )
                            //Update activity logs
                            allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, financeFilePath, '', fileName)
                            //let result = { "message": message }
                            let result = { userId:userId, allDocs:tmpallfiles, "message": message }
                            res.send(resFormat.rSuccess(result))
                          }
                       })
                      }
                    } 
                    })
                 })
              }else{
                const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
                fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
                file.pipe(fstream);
                fstream.on('close', async function () {
                  await s3.uploadFile(newFilename,userId+'/'+financeFilePath);  
                  tmpallfiles = {
                    "title" : filename,
                    "size" : encoding,
                    "extention" : mimetype,
                    "tmpName" : newFilename
                  }
              oldTmpFiles.push(tmpallfiles);  
                var insert = new Finance();
                insert.customerId = userId;
                insert.documents = oldTmpFiles;
                insert.status = 'Pending';
                insert.createdOn = new Date();
                insert.save({}, function (err, newEntry) {
                  if (err) {
                  res.send(resFormat.rError(err))
                   } else {
                    getuserFolderSize(userId);
                    let message = resMessage.data( 607, [{key: '{field}',val: 'Finance Document'}, {key: '{status}',val: 'uploaded'}] )
                    //Update activity logs
                    allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, financeFilePath, '', fileName)
                    let result = { "message": message }
                    
                     res.status(200).send(resFormat.rSuccess(result))
                   }
                 })

              })
           }
         } 
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

router.post('/letterMessage', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    const {query:{userId}} = req;
    const {query:{ProfileId}} = req;
    const {query:{folderName}} = req;
    
    let q = {customerId: userId}
    if(ProfileId && ProfileId!=''){
      q = {_id : ProfileId}
    }
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      let tmpallfiles = {};
      let oldTmpFiles = [];
      if(userId){
          let ext = filename.split('.')
          ext = ext[ext.length - 1];
          var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc"];
          let resp = isExtension(ext,fileExts);
          if(!resp){
            let results = { userId:userId, allDocs:oldTmpFiles, "message": "Invalid file extension!" }
            res.send(resFormat.rSuccess(results))
          } else{
                 
          if(ProfileId){
              const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
              fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
              file.pipe(fstream);
              fstream.on('close', async function () {
                await s3.uploadFile(newFilename,userId+'/'+letterMessageFilePath);                  
                tmpallfiles = {
                  "title" : filename,
                  "size" : encoding,
                  "extention" : mimetype,
                  "tmpName" : newFilename
                }
                lettersMessage.findOne(q,{documents:1,_id:1}, function (err, result) {
                    if (err) {
                        res.status(500).send(resFormat.rError(err))
                    } else {       
                    if (result) {                          
                        if(result.documents){
                          oldTmpFiles = result.documents;
                        }             
                        oldTmpFiles.push(tmpallfiles);  
                        lettersMessage.updateOne(q, { $set: { documents: oldTmpFiles } }, function (err, updatedUser) {
                          if (err) {
                            res.send(resFormat.rError(err))
                          } else {
                            getuserFolderSize(userId);
                            
                            let message = resMessage.data( 607, [{key: '{field}',val: 'Letter Message Document'}, {key: '{status}',val: 'uploaded'}] )
                            //Update activity logs
                            allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, letterMessageFilePath, '', fileName)
                            
                            let result = { userId:userId, allDocs:tmpallfiles, "message": message }
                            res.send(resFormat.rSuccess(result))
                          }
                       })
                      }
                    } 
                    })
                 })
              }else{
                const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
                fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
                file.pipe(fstream);
                fstream.on('close', async function () {
                  await s3.uploadFile(newFilename,userId+'/'+letterMessageFilePath);  
                  tmpallfiles = {
                    "title" : filename,
                    "size" : encoding,
                    "extention" : mimetype,
                    "tmpName" : newFilename
                  }
              oldTmpFiles.push(tmpallfiles);  
                var insert = new lettersMessage();
                insert.customerId = userId;
                insert.documents = oldTmpFiles;
                insert.status = 'Pending';
                insert.createdOn = new Date();
                insert.save({}, function (err, newEntry) {
                  if (err) {
                  res.send(resFormat.rError(err))
                   } else {
                    getuserFolderSize(userId);
                    //let result = { "message": "Document uploaded successfully!" }
                    let message = resMessage.data( 607, [{key: '{field}',val: 'Letter Message Document'}, {key: '{status}',val: 'uploaded'}] )
                    //Update activity logs
                    allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, letterMessageFilePath, '', fileName)
                    let result = { "message": message }
                     res.status(200).send(resFormat.rSuccess(result))
                   }
                 })

              })
           }
         } 
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

router.post('/customerHomeDocuments', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    const {query:{docId}} = req;
    const {query:{attrName}} = req;
    let updateFields = '';
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      if(docId){
        customerCms.findOne({ _id: docId},{_id:1}, function (err, result) {
          if (err) {
            res.status(500).send(resFormat.rError(err))
          } else if (result) {                      
          let ext = filename.split('.')
          ext = ext[ext.length - 1];
          var fileExts = ["jpg", "jpeg","png","JPEG","PNG"];
          if(attrName=='quickOverview1.videoLink' || attrName=='quickOverview2.videoLink'){
            var fileExts = ["mov","mp3", "mpeg", "wav", "ogg", "opus", "bmp", "tiff", "svg", "webm", "mpeg4", "3gpp", "avi", "mpegps", "wmv", "flv"];
          }
          
          let resp = isExtension(ext,fileExts);
          if(resp){          
              const newFilename = new Date().getTime() + `.${ext}`
              if(attrName=='topBanner'){
                updateFields = {topBanner:newFilename};
              }else if(attrName=='middleBanner'){
                updateFields = {middleBanner:newFilename};
              }else if(attrName=='lowerBanner'){
                updateFields = {lowerBanner:newFilename};
              }else if(attrName=='quickOverview1.videoLink'){
                updateFields = {"quickOverview1.videoLink":newFilename};
              }else if(attrName=='quickOverview2.videoLink'){
                updateFields = {"quickOverview2.videoLink":newFilename};
              }
              console.log('updateFields    ',updateFields);
              fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
              file.pipe(fstream);
              fstream.on('close', async function () {
                await s3.uploadFilePublic(newFilename, assetsPath+'customer/');  
                 customerCms.updateOne({_id:docId}, {$set:updateFields},function (err, updatedUser){
                  if (err) {
                    res.send(resFormat.rError(err))
                  } else {
                    console.log('updatedUser',updatedUser);
                    //resMsg = deleteDocumentS3(fileDetails.customerId,docFilePath,fileName.docName);
                    let message = 'File uploaded successfully!';
                    let result = { docId:docId,filename:newFilename, "message": message }
                    res.send(resFormat.rSuccess(result))
                  }
                })
              })
          }else{
            let results = { docId:docId, "message": "Invalid file extension!" }
            res.send(resFormat.rSuccess(results));
          }
        }
      })
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

router.post('/customerHomeTestimonialsphoto', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    const {query:{filenewName}} = req;
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      if(filenewName){
        let ext = filename.split('.')
        ext = ext[ext.length - 1];
        var fileExts = ["jpg", "jpeg","png","JPEG","PNG"];
        let resp = isExtension(ext,fileExts);
        if(resp){          
            const newFilename = filenewName;
            fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
            file.pipe(fstream);
            fstream.on('close', async function () {
              await s3.uploadFilePublic(newFilename, assetsPath+'customer/');  
            })

            return res.send(resFormat.rSuccess({'success':'upload done'}))
        }else{
          let results = {  "message": "Invalid file extension!" }
          res.send(resFormat.rSuccess(results));
        }
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

function isExtension(ext, extnArray) {
  var result = false;
  var i;
  if (ext) {
      ext = ext.toLowerCase();
      for (i = 0; i < extnArray.length; i++) {
          if (extnArray[i].toLowerCase() === ext) {
              result = true;
              break;
          }
      }
  }
  return result;
}

//function get details of user from url param
function deleteDoc(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fileName } = req.body;
  let fields = {};
  User.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      User.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          resMsg = deleteDocumentS3(fileDetails.customerId,docFilePath,fileName.docName);
          let result = { userId:fileDetails._id, "message": resMsg }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function deleteIdDocument(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fileName } = req.body;
  let fields = {};
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body

  personalIdProof.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      personalIdProof.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          resMsg = deleteDocumentS3(fileDetails.customerId,IDdocFilePath,fileName.docName);
          let message = resMessage.data( 607, [{key: '{field}',val: 'ID Box documents'}, {key: '{status}',val: 'deleted'}] )
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "File Deleted", message, folderName, subFolderName, fileName.docName)
          let result = { userId:fileDetails._id, "message": resMsg }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function deletesubFolderDoc(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fileName } = req.body;
  let fields = {};
  LegalStuff.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      LegalStuff.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          resMsg = deleteDocumentS3(fileDetails.customerId,legalStuffdocFilePath,fileName.docName);
          let result = { userId:fileDetails._id, "message": resMsg }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function deleteWishessubFolderDoc(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fileName } = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body

  let fields = {};
  finalWish.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      finalWish.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          resMsg = deleteDocumentS3(fileDetails.customerId,finalWishesFilePath,fileName.docName);
          let message = resMessage.data( 607, [{key: '{field}',val: 'Final Wishes documents'}, {key: '{status}',val: 'deleted'}] )
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "File Deleted", message, folderName, subFolderName, fileName.docName)

          let result = { userId:fileDetails._id, "message": message }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function deletePetDoc(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fileName } = req.body;
  let fields = {};
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body
  pet.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      pet.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          resMsg = deleteDocumentS3(fileDetails.customerId,petsFilePath,fileName.docName);
          let message = resMessage.data( 607, [{key: '{field}',val: 'Pets documents'}, {key: '{status}',val: 'deleted'}] )
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "File Deleted", message, folderName, subFolderName, fileName.docName)
          let result = { userId:fileDetails._id, "message": message }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function deleteTimeCapsuleDoc(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fileName } = req.body;
  let fields = {};
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body
  timeCapsule.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      timeCapsule.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          resMsg = deleteDocumentS3(fileDetails.customerId,timeCapsuleFilePath,fileName.docName);
          let message = resMessage.data( 607, [{key: '{field}',val: 'Time Capsule documents'}, {key: '{status}',val: 'deleted'}] )
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "File Deleted", message, folderName, subFolderName, fileName.docName)
          let result = { userId:fileDetails._id, "message": message }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function deleteInsuranceDocument(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fileName } = req.body;
  let fields = {};
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body

  insurance.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      insurance.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
              resMsg = deleteDocumentS3(fileDetails.customerId,insuranceFilePath,fileName.docName);
              let message = resMessage.data( 607, [{key: '{field}',val: 'Insurance documents'}, {key: '{status}',val: 'deleted'}] )
              //Update activity logs
              allActivityLog.updateActivityLogs( fromId, toId, "File Deleted", message, folderName, subFolderName, fileName.docName)
              let result = { userId:fileDetails._id, "message": message }
              res.send(resFormat.rSuccess(result));
        }
      })
    }
  })
}

function deleteDocumentS3(customerId,filePaths,fileName){
  let filePath = customerId+'/'+filePaths+fileName;
  const params = {Bucket: constants.s3Details.bucketName,Key: filePath}
  let resMsg = "Something Wrong please try again!";
     try {
         s3.s3.headObject(params).promise()
         try {
            s3.s3.deleteObject(params).promise()
            //resMsg = "File deleted successfully";
            resMsg = resMessage.data( 607, [{key: '{field}',val: 'File'}, {key: '{status}',val: 'deleted'}] )
            //Update activity logs
            //allActivityLog.updateActivityLogs( customerId, customerId, "File Delete", message, filePaths, '', filename)
         }
         catch (err) {
           resMsg = "ERROR in file Deleting : " + JSON.stringify(err);
           console.log("0",resMsg)
         }
     } catch (err) {
             resMsg = "File not Found ERROR : " + err.code;
             console.log("00",resMsg)
     }
    return resMsg;
}

function deleteFinanceDocument(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fileName } = req.body;
  let fields = {};
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body

  Finance.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      Finance.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          resMsg = deleteDocumentS3(fileDetails.customerId,financeFilePath,fileName.docName);
          let message = resMessage.data( 607, [{key: '{field}',val: 'Finance documents'}, {key: '{status}',val: 'deleted'}] )
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "File Deleted", message, folderName, subFolderName, fileName.docName)

          let result = { userId:fileDetails._id, "message": resMsg }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function deleteLetterMessageDocument(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fileName } = req.body;
  let fields = {};

  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body

  lettersMessage.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      lettersMessage.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          resMsg = deleteDocumentS3(fileDetails.customerId,letterMessageFilePath,fileName.docName);
          let message = resMessage.data( 607, [{key: '{field}',val: 'Letter and Message documents'}, {key: '{status}',val: 'deleted'}] )
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "File Deleted", message, folderName, subFolderName, fileName.docName)
          let result = { userId:fileDetails._id, "message": message }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

router.post('/invite', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  const {query:{userId}} = req;
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      let tmpallfiles = {};
      let oldTmpFiles = [];      
      if(userId){
          let ext = filename.split('.')
          ext = ext[ext.length - 1];
          var fileExts = ["jpg", "jpeg", "png"];
          let resp = isExtension(ext,fileExts);
          if(!resp){
            let results = { userId:userId, allDocs:oldTmpFiles, "message": "Invalid file extension!" }
            res.send(resFormat.rSuccess(results))
          } else{
               const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
                fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
                file.pipe(fstream);
                fstream.on('close', async function () {
                  await s3.uploadFile(newFilename,inviteDocumentsPath);  
                  tmpallfiles = {
                    "title" : filename,
                    "size" : encoding,
                    "extention" : mimetype,
                    "tmpName" : newFilename
                  }
              oldTmpFiles.push(tmpallfiles);  
               var invite = new InviteTemp();
                  invite.inviteById = userId;
                  invite.documents = oldTmpFiles;
                  invite.status = 'Pending';
                  invite.createdOn = new Date();
                  invite.save({}, function (err, newEntry) {
                  if (err) {
                  res.send(resFormat.rError(err))
                   } else {
                    //let result = { "message": "Document uploaded successfully!" }
                    let message = resMessage.data( 607, [{key: '{field}',val: 'Invite Document'}, {key: '{status}',val: 'uploaded'}] )
                    //Update activity logs
                    allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, inviteDocumentsPath, '', fileName)
                    let result = { "message": message }
                     res.status(200).send(resFormat.rSuccess(result))
                   }
                 })
              })
         } 
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

function deleteInviteDocument(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body

   InviteTemp.deleteOne(query, function (err, fileDetails) {   
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        resMsg = deleteDocumentS3(fileDetails.customerId,inviteDocumentsPath,proquery.docName);
        let message = resMessage.data( 607, [{key: '{field}',val: 'Invite documents'}, {key: '{status}',val: 'deleted'}] )
        //Update activity logs
        allActivityLog.updateActivityLogs( fromId, toId, "File Deleted", message, folderName, subFolderName, proquery.docName)
        let result = { userId:fileDetails._id, "message": message }
        res.send(resFormat.rSuccess(result))
      }    
  })
}

router.post('/deceasedDocuments', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    const {query:{userId}} = req;
    const {query:{trustId}} = req;
    const {query:{advisorId}} = req;
    const {query:{ProfileId}} = req;
    const {query:{userType}} = req;
    
    let q = {customerId: userId}
    if(ProfileId && ProfileId!='' && ProfileId!='undefined'){
      q = {_id : ProfileId}
    }
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      let tmpallfiles = {};
      let oldTmpFiles = [];
      if(userId){
          let ext = filename.split('.')
          ext = ext[ext.length - 1];
          var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc"];
          let resp = isExtension(ext,fileExts);
          if(!resp){
            let results = { userId:userId, allDocs:oldTmpFiles, "message": "Invalid file extension!" }
            res.send(resFormat.rSuccess(results))
          } else{
                 
          if(ProfileId && ProfileId!='undefined'){
              const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
              fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
              file.pipe(fstream);
              fstream.on('close', async function () {
                await s3.uploadFile(newFilename,deceasedFilessPath+userId+'/');                  
                tmpallfiles = {
                  "title" : filename,
                  "size" : encoding,
                  "extention" : mimetype,
                  "tmpName" : newFilename
                }
                MarkDeceased.findOne(q,{documents:1,_id:1}, function (err, result) {
                    if (err) {
                        res.status(500).send(resFormat.rError(err))
                    } else {       
                    if (result) {   
                        if(result.documents){
                          oldTmpFiles = result.documents;
                        }             
                        oldTmpFiles.push(tmpallfiles);  
                        MarkDeceased.updateOne(q, { $set: { documents: oldTmpFiles } }, function (err, updatedUser) {
                          if (err) {
                            res.send(resFormat.rError(err))
                          } else {
                            //let results = { userId:userId, allDocs:oldTmpFiles, "message": "Document uploaded successfully!" }
                            let message = resMessage.data( 607, [{key: '{field}',val: 'Descreased Document'}, {key: '{status}',val: 'uploaded'}] )
                            //Update activity logs
                            allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, deceasedFilessPath, '', fileName)
                            let result = { "message": message }
                            res.send(resFormat.rSuccess(result))
                          }
                       })
                      }
                    } 
                    })
                 })
              }else{
                const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
                fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
                file.pipe(fstream);
                fstream.on('close', async function () {
                  await s3.uploadFile(newFilename,deceasedFilessPath+userId+'/');  
                  tmpallfiles = {
                    "title" : filename,
                    "size" : encoding,
                    "extention" : mimetype,
                    "tmpName" : newFilename
                  }
              oldTmpFiles.push(tmpallfiles);  
                var insert = new MarkDeceased();
                insert.customerId = ObjectId(userId);
                insert.userType = userType;
               if(advisorId){    
                insert.advisorId = ObjectId(advisorId);
               }
               if(trustId){    
                insert.trustId = ObjectId(trustId);
               }
                insert.documents = oldTmpFiles;
                insert.status = 'Pending';
                insert.createdOn = new Date();
                insert.save({}, function (err, newEntry) {
                  if (err) {
                  res.send(resFormat.rError(err))
                   } else {
                     //let result = { "message": "Document uploaded successfully!" }
                     let message = resMessage.data( 607, [{key: '{field}',val: 'Descreased Document'}, {key: '{status}',val: 'uploaded'}] )
                    //Update activity logs
                    allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, deceasedFilessPath, '', fileName)
                    let result = { "message": message }
                    res.status(200).send(resFormat.rSuccess(result))
                  }
                 })
              })
           }
         } 
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

function deleteDeceasedDoc(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fileName } = req.body;
  let fields = {};
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body

  MarkDeceased.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      MarkDeceased.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          resMsg = deleteDocumentS3(fileDetails.customerId,deceasedFilessPath,fileName.docName);
          let message = resMessage.data( 607, [{key: '{field}',val: 'Deceased documents'}, {key: '{status}',val: 'deleted'}] )
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "File Deleted", message, folderName, subFolderName, fileName.docName)
          let result = { userId:fileDetails._id, "message": message }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function downloadDocs(req,res) {
  let { query } = req.body; 
  let filePath = query.docPath+query.filename;
  let filename = query.filename;

  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body

  var params = {Bucket: constants.s3Details.bucketName,Key:filePath};
  let ext = filename.split('.')
  ext = ext[ext.length - 1];
  try {
    const stream = s3.s3.getObject(params).createReadStream();    
    res.set({
      'Content-Disposition': 'attachment; filename='+filename,
      'Content-Type': 'image/'+ext+'; charset=utf-8'
    });
    stream.pipe(res);
    let message = resMessage.data( 607, [{key: '{field}',val: 'File'}, {key: '{status}',val: 'downloaded'}] )
    //Update activity logs
    allActivityLog.updateActivityLogs( fromId, toId, "File Download", message, folderName, subFolderName, filename)
  } catch (error) {
    res.status(401).send(resFormat.rError({message :error}))  
  }
}

function createDirectory(req,res) {
    let { query } = req.body;
    let folders = constants.basicFolders;
    try {
        async.each(folders, (folder)=>{
          createAllDirectory(query.folderName+'/'+folder);         
        })        
     res.status(200).send(resFormat.rSuccess({message :"Folders Created successfully!"}))  
    } catch (error) {
      res.status(401).send(resFormat.rError({message :error}))  
    }
}

async function createAllDirectory(folderName,res) {
    var params = {Bucket: constants.s3Details.bucketName, Key:folderName+'/000.png'};
    try {
      const stream = s3.s3.putObject(params, (err, data)=>{
        console.log(data);
      })
      let result = { "message": "Folders created successfully!" }
      res.status(200).send(resFormat.rSuccess(result))
    } catch (error) {
      res.status(401).send(resFormat.rError({message :error}))  
    }
}

function userFolderSize(req,res) {
  let { query } = req.body;
  let folder = query.userId;
  try {
    let size = getuserFolderSize(folder,res);
    let result = { "message": "Folders size successfully!","size":size }
    res.status(200).send(resFormat.rSuccess(result))
  } catch (error) {
    res.status(401).send(resFormat.rError({message :error}))  
  }
}

function getuserFolderSize(folder,res) {
    const s3Sizer = new S3Sizer({
        accessKeyId: constants.s3Details.awsKey,
        secretAccessKey: constants.s3Details.awsSecret,
        region:"us-east-1"
    });

    s3Sizer.getFolderSize(constants.s3Details.bucketName, folder, function(err, size) {
      User.updateOne({ _id: folder }, { $set: { s3Size: size } }, function (err, updatedUser) {
        if (err) {
          return err;
        } else {
         return size;
        }
      })
   });
}

function downloadZipfiles(req,res) {
  let { query } = req.body; 
  let filesPath = query.docPath;
  let { fromId }        = req.body
  let { toId }          = req.body
  let { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body
  let downloadFileName = query.downloadFileName;

  if(query.AllDocuments){
    let AllDocs = query.AllDocuments;
    let docList = []
    
    async.each(AllDocs, (row)=>{
      docList.push(filesPath+row.tmpName);  
    })
    const params = {Bucket: constants.s3Details.bucketName,Prefix: filesPath};
    const stream = s3.s3.listObjectsV2(params, (err, data)=>{
    try {
      let files = []
      
     async.each(data.Contents, (folder, cb)=>{
      if (docList.includes(folder.Key)){
        files.push(folder.Key);
      }      
        cb()
    }, ()=>{        
      try {           
        var archive = archiver('zip', {});
        // Handle various useful events if you need them.
        archive.on('end', () => {});
        archive.on('warning', () => {});
        archive.on('error', () => {});      
        // Set up the archive we want to present as a download.
        res.attachment(downloadFileName);
        let s3OutputStream = uploadFromStream(downloadFileName,res);
        archive.pipe(s3OutputStream);
        
        async.each(files, (folder,callback)=>{
            let filePath = folder;                 
            let filename = folder;
            var getparams = {Bucket: constants.s3Details.bucketName,Key:filePath};
            const stream = s3.s3.getObject(getparams).createReadStream();    
            archive.append(stream,{name: filename});    
            callback()                
        }) 

        archive.finalize();  

        archive.on('finish', async () => {
          let message = resMessage.data( 607, [{key: '{field}',val: 'Zip'}, {key: '{status}',val: 'downloaded'}] )
          //Update activity logs
          allActivityLog.updateActivityLogs( fromId, toId, "Zip Download", message, folderName, subFolderName, downloadFileName)
        }); 
      } catch (error) {
        res.status(401).send(resFormat.rError({message :error}))  
      }
    }) 
    } catch (error) {         
      res.status(401).send(resFormat.rError({message :error}))  
    }
  })        
}else{
  res.status(401).send(resFormat.rError({message :"Sorry files not found!"}))  
}
}

function uploadFromStream(zipfileName,res) {
  var pass = new stream.PassThrough();
  let fileName = 'downloads/'+zipfileName;
  var params = {Bucket: constants.s3Details.bucketName, Key: fileName, Body: pass};
  s3.s3.upload(params, function(err, data) {  
    var downLoadparams = {Bucket: constants.s3Details.bucketName,Key:fileName};
    try {
      const streams = s3.s3.getObject(downLoadparams).createReadStream(); 
      res.set({
        'Content-Disposition': 'attachment; filename='+zipfileName,
        'Content-Type': 'image/zip; charset=utf-8'
      });
      streams.pipe(res);
    }catch(error){
        console.log("error",error)
    }  
  });
  return pass;
}

router.post('/coachCornerArticle', cors(), function(req,res){
  var fstream;
  let authTokens = { authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
    const {query:{userId}} = req;
    const {query:{prevImage}} = req;
    const {query:{ProfileId}} = req;
    const {query:{folderName}} = req;
    
    let q = {customerId: userId}
    if(ProfileId && ProfileId!='') {
      q = {_id : ProfileId}
    }
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      let tmpallfiles = {};
      let oldTmpFiles = [];
      if(userId) {
        let fileExts = ["jpg", "jpeg", "png"],
            ext = filename.split('.')
            ext = ext[ext.length - 1];
            
        let resp = isExtension(ext,fileExts);
        if(!resp) {
          let results = { userId:userId, allDocs:oldTmpFiles, "message": "Invalid file extension!" }
          res.send(resFormat.rSuccess(results))
        }
        else{
          /**** for post update remove previous file *****/
          
          if( prevImage ) {
            let filePath = coachCornerArticlePath + prevImage;
            const params = { Bucket: constants.s3Details.bucketName, Key: filePath }
            try {
              s3.s3.headObject(params).promise()
              try {
                s3.s3.deleteObject(params).promise()
              }
              catch (err) {
                let resMsg = "ERROR in file Deleting : " + JSON.stringify(err);
                res.send(resFormat.rError(resMsg))
              }
            }
            catch (err) {
              let resMsg = "File not Found ERROR : " + err.code;
              res.send(resFormat.rSuccess(resMsg))
            }
          }
          /****************************/
         
          //Add 
          const newFilename = filename//new Date().getTime() + `.${ext}`
                fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
          file.pipe(fstream);

          fstream.on('close', async function () {
            let uploadImage =  await s3.uploadFile(newFilename,coachCornerArticlePath);  
            tmpallfiles = {
              "title" : filename,
              "size" : encoding,
              "extention" : mimetype,
              "tmpName" : newFilename
            }
            
            let message = resMessage.data( 607, [{key: '{field}',val: 'Coach Corner Image'}, {key: '{status}',val: 'uploaded'}] )
            //Update activity logs
            allActivityLog.updateActivityLogs( userId, userId, "File Uploaded", message, coachCornerArticlePath, '', fileName)

            return res.send(resFormat.rSuccess(tmpallfiles))
            //res.status(200).send(resFormat.rSuccess(tmpallfiles))
          })
          
        } 
      }
      else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

function deleteCoachCornerImage(req, res) {
  let { fileName }      = req.body,
      { fromId }        = req.body,
      { toId }          = req.body,
      { folderName }    = req.body
        folderName      = folderName ? folderName.replace('/','') : ''
  let { subFolderName } = req.body,
        filePath        = coachCornerArticlePath+fileName;
  
  const params = { Bucket: constants.s3Details.bucketName, Key: filePath }
  let resMsg    = "";
  try {
    s3.s3.headObject(params).promise()
    try {
      s3.s3.deleteObject(params).promise()
    }
    catch (err) {
      resMsg = "ERROR in file Deleting : " + JSON.stringify(err);
      res.send(resFormat.rError(resMsg))
    }
  }
  catch (err) {
    resMsg = "File not Found ERROR : " + err.code;
    res.send(resFormat.rSuccess(resMsg))
  }

  let message = resMessage.data( 607, [{key: '{field}',val: 'Coach Corner Image'}, {key: '{status}',val: 'deleted'}] )
  //Update activity logs
  allActivityLog.updateActivityLogs( fromId, toId, "File Deleted", message, folderName, subFolderName, fileName.docName)
  let result = { "message": message }
  res.send(resFormat.rSuccess(result))
}

router.post("/deleteCoachCornerImage", deleteCoachCornerImage);
router.post("/deleteAdvDoc", deleteDoc);
router.post("/deleteIdDoc", deleteIdDocument);
router.post("/deletesubFolderDoc", deletesubFolderDoc);
router.post("/deletesubFolderWishesDoc", deleteWishessubFolderDoc);
router.post("/deletePets", deletePetDoc);
router.post("/deleteDeceased", deleteDeceasedDoc);
router.post("/deleteTimeCapsuleDoc", deleteTimeCapsuleDoc);
router.post("/deleteInsuranceDoc", deleteInsuranceDocument);
router.post("/deleteFinanceDoc", deleteFinanceDocument); 
router.post("/deleteletterMessageDoc", deleteLetterMessageDocument);
router.post("/deleteInviteDocument", deleteInviteDocument);
router.post("/createUserDir", createDirectory);
router.post("/downloadDocument", downloadDocs);
router.post("/downloadZip",downloadZipfiles);
router.post("/checkFolderSize", userFolderSize);
module.exports = router