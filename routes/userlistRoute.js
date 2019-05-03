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
const { isEmpty, cloneDeep } = require('lodash')
const Busboy = require('busboy')
// const Mailchimp = require('mailchimp-api-v3')

const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const s3 = require('./../helpers/s3Upload')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

//function to get list of user as per given criteria
function list (req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalUsers = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function(key, index) {
      if(key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  //query = {}//status:"Active"

  User.countDocuments(query, function(err, userCount) {
    if(userCount) {
      totalUsers = userCount
    }
	
    User.find(query, fields, function(err, userList) {
		let contacts = []
        async.each(userList, function(contact, callback){
          let newContact = JSON.parse(JSON.stringify(contact))
        
        }, function(exc) {
          contacts.sort((a,b) => (a.createdOn > b.createdOn) ? -1 : ((b.createdOn > a.createdOn) ? 1 : 0));
          res.send(resFormat.rSuccess({ userList: contacts, totalRecords }))
        }) //end of async
		 
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ userList, totalUsers}))
      }
	  
    }).sort(order).skip(offset).limit(limit)
  })
}

//function get details of user from url param
function details (req, res) {
  let { query} = req.body
  let fields = { id:1, username: 1, salt: 1, fullName: 1 , contactNumber: 1 , lastLoggedInOn: 1 , userType: 1, emailVerified: 1 , createdOn: 1 , status: 1 }
  if(req.body.fields) {
	fields = req.body.fields
  }
    User.findOne(query, fields, function(err, userList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(userList))
    }
  })
}

function updateStatus (req, res) {
	 let {query} = req.body;
	 let fields = { id:1, username: 1 , status: 1 }
	 User.findOne(query, fields, function(err, userList) { 
		if(err){
		  res.status(401).send(resFormat.rError(err))
		} else {
			var upStatus = 'Active';
			if(userList.status=='Active'){upStatus = 'In-Active'; }
		  var params = {status: upStatus}
		 	  User.update({ _id: userList._id },{ $set: params} , function(err, updatedUser) {
				if (err) {
				  res.send(resFormat.rError(err))
				} else {
				  let result = {userId: updatedUser._id, userType : updatedUser.userType, "message": "Update status successfully!" }
				  res.status(200).send(resFormat.rSuccess(result))
				}
			  })
		}
	 })
}
function addNewMember (req, res) {
    let newMem = new User()
    //newMem.userId = req.body.userId
    newMem.fullName = req.body.fullName
	newMem.userType = 'AdminWeb'
	newMem.username = req.body.username
    if(req.body.status){
   	 newMem.status = "Active"
    }else{
	 newMem.status = "In-active"	   
    }
    newMem.createdOn = new Date()
	
    newMem.save(function(err, newMemRecord) {
      if (err) {
		  console.log(err)
        res.status(500).send(resFormat.rError(err))
      } else {
        let mem = req.body
         res.send(resFormat.rSuccess('Member has been addedd'))
      }
    })
}


function common(req, res) {
  const Models = {'users': User}

  User.findById(req.body.userId, function(err, user) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {

      Models[req.body.rc[0]].find(req.body.query, req.body.fields, function(err,resultData){
        if (err) {
          res.status(401).send(resFormat.rError(err))
        } else {
          res.send(resFormat.rSuccess(resultData))
        }
      })
    }
  })
}



router.post("/list", list);
router.post("/addmember", addNewMember);
router.post("/updatestatus", updateStatus);
/*router.get(["/view/:id", "/:id"], details)*/
router.post(["/view"], details);
router.post("/common", common);


module.exports = router
