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

let http = require('http');
let server = http.Server(express);
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

async function userStatus(data,status) {
    if(data.userId!='undefined'){
      let found = await User.findOne({_id:data.userId},{_id:1});
      if(found){
         await User.updateOne({_id:found._id},{loginStatus:status});
         console.log('Chat online --- '+data.userId,'status-->',status);
      }
    }
    return true;
}

async function chatRoom(chatId) {
    let found = await chat.findOne({_id:chatId});
    if(found){
        //  await chat.updateMany({_id:found._id},{$set: proquery })
        let proquery = {chats:{status:"Active"}};
      //  db.chats.update({  'chats.status': 'read' }, { $set: { 'chats.$.status': 'unread' } })
        await chat.updateOne({_id:found._id,'chats.status': 'read'},{$set : {'chats.$.status': 'read'}});
       console.log('Chat ID --- '+chatId,'found-->',found);
    }
  return true;
}

async function userMessagesStatus(data,status) {
  if(data.userId!=='undefined'){
      let unreadCount = await chat.count({$or:[{chatfromid:data.userId},{ chatwithid:data.userId}],"chats.status":'unread'});
      return unreadCount;
  }
return 0;
}

module.exports = { "userStatus": userStatus,"chatRoom":chatRoom,"userMessagesStatus":userMessagesStatus }
