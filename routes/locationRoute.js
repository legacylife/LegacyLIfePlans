var express = require('express')
var router = express.Router()
var location = require('./../models/locations.js')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')

//function to get list of location zipcodes
function zipcodesList(req, res) {
  let {query,limit} = req.body;
  
  const {query:{$select}} = req;
  const {query:{$filter}} = req;
  let search = $filter;

  if (search) {
    search = search.split("'");
    query = {'ZIP':{'$regex':search[1]}};
  } 

  location.find(query, {ZIP:1}, function(err, locationList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(locationList)
    }
  }).limit(100)
}


router.get("/getAllZipcodes", zipcodesList)
module.exports = router
