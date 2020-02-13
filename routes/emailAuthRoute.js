const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('./../models/Users')
const Contacts = require('./../models/Contacts')
const GlobalSetting = require('./../models/GlobalSettings')
const constants = require('./../config/constants')
const request = require('request');
const resFormat = require('./../helpers/responseFormat')
const Nylas =  require('nylas');
const async = require('async')
const fs = require('fs')
const Busboy = require('busboy');

Nylas.config({
  appId: constants.nylas.appId,
  appSecret: constants.nylas.appSecret,
});

//function get details of global settings from url param
function storeSecurityDetails(req, res) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(user))
    }
  })
}

//
router.post('/getThreads', function(req,res){
  if(req.body.userId) {
    if(req.body.update) {
      User.updateOne({ "_id": mongoose.Types.ObjectId(req.body.userId)}, {"$set": {emailApiCode: req.body.authCode}}, function(err, updatedUser){
        if(err) {
          console.log(err)
        }
      })
    }
    User.findOne({ "_id": mongoose.Types.ObjectId(req.body.userId)}, { gmailCreds: 1, officeCreds: 1, emailApiType: 1}, function(err, user){
      if(err){
        res.status(401).send(resFormat.rError("User token mismatch."))
      } else {
        const folder = req.body.in.toUpperCase()
        let options = { method: 'POST', url: constants.mailServerUrl + '/threads/getThreadsWithDetails', headers: { 'content-type': 'application/json' },
                        body: { "userId": "me", labelId: folder, "offset":req.body.offset, "limit": req.body.limit,
                        "creds": user.gmailCreds }, json: true }
        if(user.emailApiType == "outlook"){
          options.url = constants.mailServerUrl + '/officeThreads/getThreadsWithDetails'
          options.body.creds = user.officeCreds
        }
        request(options, function (error, response, body) {
          if(!error && body && body.data) {
            res.send(resFormat.rSuccess({ threads: body.data.threads, totalCount: body.data.totalCount }))
          }
          else {
            res.status(401).send(resFormat.rError(error ? error : (response.body ? response.body : "Some error occurred" )))
          }
        })
      }
    })
  } else {
    res.status(401).send(resFormat.rError("User token mismatch."))
  }
})

//
router.post('/getThreadDetails', function(req,res){
  User.findOne({ "_id": mongoose.Types.ObjectId(req.body.userId)}, { gmailCreds: 1, officeCreds: 1, emailApiType:1, username: 1}, function(err, user){
    if(err){
      res.status(401).send(resFormat.rError("User token mismatch."))
    } else {
      var options = { method: 'POST', url: constants.mailServerUrl + '/threads/messageDetails', headers: { 'content-type': 'application/json' },
        body: { "userId": "me", "messageIds":req.body.messageIds, "creds": user.gmailCreds }, json: true
      }

      if(user.emailApiType == "outlook") {
        options.url = constants.mailServerUrl + '/officeThreads/messageDetails'
        options.body.creds = user.officeCreds
      }
      request(options, function (error, response, body) {
        if (error) {
          res.status(401).send(resFormat.rError(error))
        } else {

          if(req.body.fromEmail != ""){
            Contacts.findOne({"person.emailIds.email": req.body.fromEmail.toLowerCase()}, function(err, contactsBody){
              res.send(resFormat.rSuccess({messages: body.data, contact: contactsBody}))
            })
          } else {
            res.send(resFormat.rSuccess({messages: body.data, contact: null}))
          }
        }
      })//end of request
    }
  })
})

//
router.post('/updateThread', function(req,res){
  let threadDetails = req.body.data
  let addLabelIds = []
  let removeLabelIds = []
  let outlookDetails = {}
  if(threadDetails.unread){
    outlookDetails.isRead = false
    addLabelIds.push("UNREAD")
  } else if(threadDetails.unread != undefined ){
    removeLabelIds.push("UNREAD")
    outlookDetails.isRead = true
  }
  if(threadDetails.starred) {
    addLabelIds.push("STARRED")
    outlookDetails.importance = "high"
  } else if(threadDetails.starred != undefined ){
    removeLabelIds.push("STARRED")
    outlookDetails.importance = "normal"
  }

  User.findOne({ "_id": mongoose.Types.ObjectId(req.body.userId)}, { gmailCreds: 1, officeCreds: 1, emailApiType: 1}, function(err, user){
    if(err){
      res.status(401).send(resFormat.rError("User token mismatch."))
    } else {
      let body = { "userId": "me", "threadId": req.body.threadId, "creds": user.gmailCreds, threadDetails: {addLabelIds, removeLabelIds} }
      var options = { method: 'POST', url: constants.mailServerUrl + '/threads/update', headers: { 'content-type': 'application/json' },
        body, json: true
      }
      if(user.emailApiType == "outlook") {
        options.url = constants.mailServerUrl + '/officeThreads/update'
        options.body = { creds: user.officeCreds, folder: req.body.folder, messageId: req.body.threadId, data: outlookDetails}
      }
      request(options, function (error, response, body) {
        if (error) {
          res.status(401).send(resFormat.rError(error))
        } else {
          res.send(resFormat.rSuccess(body.data))
        }
      })//end of request
    }
  })
})

//
router.post('/deleteThread', function(req,res){
  const addLabelIds = [ "TRASH" ]
  User.findOne({ "_id": req.body.userId}, { gmailCreds: 1, officeCreds: 1, emailApiType: 1}, function(err, user){
    if(err){
      res.status(401).send(resFormat.rError("User token mismatch."))
    } else {
      let body = { "userId": "me", "threadId": req.body.threadId, "creds": user.gmailCreds, threadDetails: {addLabelIds} }
      var options = { method: 'POST', url: constants.mailServerUrl + '/threads/update', headers: { 'content-type': 'application/json' },
        body, json: true
      }
      if(user.emailApiType == "outlook") {
        options.url = constants.mailServerUrl + '/officeThreads/deleteMail'
        options.body = { creds: user.officeCreds, folder: req.body.folder, messageId: req.body.threadId}
      }
      request(options, function (error, response, body) {
        if (error) {
          res.status(401).send(resFormat.rError(error))
        } else {
          res.send(resFormat.rSuccess(body.data))
        }
      })//end of request
    }
  })
})

router.post('/sendEmail', function(req,res){
  // if(req.body.userId && req.body.authCode) {
  //     User.findOne({ "_id": mongoose.Types.ObjectId(req.body.userId)}, { username: 1, fullName: 1 }, function(err, user){
  //       if(err) {
  //         res.status(401).send(resFormat.rError(err))
  //       } else {
  //         let allAttachments = []
  //         const nylas = Nylas.with(req.body.authCode);
  //         async.each(req.body.attachments,function(attachment,callback){
  //           let filePath = __dirname + '/../tmp/' + attachment.filename
  //           fs.readFile(filePath, (err, data) => {
  //             f = nylas.files.build({
  //               filename: filePath,
  //               data: data,
  //               contentType: attachment.type,
  //             })
  //             f.upload((err, file) => {
  //               if(err) throw err;
  //               allAttachments.push(file)
  //               callback()
  //             })
  //           })
  //
  //         }, function(err){
  //           console.log(err)
  //
  //           // Create a draft and attach the file to it.
  //           const draft = nylas.drafts.build({
  //             from: [{ name: user.fullName, email: user.username } ],
  //             subject: req.body.subject,
  //             to: req.body.to,
  //             body: req.body.html,
  //           })
  //
  //           draft.files = allAttachments
  //
  //           draft.send().then(message => {
  //             res.send(resFormat.rSuccess(`${message.id} was sent`))
  //           })
  //         })
  //       }
  //     })
  // } else {
  //   res.status(401).send(resFormat.rError("User token mismatch."))
  // }
  User.findOne({ "_id": mongoose.Types.ObjectId(req.body.userId)}, { gmailCreds: 1, username: 1, fullName: 1, officeCreds: 1, emailApiType: 1 }, function(err, user){
    if(err){
      res.status(401).send(resFormat.rError("User token mismatch."))
    } else {
      let attachments = []
      async.each(req.body.attachments,function(attachment,callback){
          const filePath = __dirname + '/../tmp/' + attachment.filename
          const bitmap = fs.readFileSync(filePath);
          attachments.push({ filename: attachment.filename, data: new Buffer(bitmap).toString('base64'), type: attachment.type });
          callback()
      }, function(err){
          req.body.attachments = attachments
          let data = req.body
          data.from = { name: user.fullName, email: user.username }
          const options = { method: 'POST', url: constants.mailServerUrl + '/drafts/send', headers: { 'content-type': 'application/json' },
                            body: { "userId": "me", "data": req.body, "creds": user.gmailCreds }, json: true }
          if(user.emailApiType == "outlook") {
            options.url = constants.mailServerUrl + '/officeThreads/sendMail'
            options.body.creds = user.officeCreds
          }
          request(options, function (error, response, body) {
            if (error) {
              res.status(401).send(resFormat.rError(error))
            } else {
              res.send(resFormat.rSuccess({ message: body }))
            }
          })
      }) //end of async
    }
  }) //end user db
}) //end of router

//
router.post('/getFolderCount', function(req,res){
  User.findOne({ "_id": mongoose.Types.ObjectId(req.body.userId)}, { gmailCreds: 1, officeCreds: 1, emailApiType: 1}, function(err, user){
    if(err){
      res.status(401).send(resFormat.rError("User token mismatch."))
    } else {
      var options = { method: 'POST', url: constants.mailServerUrl + '/threads/threadCount', headers: { 'content-type': 'application/json' },
                      body: { "userId": "me", "labelId":req.body.folder, "creds": user.gmailCreds }, json: true }
      if(user.emailApiType == "outlook") {
        options.url = constants.mailServerUrl + '/officeThreads/threadCount'
        options.body.creds = user.officeCreds
      }
      request(options, function (error, response, body) {
        if (error) {
          res.status(401).send(resFormat.rError(error))
        } else {
          res.send(resFormat.rSuccess({ totalCount: body.data }))
        }
      })
    }
  })
  /******************************* OUR API ENDS ***************************************/
})

//
router.use('/getAttachmentContent', function(req,res){
  User.findOne({ "_id": mongoose.Types.ObjectId(req.body.userId)}, { gmailCreds: 1, officeCreds: 1, emailApiType: 1 }, function(err, user){
    if(err){
      res.status(401).send(resFormat.rError("User token mismatch."))
    } else {
      const { messageId, fileId, filename, gmailCreds, folder } = req.body
      var options = { method: 'POST', url: constants.mailServerUrl + '/threads/getAttachment', headers: { 'content-type': 'application/json' },
                      body: { "userId": "me", messageId, fileId, filename, folder, "creds": user.gmailCreds }, json: true }
      if(user.emailApiType == "outlook") {
        options.url = constants.mailServerUrl + '/officeThreads/getAttachment'
        options.body.creds = user.officeCreds
      }
      request(options, function (error, response, body) {
        if (error) {
          res.status(401).send(resFormat.rError(error))
        } else {
          res.send(resFormat.rSuccess(body.data))
        }
      })
    }
  })
})

router.post('/uploadFile', function(req,res){
    var fstream;
    let authTokens = { userId: "", authCode: ""}
    if (req.busboy) {
      req.busboy.on('field', function(fieldname, val, something, encoding, mimetype) {
        authTokens[fieldname] = val
      })

      req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        if(authTokens.userId && authTokens.authCode ) {
          fstream = fs.createWriteStream(__dirname + '/../tmp/' + filename);
          file.pipe(fstream);
          fstream.on('close', function(){
            res.send(resFormat.rSuccess({success : true}))
          })
        } else {
          res.status(401).send(resFormat.rError("User token mismatch."))
        }
      })
    }
})

router.post('/removeFile', function(req,res){
  if(req.body.authCode && req.body.userId) {
    fs.unlink(__dirname + '/../tmp/' + req.body.filename, (err) => {
      if (err) throw err;
      res.send(resFormat.rSuccess({success : true}))
    });
  } else {
    res.status(401).send(resFormat.rError("User token mismatch."))
  }
})

router.post('/checkApi', function(req,res){

})

router.get("/auth", storeSecurityDetails)

module.exports = router
