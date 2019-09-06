var express = require('express')
var router = express.Router()
var location = require('./../models/locations.js')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')

//function to get list of location zipcodes
function zipcodesList(req, res) {
  let {query,search,limit} = req.body;

  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
        query[key] = new RegExp(query[key], 'i')
    })
  } 
  //console.log('query',query)
  location.find(query, {ZIP:1}, function(err, locationList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess({ locationList}))
    }
  }).limit(limit)
}


router.post("/getAllZipcodes", zipcodesList)
module.exports = router
