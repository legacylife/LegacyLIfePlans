const constants = require('./../config/constants')
const mongoose = require('mongoose')
const User = require('./../models/Users')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('../routes/emailTemplatesRoute.js')
const Trustee = require('./../models/Trustee.js')
const HiredAdvisors = require('./../models/HiredAdvisors.js')
const chat = require('./../models/Chat.js')
var async = require('async')
const Invite = require('./../models/Invite.js')
const InviteTemp = require('./../models/InviteTemp.js')
const EmailTemplates = require('./../models/EmailTemplates.js')
const sendRawEmail = require('./../helpers/sendRawEmail')

const customerAdvisorLegacyNotifications = (sendData) => {
  return new Promise(function () {
    let CUSTOMER_NAME = ''
    let ADVISOR_NAME = ''
    let SECTION_NAME = "'" + sendData.sectionName + "'"
    let emailId = ''
    let userData = [ObjectId(sendData.customerId), ObjectId(sendData.customerLegacyId)]
    User.find({ "_id": { $in: userData } }, { '_id': 1, 'firstName': 1, 'lastName': 1, 'username': 1, 'userType': 1 }, function (err, Dataresults) {
      Dataresults.forEach(results => {
        ADVISOR_NAME = (results.userType == "advisor" ? results.firstName + " " + results.lastName : "")
        if (results.userType == "customer") {
          CUSTOMER_NAME = results.firstName + " " + results.lastName
          emailId = results.username
        }
      });
    })
    emailTemplatesRoute.getEmailTemplateByCode("LegacyAdvisorFileNotification").then((template) => {
      template = JSON.parse(JSON.stringify(template));
      let body = template.mailBody.replace("{CUSTOMER_NAME}", CUSTOMER_NAME);
      body = body.replace("{ADVISOR_NAME}", ADVISOR_NAME);
      body = body.replace("{SECTION_NAME}", SECTION_NAME);
      const mailOptions = {
        to: emailId,
        subject: template.mailSubject,
        html: body
      }
      sendEmail(mailOptions)
    })
  })
}

const customerTrustees = (trusteeQuery) => {
  return new Promise(async function (resolve, reject) {
    let advCnt = 0;
    let trusteeCnt = 0;
    //console.log('**********customerTrustees trusteeQuery***********',trusteeQuery)
    await Trustee.countDocuments(trusteeQuery, async function (err, c) {
      trusteeCnt = c;
    });

    await HiredAdvisors.countDocuments(trusteeQuery, async function (err, c) {
      advCnt = c;
    });

    let totalTrusteeRecords = parseInt(trusteeCnt) + parseInt(advCnt);
    //        console.log(' TOTAL ****************',totalTrusteeRecords,'**********customerTrustees trusteeCnt***********',trusteeCnt,'**********customerTrustees advCnt***********',advCnt)
    resolve(totalTrusteeRecords);
  })
}



const getChatReadCount = (userId, friendId) => {

  return new Promise(async function (resolve, reject) {
    userId = userId.toString();
    friendId = friendId.toString();
    console.log("typeof Friend ID", typeof (friendId))
    let chatingData = await chat.findOne({ $or: [{ chatfromid: userId, chatwithid: friendId }, { chatfromid: friendId, chatwithid: userId }] });
    let chatCount = 0;
    //friendId = friendId.toString();
    //console.log(' CHAT window ID >>>>>>>>>>',typeof(chatingData._id))
    if (chatingData && chatingData.chats && chatingData.chats.length > 0) {
      let chatId = chatingData._id;
      chatId = chatId.toString();
      //console.log(' CHAT window ID <<<<<<<<<<<<',typeof(chatId));
      let unreadC = await chat.aggregate([
        {
          "$match": {
            "_id": chatId,
            //"chats.status": "unread"
            //$or:[{chatfromid:userId,chatwithid:friendId},{ chatfromid:friendId,chatwithid:userId}],
            "chats.status": "unread"
          }
        },
        {
          "$group": {
            "_id": null,
            "count": {
              "$sum": {
                "$size": {
                  "$filter": {
                    "input": "$chats",
                    "as": "el",
                    "cond": {
                      "$eq": ["$$el.status", "unread"],
                      "$eq": ["$$el.contactId", friendId]
                    }
                  }
                }
              }
            }
          }
        }
      ]);
      //   console.log('unread >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ',unreadC,' chat id ',chatId,'-------typeof-',typeof(chatId),' Friend ID',friendId)
      if (unreadC && unreadC.length > 0) {
        chatCount = unreadC[0].count;
      }
    }
    resolve(chatCount);
  })

  // chat.findOne({$or:[{chatfromid:query._id,chatwithid:val.advisorId},{ chatfromid:val.advisorId,chatwithid:query._id}]}, (err, chatingData) => {
  //     chat.aggregate([
  //       { "$match": {
  //            "_id" : chatingData._id,
  //             // $or:[{chatfromid:userId,chatwithid:friendId},{ chatfromid:friendId,chatwithid:userId}],
  //           "chats.status": "unread"
  //       }},
  //       { "$group": {
  //           "_id": null,
  //           "count": {
  //               "$sum": {
  //                   "$size": {
  //                       "$filter": {
  //                           "input": "$chats",
  //                           "as": "el",
  //                           "cond": {
  //                               "$eq": [ "$$el.status", "unread" ]
  //                           }
  //                       }
  //                   }
  //               }
  //           }
  //       }}
  //     ], (err1, unreadC) => {

  //         if(unreadC.length>0){
  //           console.log('unreadCnt>!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',unreadC[0].count)
  //           chatCount = unreadC[0].count;   
  //         }

  //         let makeArray = {
  //           _id: info._id,
  //           name: info.firstName+' '+info.lastName,
  //           avatar: userPicture,
  //           unread: chatCount, 
  //           status: info.loginStatus,
  //           mood: ""
  //         }
  //         cList.push(makeArray);
  //         console.log("repeat")
  //         cb()  
  //     })
  // })
}

/**
 * Function to store invitee * 
 */
const inviteeAdd1 = (req) => {
  return new Promise(async function (resolve, reject) {

    let members = req.body.data.inviteMembers;
    let inviteById = req.body.inviteById;
    let inviteType = req.body.inviteType;
    let inviteByName = req.body.inviteByFullName;
    console.log('#>>>>',members,'##>>>>',inviteById,'###>>>>',inviteType,'####>>>>',inviteByName);

    let inviteCode = Math.floor(100000 + Math.random() * 900000); 
    let fromData = await User.findOne({_id:inviteById},{_id:1,username:1,firstName:1,lastName:1,inviteCode:1});
    if(fromData && fromData.inviteCode){
      inviteCode = fromData.inviteCode;
    }else{
     await User.updateOne({_id:inviteById},{ $set: {inviteCode:inviteCode} });
    }
   


  });
  }


const inviteeAdd = (req) => {
  return new Promise(async function (resolve, reject) {

    let members = req.body.data.inviteMembers;
    let inviteById = req.body.inviteById;
    let inviteType = req.body.inviteType;
    let inviteByName = req.body.inviteByFullName;
    let membersLength = members.length
    let clientUrl = constants.clientUrl;
    let templateType = '';
    let inviteToUserId = '';
    let attachmentsImages = [];
    let advisorInvite = false
    if (inviteType == "advisor") {
      advisorInvite = true
      let invitesImages = await InviteTemp.find({ inviteById: inviteById }, function (err, data, index) { });
      let invitesImagesLength = invitesImages.length
      let s3URL = constants.s3Details.serveUrl + '/' + constants.s3Details.inviteDocumentsPath
      console.log("s3URL=====", s3URL)
      for (var invIndex = 0; invIndex < invitesImagesLength; invIndex++) {
        console.log("s3-path=====", s3URL + invitesImages[invIndex].documents[0].tmpName)
        attachmentsImages.push({
          "path": s3URL + invitesImages[invIndex].documents[0].tmpName,
          "fileName": invitesImages[invIndex].documents[0].title
        })
      }
    }
    let insertedArray = [];
    let inviteCode = Math.floor(100000 + Math.random() * 900000); 
    let fromData = await User.findOne({_id:inviteById},{_id:1,username:1,firstName:1,lastName:1,inviteCode:1});
    if(fromData && fromData.inviteCode){
      inviteCode = fromData.inviteCode;
    }else{
     await User.updateOne({_id:inviteById},{ $set: {inviteCode:inviteCode} });
    }
    async.each(members, function (val, callback) {
     // let inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    //  let inviteCode = Math.floor(100000 + Math.random() * 900000); 
      let insertInviteDataFlag = true;
      let insertUserExistFlag = true;
      let emailId = val.email
      let inviteToName = val.name
      User.findOne({ "username": { '$regex': new RegExp(escapeRegExp(emailId)), '$options': 'i' } }, async function (err, data) {
        if (data == null) {
          inviteToUserId = ""          
        } else {
          inviteToUserId = data._id;
          insertUserExistFlag = false; // if email exist in system do not insert so flag becomes false
        }
        //console.log("inviteToUserId >>>>>>>>>>>>>>>>>>>>>>> ",inviteToUserId)
        var InviteObj = new Invite();
        InviteObj.inviteById = inviteById;
        InviteObj.inviteToId = inviteToUserId;
        InviteObj.inviteType = val.relation == "Advisor" ? "advisor" : "customer";
        InviteObj.inviteBy = inviteType;
        InviteObj.name = inviteToName;
        InviteObj.email = emailId;
        InviteObj.relation = val.relation;
        InviteObj.documents = attachmentsImages;
        InviteObj.inviteCode = inviteCode;
        InviteObj.status = 'Active';
        InviteObj.createdOn = new Date();
        InviteObj.modifiedOn = new Date();
        InviteObj.save({}, async function (err, newEntry) { 
          insertedArray.push(newEntry) 

          if(newEntry.inviteToId && newEntry.inviteToId !=''){
            clientUrl = constants.clientUrl + "/signin";
          }
          else {
            if (newEntry.inviteType == "advisor") {
              templateType = 'InviteAdvisor';
              clientUrl = constants.clientUrl + "/advisor/signup";
            } else {
              templateType = 'InviteCustomer';
              clientUrl = constants.clientUrl + "/customer/signup";
            }
          }
          
          console.log("newEntry.inviteType >>>> "+newEntry.inviteType+" >>>>clientUrl >>>>>",clientUrl+"----------"+emailId)
          let template = await EmailTemplates.findOne({code: templateType,status:'active'},{}); 

          if(template != ''){
            let body = template.mailBody.replace("{LINK}",clientUrl);
            body = body.replace("{inviteToName}",inviteToName);
            body = body.replace("{inviteByName}",inviteByName);
            body = body.replace("{ReferInviteCode}",inviteCode);
            const mailOptions = {
              to: emailId,
              subject: template.mailSubject,
              html: body
            }
            if (advisorInvite) {
              if (attachmentsImages) {
                mailOptions['attachments'] = attachmentsImages
              }
              sendRawEmail(mailOptions);
            } else {
              sendEmail(mailOptions);
            }
          }

          /*emailTemplatesRoute.getEmailTemplateByCode(templateType).then((template) => {
            template = JSON.parse(JSON.stringify(template));
            let body = template.mailBody.replace("{LINK}",clientUrl);
            body = body.replace("{inviteToName}",inviteToName);
            body = body.replace("{inviteByName}",inviteByName);
            body = body.replace("{ReferInviteCode}",inviteCode);
            const mailOptions = {
              to: emailId,
              subject: template.mailSubject,
              html: body
            }
            if (advisorInvite) {
              if (attachmentsImages) {
                mailOptions['attachments'] = attachmentsImages
              }
              sendRawEmail(mailOptions);
            } else {
              sendEmail(mailOptions);
            }
          })*/
          // i++;
          callback();
        })
      })
      
    }, (err) => {
        //console.log("inserted array >>>>>>>>>>>>>>>>",insertedArray,"-----------members.length>>>>>>>>>>>",members.length)
        resolve(members.length);
    })
  })
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

module.exports = { customerAdvisorLegacyNotifications, customerTrustees, getChatReadCount, inviteeAdd }