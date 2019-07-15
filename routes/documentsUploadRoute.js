var express = require('express')
var router = express.Router()
const resFormat = require('./../helpers/responseFormat')
var fs = require('fs')
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
const lettersMessage = require('./../models/LettersMessages.js')
var DIR = './uploads/';

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
                    let result = { userId:userId, allDocs:tmpallfiles, "message": "Document uploaded successfully!" }
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
              
                  personalIdProof.findOne(q,{idProofDocuments:1,_id:1}, function (err, result) {
                    if (err) {
                        res.status(500).send(resFormat.rError(err))
                    } else {       
                    if (result) {                              
                        if(result.idProofDocuments){
                          oldTmpFiles = result.idProofDocuments;
                        }
                        oldTmpFiles.push(tmpallfiles); 
                        personalIdProof.updateOne(q, { $set: { idProofDocuments: oldTmpFiles } }, function (err, updatedUser) {
                          if (err) {
                            res.send(resFormat.rError(err))
                          } else {
                            let result = { userId:userId, allDocs:tmpallfiles, "message": "ID proof uploaded successfully!" }
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
                personal.idProofDocuments = oldTmpFiles;
                personal.status = 'Pending';
                personal.createdOn = new Date();
                personal.save({}, function (err, newEntry) {
                if (err) {
                  res.send(resFormat.rError(err))
                   } else {
                     let result = { "message": "ID proof uploaded successfully!" }
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
              LegalStuff.findOne(q,{subFolderDocuments:1,_id:1}, function (err, result) {
                    if (err) {
                        res.status(500).send(resFormat.rError(err))
                    } else {       
                    if (result) {                   
                        if(result.subFolderDocuments){
                          oldTmpFiles = result.subFolderDocuments;
                        }                
                        oldTmpFiles.push(tmpallfiles);  
                        LegalStuff.updateOne(q, { $set: { subFolderDocuments: oldTmpFiles } }, function (err, updatedUser) {
                          if (err) {
                            res.send(resFormat.rError(err))
                          } else {
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
                  legal.subFolderDocuments = oldTmpFiles;
                  legal.status = 'Pending';
                  legal.createdOn = new Date();
                  legal.save({}, function (err, newEntry) {
                  if (err) {
                  res.send(resFormat.rError(err))
                   } else {
                    let result = { "message": "Document uploaded successfully!" }
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
                finalWish.findOne(q,{subFolderDocuments:1,_id:1}, function (err, result) {
                    if (err) {
                        res.status(500).send(resFormat.rError(err))
                    } else {       
                    if (result) {                          
                        if(result.subFolderDocuments){
                          oldTmpFiles = result.subFolderDocuments;
                        }             
                        oldTmpFiles.push(tmpallfiles);  
                        finalWish.updateOne(q, { $set: { subFolderDocuments: oldTmpFiles } }, function (err, updatedUser) {
                          if (err) {
                            res.send(resFormat.rError(err))
                          } else {
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
                insert.subFolderDocuments = oldTmpFiles;
                insert.status = 'Pending';
                insert.createdOn = new Date();
                insert.save({}, function (err, newEntry) {
                  if (err) {
                  res.send(resFormat.rError(err))
                   } else {
                    let result = { "message": "Document uploaded successfully!" }
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
                    let result = { "message": "Document uploaded successfully!" }
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
                    let result = { "message": "Document uploaded successfully!" }
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
                    let result = { "message": "Document uploaded successfully!" }
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
                    let result = { "message": "Document uploaded successfully!" }
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
                    let result = { "message": "Document uploaded successfully!" }
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
        // console.log("HERE ",docFilePath+fileName.docName);
        /*  var deleteParam = {
            Bucket: 'advisorsDocs',
            Delete: {
                Objects: [
                    {Key: docFilePath+fileName.docName},
                ]
            }
        };    
        s3.deleteObjects(deleteParam, function(err, data) {
            if (err) console.log(err, err.stack);
            else console.log('delete', data);
        });
      */
          let result = { userId:fileDetails._id, "message": "File deleted successfully" }
          res.send(resFormat.rSuccess(result))
        }
      })



      //let result = { "message": "File deleted successfully!" }
      //res.send(resFormat.rSuccess(result))
    }
  })
}

function deleteIdDocument(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { fileName } = req.body;
  let fields = {};
  personalIdProof.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      personalIdProof.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { userId:fileDetails._id, "message": "File deleted successfully" }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


function deletesubFolderDoc(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let fields = {};
  LegalStuff.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      LegalStuff.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { userId:fileDetails._id, "message": "File deleted successfully" }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


function deleteWishessubFolderDoc(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let fields = {};
  finalWish.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      finalWish.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { userId:fileDetails._id, "message": "File deleted successfully" }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function deletePetDoc(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let fields = {};
  pet.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      pet.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { userId:fileDetails._id, "message": "File deleted successfully" }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


function deleteTimeCapsuleDoc(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let fields = {};
  timeCapsule.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      timeCapsule.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { userId:fileDetails._id, "message": "File deleted successfully" }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


function deleteInsuranceDocument(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let fields = {};
  insurance.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      insurance.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { userId:fileDetails._id, "message": "File deleted successfully" }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function deleteFinanceDocument(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let fields = {};
  Finance.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      Finance.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { userId:fileDetails._id, "message": "File deleted successfully" }
          res.send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


function letterMessageDocument(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let fields = {};
  lettersMessage.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      lettersMessage.updateOne({ _id: fileDetails._id }, proquery, function (err, updatedUser) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { userId:fileDetails._id, "message": "File deleted successfully" }
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
                  await s3.uploadFile(newFilename,userId+'/'+inviteDocumentsPath);  
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
                    let result = { "message": "Document uploaded successfully!" }
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
   InviteTemp.deleteOne(query, function (err, data) {   
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        let result = {"message": "File deleted successfully" }
        res.send(resFormat.rSuccess(result))
      }    
  })
}

function downloadDocs(req,res) {
  let { query } = req.body; 
  let filePath = query.docPath+query.filename;
  let filename = query.filename;
  var params = {Bucket: constants.s3Details.bucketName,Key:filePath};
  console.log("params --->",params);
  let ext = filename.split('.')
  ext = ext[ext.length - 1];
  try {
    const stream = s3.s3.getObject(params).createReadStream();    
    res.set({
      'Content-Disposition': 'attachment; filename='.filename,
      'Content-Type': 'image/'+ext+'; charset=utf-8'
    });
    stream.pipe(res);
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
 
  let filename = query.userId;

  const s3params = {
    Bucket: constants.s3Details.bucketName,
    MaxKeys: 2000,
    //Delimiter: '/'+filename,
    Prefix: filename
  };
  
  // const s3params = {
  //   Bucket: 'bucket-name',
  //   MaxKeys: 20,
  //   Delimiter: '/',
  //   Prefix: 'directory-1/'
  // };

 // let totalSize = map(s3.s3, constants.s3Details.bucketName, "prefix")(s => s.getSize).sum

  // s3.s3.listObjectsV2 (s3params, (err, data) => {
  //   if (err) {
  //     console.log("stream ",err);// reject (err);
  //   }
  //   console.log ("data",data);
  // });
  console.log("s3params :-  ",s3params);

  var params = {Bucket: constants.s3Details.bucketName, Key:filename+'/pets'};
  // let ext = filename.split('.')
  // ext = ext[ext.length - 1];
  try {
    
    const stream = s3.s3.getObject(s3params, (err, data)=>{
      console.log("data :-  ",data);
    })
  // console.log("stream :- ",stream);

   console.log("================================");
    // const stream = s3.s3.listObjects(params).createReadStream();    
    // res.set({
    //   'Content-Disposition': 'attachment; filename='.filename,
    //   'Content-Type': 'image/png; charset=utf-8'
    // });
    // stream.pipe(res);
    // console.log("stream ",stream);

  } catch (error) {
    res.status(401).send(resFormat.rError({message :error}))  
  }
}

router.post("/deleteAdvDoc", deleteDoc);
router.post("/deleteIdDoc", deleteIdDocument);
router.post("/deletesubFolderDoc", deletesubFolderDoc);
router.post("/deletesubFolderWishesDoc", deleteWishessubFolderDoc);
router.post("/deletePets", deletePetDoc);
router.post("/deleteTimeCapsuleDoc", deleteTimeCapsuleDoc);
router.post("/deleteInsuranceDoc", deleteInsuranceDocument);
router.post("/deleteFinanceDoc", deleteFinanceDocument); 
router.post("/deleteletterMessageDoc", letterMessageDocument);
router.post("/deleteInviteDocument", deleteInviteDocument);
router.post("/createUserDir", createDirectory);
router.post("/downloadDocument", downloadDocs);
router.post("/checkFolderSize", userFolderSize);
module.exports = router