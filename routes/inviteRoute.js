var express = require('express')
var router = express.Router()
var passport = require('passport')
var request = require('request')
var jwt = require('express-jwt')
const mongoose = require('mongoose')
var async = require('async')
var crypto = require('crypto')
var fs = require('fs')
const { isEmpty, cloneDeep } = require('lodash')
const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const sendRawEmail = require('./../helpers/sendRawEmail')

const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const Invite = require('./../models/Invite.js')
const InviteTemp = require('./../models/InviteTemp.js')
const s3 = require('./../helpers/s3Upload')
var auth = jwt({
    secret: constants.secret,
    userProperty: 'payload'
})

var moment    = require('moment');

// customer can send invite to members 
async function inviteMembers(req, res) {
    let members = req.body.data.inviteMembers;
    let inviteById = req.body.inviteById;
    let inviteType = req.body.inviteType;
    let inviteByName = req.body.inviteByFullName;
    let membersLength = members.length
    let clientUrl = '';
    let templateType = '';
    let inviteToUserId = '';
    let attachmentsImages = [];
    let advisorInvite = false
    if (inviteType == "advisor") {
        advisorInvite = true
        let invitesImages = await InviteTemp.find({ inviteById: inviteById }, function (err, data, index) {});
        let invitesImagesLength = invitesImages.length           
        let s3URL = constants.s3Details.serveUrl+'/'+inviteById+'/'+constants.s3Details.inviteDocumentsPath
        console.log("s3URL=====",s3URL)
        for (var invIndex = 0; invIndex < invitesImagesLength; invIndex++) {
            console.log("s3-path=====",s3URL+invitesImages[invIndex].documents[0].tmpName)
            attachmentsImages.push({
                "path": s3URL+invitesImages[invIndex].documents[0].tmpName,
                "fileName": invitesImages[invIndex].documents[0].title            
            })
        }
    }

    for (var index = 0; index < membersLength; index++) {
        if (members[index].relation == "Advisor") {
            templateType = 'InviteAdvisor';
            clientUrl = constants.clientUrl + "/advisor/signup";
        } else {
            templateType = 'InviteCustomer';
            clientUrl = constants.clientUrl + "/customer/signup";
        }
        let emailId = members[index].email
        let inviteToName = members[index].name
        await User.findOne({ email_id: emailId }, function (err, data) {
            if (data == null) {
                inviteToUserId = ""
            } else {
                inviteToUserId = data._id
            }
        })

        await emailTemplatesRoute.getEmailTemplateByCode(templateType).then((template) => {
            template = JSON.parse(JSON.stringify(template));
            let body = template.mailBody.replace("{LINK}", clientUrl);
            body = body.replace("{inviteToName}", inviteToName);
            body = body.replace("{inviteByName}", inviteByName);
            const mailOptions = {
                to: emailId,
                subject: template.mailSubject,
                html: body
            }
            if(advisorInvite){
                mailOptions['attachments'] = attachmentsImages               
                sendRawEmail(mailOptions)
            }else{
                sendEmail(mailOptions)
            }
        })

        var InviteObj = new Invite();
        InviteObj.inviteById = inviteById;
        InviteObj.inviteToId = inviteToUserId;
        InviteObj.inviteType = inviteType;
        InviteObj.name = inviteToName;
        InviteObj.email = emailId;
        InviteObj.relation = members[index].relation;
        InviteObj.documents = attachmentsImages;
        InviteObj.status = 'Active';
        InviteObj.createdOn = new Date();
        InviteObj.modifiedOn = new Date();
        InviteObj.save({}, function (err, newEntry) {})    
    }

    if(advisorInvite){
        const params = {
            inviteById: inviteById,
            inviteType: 'advisor'
        }
        let resultCount = 0
        await Invite.find(params, function (err, data) {
            if (data != null) {
                resultCount = data.length
            }
        })
        // upgrade plan for next 30 days.
        if (resultCount == 5) { //30
            var newDt = new Date();
            newDt.setDate(newDt.getDate() + 30);
            let subscriptionData = {
                'refereAndEarnSubscriptionDetail.end_date': newDt
            }
            User.updateOne({ _id: inviteById }, { $set: subscriptionData }, function (err, updatedDetails) {})
        }
        // delete temp invite files
        await InviteTemp.deleteMany({ inviteById: inviteById });
    }
 
    let result = { "message": "Invitations has been sent successfully!" }
    res.status(200).send(resFormat.rSuccess(result))
}

async function inviteMemberCheckEmail(req, res) {
    let paramData = req.body
    let result = false
    await Invite.findOne(paramData, function (err, data) {
        if (data == null) {
            result = { "status": false }
        } else {
            result = { "status": true }
        }
        res.status(200).send(resFormat.rSuccess(result))
    })
}

async function getInviteMembersCount(req, res) {
    let paramData = req.body
    let resultCount = 0
    let searchParam = { _id: paramData.inviteById, userType: paramData.inviteType}    
    let userDetails = await User.find(searchParam)
    if( userDetails && userDetails.length > 0 ) {
        let userCreatedOn   = userDetails[0]['createdOn'],
        today           = moment().toDate(),
        completedMonths = Math.round( getDateDiff( today, moment(userCreatedOn).toDate() ));
        let startDate       = new Date(userCreatedOn);
        if( completedMonths > 1) {
            startDate.setMonth( startDate.getMonth() + (completedMonths) );
        }            
        let endDate         = new Date(userCreatedOn)
        endDate.setMonth( endDate.getMonth() + (completedMonths + 1) );
        let remainingDays = Math.abs(Math.round( getDateDiff( today, moment(endDate).toDate(), 'asDays' )))
        paramData.createdOn = { $gte: new Date(startDate) , $lte: new Date(endDate) }
        await Invite.find(paramData, function (err, data) {
            if (data != null) {
                resultCount = data.length
            }
        result = { "count": resultCount,"remainingDays":remainingDays, "completedMonths":completedMonths }
        res.status(200).send(resFormat.rSuccess(result))
        })
    }
}

/**
 * return date difference in days
 * @param startDate 
 * @param endDate 
 */
function getDateDiff( endDate, startDate, returnAs=null ) {
    if( returnAs == 'asDays') {
        return moment.duration( 
            moment(endDate).diff( moment(startDate) ) 
        ).asDays()
    }
    else{
        return moment.duration( 
            moment(endDate).diff( moment(startDate) ) 
        ).asMonths()
    }
  }

router.post("/invite-members", inviteMembers)
router.post("/invite-member-check-email", inviteMemberCheckEmail)
router.post("/get-invite-members-count", getInviteMembersCount)

module.exports = router