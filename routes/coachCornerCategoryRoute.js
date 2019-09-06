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
async function list(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function(key, index) {
      if(key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  let categoryCount = await getDocumentCount(query)
  if(categoryCount) {
    totalRecords = categoryCount
  }
 
  CoachCategory.find(query, fields, function(err, categoryList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess({ categoryList, totalRecords}))
    }
  }).sort(order).skip(offset).limit(limit)
}

/**
 * @summary : function to create new record for coach corner category
 * @param {*} req : request from api
 * @param {*} res : response to api
 */
async function create (req, res) {
  let { data }        = req.body,
      { fromId }      = req.body,
      totalRecords    = 1,
      aliasName       = data.title.replace(/ /g, '-'),
      freeTrialCount  = await getDocumentCount(),
      aliasExistCount = await getDocumentCount({ aliasName: {$regex: ".*" + aliasName + ".*"} })
      
      if(freeTrialCount) {
        totalRecords = totalRecords + freeTrialCount
      }
  
      if( aliasExistCount && aliasExistCount > 0 ) {
        aliasName = aliasName+'-'+aliasExistCount
      }
  let insert_obj = {  aliasName : aliasName,
                      title     : data.title,
                      orderNo   : totalRecords,
                      status    : data.status,
                      createdBy : fromId,
                      createdOn : new Date()
                    }
  let newCategory = new CoachCategory(insert_obj)  
      newCategory.save(function(err, newrecord) {
        if (err) {
          res.status(500).send(resFormat.rError(err))
        }
        let activity = 'Created Category Details',
            message  = resMessage.data( 607, [{key: '{field}',val: 'Category Details'}, {key: '{status}',val: 'created'}] )
        allActivityLog.updateActivityLogs(fromId, fromId, activity, message, 'Admin Panel', 'Coach Corner Category')
        res.send(resFormat.rSuccess({message:message}))
      })
}

/**
 * @summary : function to update coach corner category details
 * @param {*} req : request from api
 * @param {*} res : response to api
 */
async function update(req, res) {
  let { fromId }        = req.body,
      { data }          = req.body,
      { categoryName }  = req.body,
      { oldTitle }      = req.body,
      { oldStatus }     = req.body

  if( oldTitle != data.title ) {
    let aliasName       = data.title.replace(/ /g, '-')
    let aliasExistCount = await getDocumentCount({ aliasName: {$regex: ".*" + aliasName + ".*"} })
    if( aliasExistCount > 0 ) {
      aliasName = aliasName+'-'+aliasExistCount
    }
    data = Object.assign({ aliasName: aliasName}, data)
  }

  CoachCategory.updateOne({ _id: data._id },{ $set: data} ,(err, updateCoachCategory)=>{
    if (err) {
      res.send(resFormat.rError(err))
    }
    else {
      let activity = 'Update Category Status'
      let message = ''
      if( oldStatus != req.body.status ) {
        message = resMessage.data( 607, [{key: '{field}',val: 'Coach corner category status'}, {key: '{status}',val: 'updated'}] )
      }
      else{
        activity = 'Update Category Details'
        message = resMessage.data( 607, [{key: '{field}',val: 'Coach corner category details'}, {key: '{status}',val: 'updated'}] )
      }
      allActivityLog.updateActivityLogs(fromId, fromId, activity, message, 'Admin Panel', 'Coach Corner Category')
      res.send(resFormat.rSuccess({ message: message }))
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

async function getDocumentCount( queryParam = {} ) {
  return await CoachCategory.countDocuments(queryParam)
}

router.post("/create", create)
router.post("/list", list)
router.post("/update", update)
router.post("/view", view)

module.exports = router