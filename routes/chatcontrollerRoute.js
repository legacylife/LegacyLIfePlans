var express = require('express')
var router = express.Router()
const User = require('./../models/Users')
const chat = require('./../models/Chat.js')
var constants = require('./../config/constants')
var jwt = require('express-jwt')
var Q = require('q')
const resFormat = require('./../helpers/responseFormat')
const { isEmpty } = require('lodash')
const resMessage  = require('./../helpers/responseMessages')
var async = require('async');
let http = require('http');
let server = http.Server(express);
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

async function userStatus(data,status) {
    if(data.userId!=undefined){
      let found = await User.findOne({_id:data.userId},{_id:1});
      if(found){
         await User.updateOne({_id:found._id},{loginStatus:status});
         console.log('Chat online --- '+data.userId,'status-->',status);
      }
    }
    return true;
}

async function chatRoom(chatId,userId) {
  console.log('******************************************chatRoom --- '+userId,'-----*****************--',chatId);
    let found = await chat.findOne({_id:chatId});
    if(found) { //await chat.updateMany({_id:found._id},{$set: proquery })


//     db.getCollection("users").update({_id:ObjectId("5dceb9ee42f0021848bd8d7e"),"chats.status":"unread"}, 
// {"$set": {"chats.$[em].status":"read","chats.$[em].time":"" }},
// { "arrayFilters": [{ "em.status": "unread" }], "multi": true }
// );
        await chat.update({_id:found._id,chats: { $elemMatch: { contactId: { '$ne': userId }, status: 'unread' }}},{$set : {'chats.$.status': 'read'}}, {safe: true, multi:true});
        //_id: ObjectId("5dce3b29045f631b5004db94"),chats: { $elemMatch: { contactId: { '$ne': '5d369411e485cd5cd96bdaf6' }, status: 'unread' } }},{ $set: { 'chats.$.status': 'read' } }
        // await chat.updateOne({_id:found._id,'chats.status': 'unread'},{$set : {'chats.$.status': 'read'}});
        // console.log('Chat ID --- '+chatId,'found-->',found);
    }
  return true;
}

async function userMessagesStatus(userId,status) {
  console.log('******************************************userMessagesStatus --- '+userId,'-----*****************--',status);
  let unreadCount = [];
  if(userId!==undefined){
    //  unreadCount = await chat.countDocuments({$or:[{chatfromid:userId},{ chatwithid:userId}],"chats.status":'unread'});
    // var userUnreadCnt = [{ user_id: "5d36932ce485cd5cd96bdaf0", unreadCnt: Math.floor((Math.random() * 10) + 1) },
    // { user_id: "5cc9cb111955852c18c5b737", unreadCnt: Math.floor((Math.random() * 10) + 1) },
    // { user_id: "5d369411e485cd5cd96bdaf6", unreadCnt: Math.floor((Math.random() * 10) + 1) } ] //populate('chatfromid').populate('chatwithid');
    let chatingData = await chat.find({$or:[{chatfromid:userId},{ chatwithid:userId}]});

    let index = 0;    let chatInfolist = [];
      await Promise.all(chatingData.map(async (val)=>{       
        if(val.chats.length>0){
          let chatRecord = await chat.findOne({_id:val._id,chats: { $elemMatch: { status: 'unread' }}});
          unreadCount = chatRecord.chats.filter((vals) => {        
            return vals.status == 'unread'
          }); 
        }
   //   console.log('Chats ',unreadCount.length,unreadCount)
      let friendId = val.chatfromid;
      if(val.chatfromid==userId) {
        friendId = val.chatwithid;
      }

      if(friendId!=null) {
        let makeArray = {
            user_id: friendId,
            unread:unreadCount.length,
          }
          chatInfolist.push(makeArray);
        }
        
    }))
    console.log('Return ---- chatInfolist*************--- ',chatInfolist,'indexindex',index++);
    return chatInfolist;
    // chatingData.forEach(async ( val, callback ) => {
    //   let friendId = '';
    //   if(val.chatfromid!=userId){
    //     friendId = val.chatfromid;
    //   }
    //   if(val.chatwithid!=userId){
    //     friendId = val.chatwithid;
    //   }

    //   unreadCount = await chat.countDocuments({_id:val._id,chats: { $elemMatch: { contactId: { '$ne': userId }, status: 'unread' }}}, {multi:true});
    //   console.log('****************userMessagesStatus ---- unreadCount--- '+unreadCount,'friendId====',friendId);
    //   let makeArray = {
    //     user_id: friendId,
    //     unreadCnt:unreadCount,
    //   }

    //   chatInfolist.push(makeArray);
    //   callback()       
    // })


    // async.each(chatingData,async (val,callback)=>{
    //   let friendId = '';
    //   if(val.chatfromid!=userId){
    //     friendId = val.chatfromid;
    //   }
    //   if(val.chatwithid!=userId){
    //     friendId = val.chatwithid;
    //   }

    //   unreadCount = await chat.countDocuments({_id:val._id,chats: { $elemMatch: { contactId: { '$ne': userId }, status: 'unread' }}}, {multi:true});
    //   console.log('****************userMessagesStatus ---- unreadCount--- '+unreadCount,'friendId====',friendId);
    //   let makeArray = {
    //     user_id: friendId,
    //     unreadCnt:unreadCount,
    //   }

    //   chatInfolist.push(makeArray);   
    //   callback()                
    // })




   // console.log('****************userMessagesStatus ----   chatInfolist--- '+chatInfolist);
     // return chatInfolist;
  }
 // return chatInfolist;
}

module.exports = { "userStatus": userStatus,"chatRoom":chatRoom,"userMessagesStatus":userMessagesStatus }
