/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 27 Aug 2019 10:00 PM
 * @description: Route for return all activity responses requested by client
 * @link : /api/activity
 */
var express = require('express')
var router = express.Router()
var moment    = require('moment');
const resFormat = require('./../helpers/responseFormat')
const Activities = require('./../models/ActivityLogs')

/**
 * @function: return list for all activities done by customer, advisor, system admin
 * @param {*} req 
 * @param {*} res 
 * @returns: array list of all activities
 */
async function activityLogList(req, res) {
    
    let query = [
        {
            $lookup:
            {
                from: 'users',
                localField: 'fromUserId',
                foreignField: '_id',
                as: 'fromUserDetails'
            }
        },
        {
            $lookup:
            {
                from: 'users',
                localField: 'toUserId',
                foreignField: '_id',
                as: 'toUserDetails'
            }
        },
        {
            $project: {
                "_id":1,
                "userId":1,
                "activity":1,
                "description":1,
                "section":1,
                "subSection":1,
                "fileName":1,
                "createdOn":1,
                "fromUserType":{ $arrayElemAt: [ "$fromUserDetails.userType", 0 ] },
                "toUserType":{ $arrayElemAt: [ "$toUserDetails.userType", 0 ] },
                "fromFullName":{
                    $concat: [ { $arrayElemAt: [ "$fromUserDetails.firstName", 0 ] }, " ", { $arrayElemAt: [ "$fromUserDetails.lastName", 0 ] } ] 
                },
                "toFullName": {
                    $cond: { 
                        if: { $ne: ["$toUserDetails._id","$fromUserDetails._id"] }, 
                        then: {
                            $concat: [ { $arrayElemAt: [ "$toUserDetails.firstName", 0 ] }, " ", { $arrayElemAt: [ "$toUserDetails.lastName", 0 ] } ]
                        },
                        else: '' 
                    } 
                }    
            }
        },
        { $sort : { createdOn : -1 } },
        { 
            $match: { 
                'createdOn' : {
                    $gt: new Date(moment().subtract(6, 'months')),
                    $lt: new Date()
                }
            } 
        }]
    await Activities.aggregate( query, function (err, data) {
        res.status(200).send(resFormat.rSuccess(data))
    })
}

router.post("/get-activity-logs", activityLogList)

module.exports = router