var express = require('express')
var router = express.Router()
var passport = require('passport')
var request = require('request')
var jwt = require('express-jwt')
const mongoose = require('mongoose')
var async = require('async')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const User = require('./../models/Users')
var zipcodes = require('zipcodes');
// Function to activate advisor
function calculateZipcodeDistance(req, res) {
  //https://www.freemaptools.com/distance-between-usa-zip-codes.htm
  let { query } = req.body;
  
  var from = zipcodes.lookup(query.from);
  var to = zipcodes.lookup(query.to);

  var dist = zipcodes.distance(query.from,query.to);

  var distkm = zipcodes.toKilometers(dist);

  var miles = zipcodes.toMiles(distkm);   

}

router.post("/calculateZipDistance", calculateZipcodeDistance);
module.exports = router
