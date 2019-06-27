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
    for (var index = 0; index < membersLength; index++) {
        let emailId = members[index].email
        let inviteToName = members[index].name
        await User.findOne({ email_id: emailId }, function (err, data) {
            if (data == null) {
                inviteToUserId = ""
            } else {
                inviteToUserId = data._id
            }
        })
        emailTemplatesRoute.getEmailTemplateByCode("InviteCustomer").then((template) => {
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
        InviteObj.status = 'Active';
        InviteObj.createdOn = new Date();
        InviteObj.modifiedOn = new Date();
        InviteObj.save({}, function (err, newEntry) {
            if (err) {
                res.send(resFormat.rError(err))
            } else {
                let result = { "message": "Invitations has been sent successfully!" }
                res.status(200).send(resFormat.rSuccess(result))
            }
        })
    }
}

function generateToken(n) {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var token = '';
    for (var i = 0; i < n; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
}

router.post("/invite-members", inviteMembers)
module.exports = router