var express = require('express')
var router = express.Router()
var passport = require('passport')
var request = require('request')
var jwt = require('express-jwt')
const mongoose = require('mongoose')
var async = require('async')
var crypto = require('crypto')
var fs = require('fs')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const ToDos = require('./../models/ToDos.js')
var auth = jwt({
    secret: constants.secret,
    userProperty: 'payload'
})


// save to-do's of customer/advisor
async function addTodos(req, res) {
    var toDosObj = new ToDos();
    toDosObj.customerId = req.body.customerId;
    toDosObj.customerType = req.body.customerType;
    toDosObj.comments = req.body.comments;
    toDosObj.status = 'Active';
    toDosObj.createdOn = new Date();
    toDosObj.modifiedOn = new Date();
    toDosObj.save({}, function (error, newEntry) {
        if (error) {
            res.send(resFormat.rError(error))
        } else {
            let result = { "message": "To-Do's has been added successfully" }   
            res.status(200).send(resFormat.rSuccess(result))
        }
    })
}

function todosList(req, res) {
    let { fields, offset, query, order, limit, search } = req.body  
    ToDos.find(query, fields, function (err, todoList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        totalRecords = todoList.length; 
        res.send(resFormat.rSuccess({ todoList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit)
}
  

function deleteTodos(req,res){
    ToDos.deleteOne({ "_id": req.body._id }, function (err, data) {
        if (err) {
            res.send(resFormat.rError(err))
        } else {
            let result = { "message": "Record has been deleted successfully" }   
            res.status(200).send(resFormat.rSuccess(result))
        }
    })
}

function updateTodos(req, res){
    var params = { modifiedOn: new Date(), comments: req.body.comments}
    ToDos.updateOne({ _id: req.body._id }, { $set: params }, function (err, updatedUser) {
        if (err) {
            res.send(resFormat.rError(err))
        } else {
            let result = { "message": "Record has been updated successfully" }   
            res.status(200).send(resFormat.rSuccess(result))
        }
    });
}

 
router.post("/add-todos", addTodos)
router.post("/todos-list", todosList)
router.post("/delete-todos", deleteTodos)
router.post("/update-todos", updateTodos)

module.exports = router