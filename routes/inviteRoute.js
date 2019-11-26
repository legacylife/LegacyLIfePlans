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
const resMessage = require('./../helpers/responseMessages')
const allActivityLog = require('./../helpers/allActivityLogs')
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
        let s3URL = constants.s3Details.serveUrl+'/'+constants.s3Details.inviteDocumentsPath
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
        let inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        if (members[index].relation == "Advisor") {
            templateType = 'InviteAdvisor';
            clientUrl = constants.clientUrl + "/advisor/signup/"+inviteCode;
        } else {
            templateType = 'InviteCustomer';
            clientUrl = constants.clientUrl + "/customer/signup/"+inviteCode;
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
        InviteObj.inviteType = members[index].relation=="Advisor" ? "advisor" : "customer";
        InviteObj.inviteBy   = inviteType
        InviteObj.name       = inviteToName;
        InviteObj.email      = emailId;
        InviteObj.relation   = members[index].relation;
        InviteObj.documents  = attachmentsImages;
        InviteObj.inviteCode = inviteCode;
        InviteObj.status     = 'Active';
        InviteObj.createdOn  = new Date();
        InviteObj.modifiedOn = new Date();
        InviteObj.save({}, function (err, newEntry) {})    
    }

    if(advisorInvite){
         const params = {
            inviteById: inviteById,
            inviteBy: 'advisor'
        }
        let resultCount = 0
        await Invite.find(params, function (err, data) {
            if (data != null) {
                resultCount = data.length
            }
        }) 
        let advUserData = {};
        await User.findOne({"_id" : inviteById}, function (err, userdata) {
            if (userdata) {
                advUserData = userdata
            }
        }) 
        
        let newDt = new Date();
        let today = new Date();

        let targetCount = 0;
        let noOfDaysExtended = 0;
        let subscriptionFlag = true;
        let inviteEndFlag = false;



        let lastInviteEndDate = new Date();
        let inviteEndDate  = new Date();
        let oldEndDate  = new Date();

        if(advUserData){
            if(advUserData.userSubscriptionEnddate){
                newDt =  advUserData.userSubscriptionEnddate;
                inviteEndDate =  advUserData.userSubscriptionEnddate; 
                oldEndDate  =  advUserData.userSubscriptionEnddate;            
            }
            if(advUserData.refereAndEarnSubscriptionDetail && advUserData.refereAndEarnSubscriptionDetail.targetCount){
                targetCount = advUserData.refereAndEarnSubscriptionDetail.targetCount
            }
            if(advUserData.refereAndEarnSubscriptionDetail && advUserData.refereAndEarnSubscriptionDetail.noOfDaysExtended){
                noOfDaysExtended = advUserData.refereAndEarnSubscriptionDetail.noOfDaysExtended
            }
            if(advUserData.refereAndEarnSubscriptionDetail && advUserData.refereAndEarnSubscriptionDetail.endDate && advUserData.refereAndEarnSubscriptionDetail.endDate != ""){
                inviteEndDate = advUserData.refereAndEarnSubscriptionDetail.endDate
            }
            if(advUserData.refereAndEarnSubscriptionDetail && advUserData.refereAndEarnSubscriptionDetail.lastInviteEndDate && advUserData.refereAndEarnSubscriptionDetail.lastInviteEndDate != ""){
                lastInviteEndDate = advUserData.refereAndEarnSubscriptionDetail.lastInviteEndDate
            }
            if(advUserData.subscriptionDetails && advUserData.subscriptionDetails.length > 0){
                subscriptionFlag = false
            }
        }
        if(today > lastInviteEndDate && today < inviteEndDate){
            console.log("today >>>>>>>",today," <<<<<< lastInviteEndDate >>>>>",lastInviteEndDate," <<<<<< inviteEndDate >>>>>",inviteEndDate)
            inviteEndFlag = true
        }
        
        newDt.setDate(newDt.getDate() + noOfDaysExtended)        

        // upgrade plan for next 30 days.
         if (resultCount >= targetCount && subscriptionFlag && inviteEndFlag) { //30
            let subscriptionData = {
                'refereAndEarnSubscriptionDetail.endDate': newDt, 'userSubscriptionEnddate': newDt, 'refereAndEarnSubscriptionDetail.lastInviteEndDate': inviteEndDate
            }
            User.updateOne({ _id: inviteById }, { $set: subscriptionData }, function (err, updatedDetails) {})
        } 
        
        // delete temp invite files
        await InviteTemp.deleteMany({ inviteById: inviteById });
    }
    let message = resMessage.data( 607, [{key:'{field}',val:"Invitation"}, {key:'{status}',val:'sent'}] )
    //Update activity logs
    allActivityLog.updateActivityLogs( inviteById, (inviteToUserId ? inviteToUserId : inviteById) , "Invite", message,'')
    let result = { "message": message }
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
            completedDays   = getDateDiff( today, moment(userCreatedOn).toDate(), 'asDays' ),
            completedMonths = getDateDiff( today, moment(userCreatedOn).toDate() ),
            startDate       = new Date(userCreatedOn),
            endDate         = new Date(userCreatedOn),
            freePremiumDays = userDetails[0]['freeTrialPeriod'] ? userDetails[0]['freeTrialPeriod']['bfrSubFreePremiumDays'] : 0,
            targetCount     = userDetails[0]['refereAndEarnSubscriptionDetail'] ? userDetails[0]['refereAndEarnSubscriptionDetail']['targetCount'] : 0,
            extendedDays    = userDetails[0]['refereAndEarnSubscriptionDetail'] ? userDetails[0]['refereAndEarnSubscriptionDetail']['noOfDaysExtended'] : 0
        
        //console.log("completedDays",completedDays,"freePremiumDays",freePremiumDays)
        if( completedDays <= freePremiumDays) {
            endDate.setDate( endDate.getDate() + (freePremiumDays) );
        }
        else if( completedDays >= freePremiumDays && completedMonths < 1) {
            startDate.setDate( startDate.getDate() + (freePremiumDays) );
            endDate.setDate( endDate.getDate() + (completedDays+1) );
        }
        else if( completedMonths > 1) {
            startDate.setMonth( startDate.getMonth() + (completedMonths) );
            endDate.setMonth( endDate.getMonth() + (completedMonths + 1) );
        }
        else{
            endDate.setMonth( endDate.getMonth() + (completedMonths + 1) );
        }
        console.log("startDate",startDate,"endDate",endDate)
        let remainingDays   = Math.abs(Math.round( getDateDiff( today, moment(endDate).toDate(), 'asDays' )))
        let queryparam = {
            inviteById: paramData.inviteById,
            createdOn : { $gte: new Date(startDate) , $lte: new Date(endDate) }
        }
        //paramData.createdOn = { $gte: new Date(startDate) , $lte: new Date(endDate) }

        let data = await Invite.find(queryparam)
        console.log("completedMonths ===== ",completedMonths,"\n createdOn ===== ",userDetails[0]['createdOn'],"\n paramData ===== ",paramData.createdOn,"remainingDays",remainingDays,"extendedDays",extendedDays)

        if (data != null) {
            resultCount = data.length
        }
        let completedDaysToRegister = Math.abs(getDateDiff( today, moment(userCreatedOn).toDate(), 'asDays' ))
        //console.log("\n freePrimiumExpireDays",freePrimiumExpireDays)
        /* if( completedDaysToRegister > 30 ) {
            let newDate = new Date(userCreatedOn)
                newDate.setMonth( newDate.getMonth() + completedMonths)
                newDate.setDate( newDate.getDate() + extendedDays)
            
            console.log("\n newDate ==== ",newDate)
            remainingDays = Math.abs(Math.round(getDateDiff( moment(newDate).toDate(), today, 'asDays' )))//remainingDays + extendedDays
        }
        else{ */
            remainingDays = resultCount >= targetCount ? remainingDays + extendedDays : remainingDays
        //}
        result = { "count": resultCount,"remainingDays":remainingDays, "completedMonths":completedMonths, "targetCount": targetCount, "extendedDays": extendedDays }
        res.status(200).send(resFormat.rSuccess(result))
    }
}

async function getLastInviteMembersCount(req, res) {
    let paramData = req.body
    let resultCount = 0
    let searchParam = { _id: paramData.inviteById, userType: paramData.inviteType}    
    let userDetails = await User.find(searchParam)
    if( userDetails && userDetails.length > 0 ) {
        let userCreatedOn   = userDetails[0]['createdOn'],
            today           = moment().toDate(),
            completedMonths = getDateDiff( today, moment(userCreatedOn).toDate() ),
            startDate       = new Date(userCreatedOn),
            endDate         = new Date(userCreatedOn)

        if( completedMonths > 1) {
            startDate.setMonth( startDate.getMonth() + (completedMonths -1) );
            endDate.setMonth( endDate.getMonth() + (completedMonths) );
        }
        else{
            endDate.setMonth( endDate.getMonth() + (completedMonths+1) );
        }
         
        let remainingDays   = Math.abs(Math.round( getDateDiff( today, moment(endDate).toDate(), 'asDays' )))
        paramData.createdOn = { $gte: new Date(startDate) , $lte: new Date(endDate) }
        
        let targetCount  = userDetails[0]['refereAndEarnSubscriptionDetail']['targetCount'],
            extendedDays = userDetails[0]['refereAndEarnSubscriptionDetail']['noOfDaysExtended']
        let data = await Invite.find(paramData)
        
        //console.log("completedMonths ===== ",completedMonths,"\n createdOn ===== ",userDetails[0]['createdOn'],"\n paramData ===== ",paramData.createdOn,"remainingDays",remainingDays,"extendedDays",extendedDays)

        if (data != null) {
            resultCount = data.length
        }
        
        result = { "count": resultCount,"completedMonths":completedMonths, "targetCount": targetCount, "extendedDays": extendedDays }
        res.status(200).send(resFormat.rSuccess(result))
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
router.post("/get-last-invite-members-count", getLastInviteMembersCount)

module.exports = router