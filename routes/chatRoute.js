var express = require('express')
var router = express.Router()
const User = require('./../models/Users')
const trust = require('./../models/Trustee.js')
const HiredAdvisors = require('./../models/HiredAdvisors.js')
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
let socketIO = require('socket.io');
let io = socketIO(server);

function loginUser(req, res) {
  let { fields, query } = req.body;
  
  User.findOne(query, fields, async function (err, userInfo) {
   let userPicture =  "assets/images/arkenea/default.jpg"
   if(userInfo.profilePicture!=null){
    let profilePicturePath = constants.s3Details.url + "/" + constants.s3Details.profilePicturesPath;
    userPicture = profilePicturePath+userInfo.profilePicture;
   }
    //{ $or: [ {chatfromid:ObjectId("5d369411e485cd5cd96bdaf6")}, { chatwithid:ObjectId("5d369411e485cd5cd96bdaf6")}] }
    //let chatingData = await chat.find({chatfromid:query._id},{}).populate('chatwithid');

   let chatingData = await chat.find({$or:[{chatfromid:query._id},{ chatwithid:query._id}]}).populate('chatfromid').populate('chatwithid');
   let chatInfolist = [];
   
   chatingData.forEach( ( val, index ) => {
    let info = val.chatwithid;
    if(query._id==val.chatwithid._id) {
      info = val.chatfromid;
    }
    let userPicture = "assets/images/arkenea/default.jpg";

    if(info.profilePicture!=null){
       let profilePicturePath = constants.s3Details.url + "/" + constants.s3Details.profilePicturesPath;
       userPicture = profilePicturePath+info.profilePicture;
    }

    let makeArray = {
      _id: val._id,
      contactId:info._id,
      contactName: info.firstName+' '+info.lastName,
      avatar: userPicture,
      unread: 6,      
      status: info.loginStatus,
      lastChatTime: val.modifiedOn,
    }
   // console.log('makeArray',makeArray)
    chatInfolist.push(makeArray);
   })

   let user = [
      {
        _id: userInfo._id,
        name: userInfo.firstName+' '+userInfo.lastName,
        avatar: userPicture,
        status: userInfo.loginStatus,
        chatInfo: chatInfolist
      }
    ];

    res.send(user)
  });
}

async function contactList(req, res) {
  let { query, fields } = req.body;
  let advisorList = ''; var contactlist = [];

  if(query.userType=='advisor'){
     advisorList = await HiredAdvisors.find({advisorId:query._id,status: {$nin: ["Rejected", "Deleted"]}}).populate('customerId');
     advisorList.forEach( ( val, index ) => {
       let info = val.customerId;
       let userPicture = "assets/images/arkenea/default.jpg";
         if(info.profilePicture!=null){
           let profilePicturePath = constants.s3Details.url + "/" + constants.s3Details.profilePicturesPath;
           userPicture = profilePicturePath+info.profilePicture;
         }
         
         let makeArray = {
           _id: info._id,
           name: info.firstName+' '+info.lastName,
           avatar: userPicture,
           status: info.loginStatus,
           mood: ""
         }
         contactlist.push(makeArray);  
     })
  }else{
      let advisorList = await HiredAdvisors.find({customerId:ObjectId(query._id),status:'Active'}, {_id:1,advisorId:1}).populate('advisorId');
      advisorList.forEach( ( val, index ) => {
        let info = val.advisorId;
        let userPicture = "assets/images/arkenea/default.jpg";
          if(info.profilePicture!=null){
            let profilePicturePath = constants.s3Details.url + "/" + constants.s3Details.profilePicturesPath;
            userPicture = profilePicturePath+info.profilePicture;
          }

          let makeArray = {
            _id: info._id,
            name: info.firstName+' '+info.lastName,
            avatar: userPicture,
            status: info.loginStatus,
            mood: ""
          }
          contactlist.push(makeArray);  
      })
  }
    //console.log(" contactlist ",contactlist);
    res.send(contactlist) 
}

async function chatCollection(req, res) {
  let { query, chatCreate } = req.body;
  let chatCollection = [];
  //if(query.userType=='advisor'){

  let chating = await chat.find({$or:[{chatfromid:query._id},{ chatwithid:query._id}]},{}).populate('chatfromid').populate('chatwithid');

  if(chatCreate=='create') {
    var chatInsert = new chat();     
    chatInsert.chatfromid = query._id;
    chatInsert.chatwithid = query.contactId;
    chatInsert.status = 'Active';
    chatInsert.createdOn = new Date();
    chatInsert.modifiedOn = new Date();
    chating = await chatInsert.save();
    let chatingdata = await chat.findOne({_id:chating._id},{}).populate('chatwithid');

    let info = chatingdata.chatwithid;
    let userPicture = "assets/images/arkenea/default.jpg";

    if(info.profilePicture!=null){
       let profilePicturePath = constants.s3Details.url + "/" + constants.s3Details.profilePicturesPath;
       userPicture = profilePicturePath+info.profilePicture;
    }

    chatCollection = {
      _id: chating._id,
      chatwithid: info._id,
      name: info.firstName+' '+info.lastName,
      avatar: userPicture,
      unread:3,
      lastChatTime: chating.time,
      status: info.loginStatus,
      mood: ""
    }
   // console.log('Populate >>>>>>>>>>>>>>>>',chatCollection);
  } else {
  //  chating = await chat.updateOne({_id:chating._id},{modifiedOn:new Date()});
    chatCollection = chating;
  }    

  //console.log('chatCollection',chatCollection)
  res.send(chatCollection);
}

async function saveMessage(req, res) {
  let { query, message } = req.body;
  let chating = await chat.findOne({_id:query._id},{_id:1,chats:1});
  if (chating!=null) { 
    io.on('connection', (socket) => {
      socket.on('new-message', (message) => {
        console.log("app js message",message);
      });
   }); 
    await chat.updateOne({_id:query._id},{$push:{chats:message}});
     chating = await chat.findOne({_id:query._id},{_id:1,chats:1});
  }

  res.send(chating);
}


router.post("/getContacts", contactList)
router.post("/getUser", loginUser)
router.post("/putMessage", saveMessage)
router.post("/getchatCollection", chatCollection)
module.exports = router
