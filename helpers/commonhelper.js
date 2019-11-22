const constants = require('./../config/constants')
const mongoose = require('mongoose')
const User = require('./../models/Users')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('../routes/emailTemplatesRoute.js')
const Trustee = require('./../models/Trustee.js')
const HiredAdvisors = require('./../models/HiredAdvisors.js')
const chat = require('./../models/Chat.js')
const customerAdvisorLegacyNotifications = (sendData) => {
  return new Promise(function() {
    let CUSTOMER_NAME = ''
    let ADVISOR_NAME = ''
    let SECTION_NAME =  "'" + sendData.sectionName + "'"
    let emailId = ''
    let userData = [ObjectId(sendData.customerId),ObjectId(sendData.customerLegacyId)]    
    User.find({"_id" : { $in: userData } },{ '_id':1, 'firstName': 1, 'lastName': 1 , 'username': 1, 'userType':1}, function (err, Dataresults) {
      Dataresults.forEach(results => {
        ADVISOR_NAME = (results.userType == "advisor" ? results.firstName + " " + results.lastName : "")
        if(results.userType == "customer"){
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
  return new Promise(async function(resolve, reject) {
        let advCnt = 0;
        let trusteeCnt = 0;
        //console.log('**********customerTrustees trusteeQuery***********',trusteeQuery)
        await Trustee.countDocuments(trusteeQuery, async function(err, c) {
          trusteeCnt = c;
        });

        await HiredAdvisors.countDocuments(trusteeQuery, async function(err, c) {
          advCnt = c;
        });
      
        let totalTrusteeRecords = parseInt(trusteeCnt) + parseInt(advCnt);
//        console.log(' TOTAL ****************',totalTrusteeRecords,'**********customerTrustees trusteeCnt***********',trusteeCnt,'**********customerTrustees advCnt***********',advCnt)
        resolve(totalTrusteeRecords);
  })
}



const getChatReadCount = (userId,friendId) => {
  
  return new Promise(async function(resolve, reject) {
     userId = userId.toString();
     friendId = friendId.toString();
     console.log("typeof Friend ID",typeof(friendId))
     let chatingData = await chat.findOne({$or:[{chatfromid:userId,chatwithid:friendId},{ chatfromid:friendId,chatwithid:userId}]});
     let chatCount = 0;
     //friendId = friendId.toString();
    //console.log(' CHAT window ID >>>>>>>>>>',typeof(chatingData._id))
     if(chatingData && chatingData.chats && chatingData.chats.length>0) {
        let chatId = chatingData._id;
        chatId = chatId.toString();
       //console.log(' CHAT window ID <<<<<<<<<<<<',typeof(chatId));
        let unreadC =   await chat.aggregate([
          { "$match": {
              "_id" :  chatId,
              //"chats.status": "unread"
              //$or:[{chatfromid:userId,chatwithid:friendId},{ chatfromid:friendId,chatwithid:userId}],
              "chats.status": "unread"
          }},
          { "$group": {
              "_id": null,
              "count": {
                  "$sum": {
                      "$size": {
                          "$filter": {
                              "input": "$chats",
                              "as": "el",
                              "cond": { 
                                  "$eq": [ "$$el.status", "unread" ],
                                  "$eq": [ "$$el.contactId",friendId]
                              }
                         }
                      }
                  }
              }
          }}
        ]);
  //   console.log('unread >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ',unreadC,' chat id ',chatId,'-------typeof-',typeof(chatId),' Friend ID',friendId)
        if(unreadC && unreadC.length>0){
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

module.exports = { customerAdvisorLegacyNotifications,customerTrustees,getChatReadCount }