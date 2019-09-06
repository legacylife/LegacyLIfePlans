/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 05 Sept 2019 04:00 PM
 * @summary: Coach Corner Category
 * @description: Route for execute the all function for coach corner category
 * @link : api/coach-corner-category
 */
var express       = require('express')
var router        = express.Router()
var CoachCategory = require('./../models/coachCornerCategory')
const { isEmpty } = require('lodash')
const resFormat   = require('./../helpers/responseFormat')
const resMessage  = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')

/**
 * @summary : function to get list of coach corner category as per given criteria
 * @param {*} req : request from api
 * @param {*} res : response to api
 */
function list(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function(key, index) {
      if(key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  CoachCategory.count(query, function(err, freeTrialCount) {
    if(freeTrialCount) {
      totalRecords = freeTrialCount
    }
    CoachCategory.find(query, fields, function(err, freeTrialPeriodList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({ freeTrialPeriodList, totalRecords}))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

/**
 * @summary : function to create new record for coach corner category
 * @param {*} req : request from api
 * @param {*} res : response to api
 */
function create (req, res) {
  let { data } = req.body
  let { fromId } = req.body
  console.log("requestParam", data)
  let globalSetting = new CoachCategory()
      globalSetting = { aliasName: '',
                        title : data.title,
                        orderNo : data.orderNo,
                        status : data.status,
                        createdBy : data.requestBy,
                        createdOn : new Date(),
                      }
  globalSetting.save(function(err, newrecord) {
    if (err) {
      res.status(500).send(resFormat.rError(err))
    }
    let activity = 'Created Coach Corner Category',
        message  = resMessage.data( 607, [{key: '{field}',val: 'Category '+data.title}, {key: '{status}',val: 'created'}] )
    allActivityLog.updateActivityLogs(fromId, fromId, activity, message, 'Admin Panel', 'Coach Corner Category')
    res.send(resFormat.rSuccess(message))
  })
}

/**
 * @summary : function to update coach corner category details
 * @param {*} req : request from api
 * @param {*} res : response to api
 */
function update(req, res) {
  let { fromId } = req.body
  let { categoryName } = req.body
  let { oldStatus } = req.body

  CoachCategory.updateOne({ _id: req.body._id },{ $set: req.body} ,(err, updateCoachCategory)=>{
    if (err) {
      res.send(resFormat.rError(err))
    }
    else {
      let activity = 'Update Coach Corner Category Status'
      let message = ''
      if( oldStatus != req.body.status ) {
        message = resMessage.data( 607, [{key: '{field}',val: 'Category status'}, {key: '{status}',val: 'updated'}] )
      }
      else{
        activity = 'Update Coach Corner Category'
        message = resMessage.data( 607, [{key: '{field}',val: 'Category '+categoryName}, {key: '{status}',val: 'updated'}] )
      }
      allActivityLog.updateActivityLogs(fromId, fromId, activity, message, 'Admin Panel', 'Coach Corner Category')
      res.send(resFormat.rSuccess(message))
    }
  })
}

/**
 * @summary : function to get requested coach corner category details
 * @param {*} req : request from api
 * @param {*} res : response to api
 */
function view(req, res) {
  const { query, fields } = req.body
  CoachCategory.findOne(query, fields , function(err, CoachCategoryDetails) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(CoachCategoryDetails))
    }
  })
}

router.post("/create", create)
router.post("/list", list)
router.post("/update", update)
router.post("/view", view)

module.exports = router