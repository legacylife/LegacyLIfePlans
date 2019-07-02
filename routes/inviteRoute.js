var express = require('express')
var router = express.Router()
var passport = require('passport')
var request = require('request')
var jwt = require('express-jwt')
const mongoose = require('mongoose')
var async = require('async')
var crypto = require('crypto')
var fs = require('fs')
var nodemailer = require('nodemailer')
const { isEmpty, cloneDeep } = require('lodash')
const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const Invite = require('./../models/Invite.js')
const InviteTemp = require('./../models/InviteTemp.js')
const s3 = require('./../helpers/s3Upload')
var auth = jwt({
    secret: constants.secret,
    userProperty: 'payload'
})

// customer can send invite to members 
async function inviteMembers(req, res) {
    let members = req.body.data.inviteMembers;
    let inviteById = req.body.inviteById;
    let inviteType = req.body.inviteType;
    let inviteByName = req.body.inviteByFullName;
    let membersLength = members.length
    let clientUrl = constants.clientUrl;
    let inviteToUserId = '';
    let templateType = 'InviteCustomer';
    if (inviteType == "advisor") {
        templateType = 'InviteAdvisor';
    }

    let invitesImages = await InviteTemp.find({ inviteById: inviteById }, function (err, data, index) {});
    let invitesImagesLength = invitesImages.length
    let images = [];
    for (var invIndex = 0; invIndex < invitesImagesLength; invIndex++) {
        images.push(invitesImages[invIndex].documents[0].tmpName)
    }

    for (var index = 0; index < membersLength; index++) {
        if (inviteType == "advisor") {
            if (members[index].relation == "Advisor") {
                clientUrl = clientUrl + "/advisor/signup";
            } else {
                clientUrl = clientUrl + "/customer/signup";
            }
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
            sendEmail(mailOptions)
        })
        var InviteObj = new Invite();
        InviteObj.inviteById = inviteById;
        InviteObj.inviteToId = inviteToUserId;
        InviteObj.inviteType = inviteType;
        InviteObj.name = inviteToName;
        InviteObj.email = emailId;
        InviteObj.relation = members[index].relation;
        InviteObj.documents = images;
        InviteObj.status = 'Active';
        InviteObj.createdOn = new Date();
        InviteObj.modifiedOn = new Date();
        InviteObj.save({}, function (err, newEntry) {
        })
    }

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

    // upgrade plan for next 45 days.
    if (resultCount >= 30) {
        var newDt = new Date();
        newDt.setDate(newDt.getDate() + 45);
        let subscriptionData = {
            'subscription_detail.end_date': newDt
        }
        User.updateOne({ _id: inviteById }, { $set: subscriptionData }, function (err, updatedDetails) {
            console.log("Update Sub Date..");
        })
    }

    // delete temp invite files
    await InviteTemp.deleteMany({ inviteById: inviteById });

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
    await Invite.find(paramData, function (err, data) {
        if (data != null) {
            resultCount = data.length
        }
        result = { "count": resultCount }
        res.status(200).send(resFormat.rSuccess(result))
    })
}

router.post("/invite-members", inviteMembers)
router.post("/invite-member-check-email", inviteMemberCheckEmail)
router.post("/get-invite-members-count", getInviteMembersCount)

module.exports = router