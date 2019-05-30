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
          ext = ext[ext.length - 1]
          const newFilename = userId + '-' + new Date().getTime() + `.${ext}`
          fstream = fs.createWriteStream(__dirname + '/../tmp/' + newFilename)
          file.pipe(fstream);
          fstream.on('close', async function () {
            await s3.uploadFile(newFilename, docFilePath);  
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
  console.log("HERE ",docFilePath+fileName.docName);
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


router.post("/deleteAdvDoc", deleteDoc)
module.exports = router