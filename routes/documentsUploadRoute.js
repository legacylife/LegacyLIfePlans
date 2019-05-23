var express = require('express')
var router = express.Router()
const resFormat = require('./../helpers/responseFormat')
var fs = require('fs')
var cors = require('cors')
const Busboy = require('busboy')
var constants = require('./../config/constants')
const s3 = require('./../helpers/s3Upload')
const User = require('./../models/Users')
const docFilePath = constants.s3Details.advisorsDocumentsPath
var DIR = './uploads/';



router.post('/advisorDocument', cors(), function(req,res){
  var fstream;
  let authTokens = { userId: "5cc9cc301955852c18c5b73a", authCode: "" }
  if (req.busboy) {
    req.busboy.on('field', function (fieldname, val, something, encoding, mimetype) {
      authTokens[fieldname] = val
    })
  
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      if(authTokens.userId){
        User.findOne({ _id: authTokens.userId,userType: 'advisor' },{advisorDocuments:1,_id:1}, function (err, result) {
          if (err) {
            res.status(500).send(resFormat.rError(err))
          } else if (result) {           
          let ext = filename.split('.')
          ext = ext[ext.length - 1]
          const newFilename = authTokens.userId + '-' + new Date().getTime() + `.${ext}`
          fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
          file.pipe(fstream);
          fstream.on('close', async function () {
            await s3.uploadFile(newFilename, docFilePath);
            let allfiles = '';
            if(result.advisorDocuments){
              allfiles = result.advisorDocuments+','+newFilename;
            }else{
              allfiles = newFilename;
            }            
            User.updateOne({ _id: authTokens.userId }, { $set: { advisorDocuments: allfiles } }, function (err, updatedUser) {
              if (err) {
                res.send(resFormat.rError(err))
              } else {
                let result = { userId:authTokens.userId, allDocs:allfiles, "message": "User details have been updated" }
                res.send(resFormat.rSuccess(result))
              }
            })
          })
        }
      })
      } else {
        res.status(401).send(resFormat.rError("User token mismatch."))
      }
    })
  }
})

//function get details of user from url param
function deleteDoc(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let fields = {};
  User.findOne(query, fields, function (err, fileDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      let result = { "message": "File deleted successfully!" }
      res.send(resFormat.rSuccess(result))
    }
  })
}


router.post("/deleteAdvDoc", deleteDoc)
module.exports = router