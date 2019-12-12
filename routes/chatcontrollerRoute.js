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
const mongoose = require('mongoose');
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
 // console.log('******************************************chatRoom --- '+userId,'-----*****************--',chatId);
    let chatingData = await chat.findOne({_id:chatId});
    if(chatingData) { //await chat.updateMany({_id:found._id},{$set: proquery })
       // await chat.update({_id:found._id,chats: { $elemMatch: { contactId: { '$ne': userId }, status: 'unread' }}},{$set : {'chats.$[].status': 'read'}}, {safe: true, multi:true});
       let friendId = chatingData.chatfromid;
       if(chatingData.chatfromid==userId){
         friendId = chatingData.chatwithid;
       }
       await chat.updateOne({_id:chatingData._id,chats: { $elemMatch: { status: 'unread' }}},{$set : {'chats.$[i].status': 'read'}},{arrayFilters: [{"i.contactId": friendId}],safe: true, multi:true})
       //chatingData.chats.forEach( async ( val, index ) => {
       // console.log('-------------',userId,'*************',val.contactId);
         // if(userId!=val.contactId) {
         //   console.log('ID------------------',val._id);
         //   await chat.updateOne({_id:chatingData._id,'chats.status': 'unread'},{$set : {'chats.$.status': 'read'}});
          //}
        // })
    }
  return true;
}

async function userMessagesStatus(userId,status,from='') {
  let unreadCount = [];
  if(userId!==undefined){
    let makeArray = [];
  //console.log('from pk ><>>>>>>>>>>>>>>>>>>>>>>>',from)
   let chatingData = await chat.find({$or:[{chatfromid:userId},{ chatwithid:userId}]});
   let chatInfolist = []; let unreadCnt = 0;
      await Promise.all(chatingData.map(async (val)=>{     
    //async.each(chatingData, async function (val){ 
        let friendId = val.chatfromid;
        if(val.chatfromid==userId){
          friendId = val.chatwithid;
        }
        if(val.chats.length>0){     
/*
      chats.aggregate([ { '$match': { _id: ObjectId('5dd6308a3eb03b0c781eab10'), 'chats.status': 'unread' } }, 
      { '$group': { _id: null, count: { '$sum': { '$size': { '$filter': { input: '$chats', as: 'el',
       cond: { '$and': [ { '$eq': [ '$$el.status', 'unread' ] }, { '$eq': [ '$$el.contactId', '5cc9cc301955852c18c5b73a' ] } ] } } } } } } } ], {})
       */

          friendId = friendId.toString();
          valid = val._id.toString();
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
                                // "cond": [ { "$and" : [{
                                //     "$eq": [ "$$el.contactId",friendId],
                                //     '$eq': [ "$$el.status", "unread" ]
                                // }]
                                "cond":{$and:[
                                  {'$eq': [ "$$el.status", "unread" ]},
                                  {"$eq": [ "$$el.contactId",friendId ]}
                                ]}
                            }
                        }
                    }
                }
            }}
          ]);
        //  console.log('------',typeof(val._id),'----',unreadC.length,'>>>>>>>>>>>>>>>>>>>>>',from);
          if(unreadC.length>0){
            //console.log(typeof(val._id),'----',unreadC[0].count,'-----_id-->>',val._id,'--------userId>>>>-----',userId,'---friendId>>>>-----',friendId)
            unreadCnt = unreadC[0].count;   
          }else if(userId!=friendId && from=='NewMessage'){
            unreadCnt = 1;   
          }        
        }
      
      //if(friendId!=null) {
         makeArray = {
            user_id: friendId,
            unread:unreadCnt,
          }     
          chatInfolist.push(makeArray);
          //console.log('makeArray aaaa   ',makeArray,'-------',val._id,'-------------',userId,'--------',friendId,'>>>>>>>>>>>>>>>>>>>>>',from)
        //}
    }))
    //console.log('****************userMessagesStatus ---- unreadCount array--- '+chatInfolist);
    return chatInfolist;
  }
 // return chatInfolist;
}

module.exports = { "userStatus": userStatus,"chatRoom":chatRoom,"userMessagesStatus":userMessagesStatus }
