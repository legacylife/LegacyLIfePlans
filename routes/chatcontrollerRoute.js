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
    let chatingData = await chat.findOne({_id:chatId});
    if(chatingData) { //await chat.updateMany({_id:found._id},{$set: proquery })
       // await chat.update({_id:found._id,chats: { $elemMatch: { contactId: { '$ne': userId }, status: 'unread' }}},{$set : {'chats.$.status': 'read'}}, {safe: true, multi:true});
       chatingData.chats.forEach( async ( val, index ) => {
          if(userId!=val.contactId) {
            console.log('_id--------------<<<<<<',val._id)
            await chat.updateOne({_id:chatingData._id,'chats.status': 'unread'},{$set : {'chats.$.status': 'read'}});
          }
         })
        // await chat.updateOne({_id:found._id,'chats.status': 'unread'},{$set : {'chats.$.status': 'read'}});
        // console.log('Chat ID --- '+chatId,'found-->',found);
    }
  return true;
}

async function userMessagesStatus(userId,status) {
  let unreadCount = [];
  if(userId!==undefined){
    let chatingData = await chat.find({$or:[{chatfromid:userId},{ chatwithid:userId}]});
    let index = 0;    let chatInfolist = [];let unreadCnt = 0;
      await Promise.all(chatingData.map(async (val)=>{       
        if(val.chats.length>0){
          // let chatRecord = await chat.findOne({_id:val._id,chats: { $elemMatch: { status: 'unread' }}});
          // if(chatRecord && chatRecord.chats.length>0){
          //   unreadCount = chatRecord.chats.filter((vals) => {      
          //     return vals.status == 'unread'
          //   }); 
          //   unreadCnt = unreadCount.length;console.log('unreadCntunreadCntunreadCnt---------',unreadCnt)
          // }           
          let unreadC =   await chat.aggregate([
            { "$match": {
                "_id" : val._id,
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
                                    "$eq": [ "$$el.status", "unread" ]
                                }
                            }
                        }
                    }
                }
            }}
          ]);
          if(unreadC.length>0){
            unreadCnt = unreadC[0].count;   
          }
        }
      let friendId = val.chatfromid;
      if(val.chatfromid==userId) {
        friendId = val.chatwithid;
      }
      if(friendId!=null) {
        let makeArray = {
            user_id: friendId,
            unread:unreadCnt,
          }
          chatInfolist.push(makeArray);
        }
    }))
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
