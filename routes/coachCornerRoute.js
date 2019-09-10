/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 06 Sept 2019 04:00 PM
 * @summary: Coach Corner Route
 * @description: Route for execute the all function for coach corner posts
 * @link : api/coach-corner-post
 */
var express       = require('express')
var router        = express.Router()
var CoachCorner   = require('./../models/coachCorner')
var CoachCategory = require('./../models/coachCornerCategory')
const { isEmpty } = require('lodash')
const resFormat   = require('./../helpers/responseFormat')
const resMessage  = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')
let mongoose = require('mongoose')

/**
 * @summary : function to get list of coach corner as per given criteria
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
  let postCount = await getDocumentCount(query)
  if( postCount ) {
    totalRecords = postCount
  }

  CoachCorner.find(query, fields, function(err, postList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess({ postList, totalRecords}))
    }
  }).sort(order).skip(offset).limit(limit).populate('category','title aliasName status')
}

/**
 * @summary : function to create new record for coach corner
 * @param {*} req : request from api
 * @param {*} res : response to api
 */
async function create (req, res) {
  let { data }        = req.body,
      { fromId }      = req.body,
      totalRecords    = 1,
      aliasName       = data.title.replace(/ /g, '-'),
      postCount       = getDocumentCount(),
      aliasExistCount = getDocumentCount({ aliasName: {$regex: ".*" + aliasName + ".*"} })
      
      if(postCount) {
        totalRecords = totalRecords + postCount
      }
  
      if( aliasExistCount && aliasExistCount > 0 ) {
        aliasName = aliasName+'-'+aliasExistCount
      }

  let insert_obj = {
      aliasName   : aliasName,
      title       : data.title,
      description : data.description,
      category    : data.category,
      image       : data.image,
      viewDetails : [],
      status      : data.status,
      createdBy   : fromId,
      createdOn   : new Date()
  }

  let newCoachDetails = new CoachCorner(insert_obj)
      newCoachDetails.save(function(err, newrecord) {
        if (err) {
          res.status(500).send(resFormat.rError(err))
        }
        let activity = 'Created Post Details',
            message  = resMessage.data( 607, [{key: '{field}',val: 'Post Details'}, {key: '{status}',val: 'created'}] )
        allActivityLog.updateActivityLogs(fromId, fromId, activity, message, 'Admin Panel', 'Coach Corner Post')
        res.send(resFormat.rSuccess({message:message}))
      })
}

/**
 * @summary : function to update coach corner details
 * @param {*} req : request from api
 * @param {*} res : response to api
 */
async function update(req, res) {
  let { fromId }    = req.body,
      { data }      = req.body,
      { oldTitle }  = req.body,
      { oldStatus } = req.body

  if( oldTitle != data.title ) {
    let aliasName       = data.title.replace(/ /g, '-')
    let aliasExistCount = await getDocumentCount({ aliasName: {$regex: ".*" + aliasName + ".*"} })
    if( aliasExistCount > 0 ) {
      aliasName = aliasName+'-'+aliasExistCount
    }
    data = Object.assign({ aliasName: aliasName}, data)
  }
  
  CoachCorner.updateOne({ _id: data._id },{ $set: data} ,(err, updateCoachCorner)=>{
    if (err) {
      res.send(resFormat.rError(err))
    }
    else {
      let activity = 'Update Post Status'
      let message = ''
      if( oldStatus != data.status ) {
        message = resMessage.data( 607, [{key: '{field}',val: 'Coach corner post status'}, {key: '{status}',val: 'updated'}] )
      }
      else{
        activity = 'Update Post Details'
        message = resMessage.data( 607, [{key: '{field}',val: 'Coach corner post details'}, {key: '{status}',val: 'updated'}] )
      }
      allActivityLog.updateActivityLogs(fromId, fromId, activity, message, 'Admin Panel', 'Coach Corner Post')
      res.send(resFormat.rSuccess({ message: message }))
    }
  })
}

/**
 * @summary : function to get requested coach corner details
 * @param {*} req : request from api
 * @param {*} res : response to api
 */
async function view(req, res) {
  const { query, fields } = req.body
  let { fromId }          = req.body,
      { userIpAddress }   = req.body,
      CoachCornerDetails  = await CoachCorner.findOne(query, fields)

  if ( !CoachCornerDetails ) {
    res.status(401).send(resFormat.rError(err))
  } else {
    let currentViewDetails  = CoachCornerDetails.viewDetails
        totalViewCount      = currentViewDetails.length
        //isViewedDetails     = totalViewCount > 0 ? ( fromId ? currentViewDetails.some( obj => { return obj.userId === fromId} ) : currentViewDetails.some( obj => { return obj.userIpAddress === userIpAddress} ) ) : false
        isViewedDetails     = totalViewCount > 0 ? currentViewDetails.some( obj => { return obj.userIpAddress === userIpAddress} ) : false
         console.log("isViewedDetails",isViewedDetails)
    if( !isViewedDetails ) {
      let updateParam = { "userId" : fromId,
                          "userIpAddress" : userIpAddress,
                          "viewedOn" : new Date
                        },
          queryParam  = query
          currentViewDetails.push(updateParam)
      let updateCount = await updateViewCount( queryParam, { viewDetails: currentViewDetails} )
      if( updateCount ) {
        totalViewCount = totalViewCount + 1
      }
    }

    if( fromId ) {
      let message = resMessage.data( 607, [{key: '{field}',val: 'Coach corner post details'}, {key: '{status}',val: 'viewed'}] )
      allActivityLog.updateActivityLogs(fromId, fromId, 'Viewed Post Details', message, 'Coach Corner', 'Coach Corner Post')
    }
    res.send(resFormat.rSuccess( {postDetails: CoachCornerDetails, totalViews: totalViewCount} ))
  }
}

async function getMostViewedArticles(req, res) {
  let articles = await CoachCorner.aggregate([
                  {
                    $project: {
                      _id: 1,
                      title: 1,
                      aliasName: 1,
                      category:1,
                      image :1,
                      totalViews: { $size:"$viewDetails" }
                    }
                  },
                  {
                    $group: {
                      _id: "$title",
                      totalViews: { $first : "$totalViews" },
                      doc: { $first: "$$ROOT" },
                    }
                  },
                  {
                    $replaceRoot: { "newRoot":"$doc" }
                  },
                  {
                    $sort: { "totalViews": -1 }
                  },
                  { $limit: 5 }
                ])

  let categoryList = await CoachCategory.find( {status: 'On'}, {_id: 1, status: 1})

  let aciveArticles = articles.filter( (val) => {
    return categoryList.some(item => String(item._id) === String(val.category))
  })

  res.send(resFormat.rSuccess( {articles: aciveArticles } ))
}

async function getDocumentCount( queryParam = {} ) {
  return await CoachCorner.countDocuments(queryParam)
}

async function updateViewCount( queryParam, updateParam ) {
  return await CoachCorner.updateOne( queryParam, {$set: updateParam})
}

router.post("/create", create)
router.post("/list", list)
router.post("/update", update)
router.post("/view", view)
router.post("/most-viewed-articles", getMostViewedArticles)

module.exports = router