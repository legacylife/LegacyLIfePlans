var express = require('express')
var router = express.Router()
const User = require('./../models/Users')
const trust = require('./../models/Trustee.js')
const HiredAdvisors = require('./../models/HiredAdvisors.js')
var constants = require('./../config/constants')
var jwt = require('express-jwt')
var Q = require('q')
const resFormat = require('./../helpers/responseFormat')
const { isEmpty } = require('lodash')
const resMessage  = require('./../helpers/responseMessages')

//let app = express();
//let http = require('http');
//let server = http.Server(app);

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

// let socketIO = require('socket.io');
// let io = socketIO(server);

// io.on('connection', (socket) => {
//   console.log('user connected');
// });
//function to update cms page content

function loginUser(req, res) {
  let { fields, query } = req.body;
  
  User.findOne(query, fields, function (err, userInfo) {
   let userPicture =  "assets/images/arkenea/default.jpg"
   if(userInfo.profilePicture!=null){
    let profilePicturePath = constants.s3Details.url + "/" + constants.s3Details.profilePicturesPath;
    userPicture = profilePicturePath+userInfo.profilePicture;
   }
   
   let user = [
      {
        id: userInfo._id,
        name: userInfo.firstName+' '+userInfo.lastName,
        avatar: userPicture,
        status: "online",
        chatInfo: []
        // chatInfo: [
        //   {
        //     chatId: "89564a680b3249760ea21fe77",
        //     contactId: "323sa680b3249760ea21rt47",
        //     contactName: "Laxman Gatade",
        //     unread: 4,
        //     lastChatTime: "2017-06-12T02:10:18.931Z"
        //   },
        //   {
        //     chatId: "3289564a680b2134760ea21fe7753",
        //     contactId: "14663a3406eb47ffa63d4fec9429cb71",
        //     contactName: "Jazz Diaz",
        //     unread: 0,
        //     lastChatTime: "2017-06-12T02:10:18.931Z"
        //   }
        // ]
      }
    ];

    res.send(user)
  });
}

async function contactList(req, res) {
  let { query, fields } = req.body;
  let AllusersData = await getAllTrustUsers(query._id);
  
  let trustList = AllusersData[0]['trustList'];
  let advisorList = AllusersData[1]['advisorList'];
  var contactlist = [];

  advisorList.forEach( ( val, index ) => {
    let info = val.advisorId;
    let userPicture = "assets/images/arkenea/default.jpg";
      if(info.profilePicture!=null){
         let profilePicturePath = constants.s3Details.url + "/" + constants.s3Details.profilePicturesPath;
         userPicture = profilePicturePath+info.profilePicture;
      }

      
      let makeArray = {
        id: info._id,
        name: info.firstName+' '+info.lastName,
        avatar: userPicture,
        status: "online",
        mood: ""
      }
      contactlist.push(makeArray);  
  })

  trustList.forEach( ( val, index ) => {
      let info = val.trustId;
      let userPicture = "assets/images/arkenea/default.jpg";

      if(info.profilePicture!=null){
         let profilePicturePath = constants.s3Details.url + "/" + constants.s3Details.profilePicturesPath;
         userPicture = profilePicturePath+info.profilePicture;
      }

      let makeArray = {
        id: info._id,
        name: info.firstName+' '+info.lastName,
        avatar: userPicture,
        status: "online",
        mood: ""
      }
      contactlist.push(makeArray);
  })
  
    console.log(" contactlist ",contactlist);
    res.send(contactlist) 
}

async function getAllTrustUsers(customerId) {
  let respArray = [];
  let findQuery = {customerId:ObjectId(customerId),status:'Active'};

  let trustList = await trust.find(findQuery, {_id:1,trustId:1}).populate('trustId');
  let advisorList = await HiredAdvisors.find(findQuery, {_id:1,advisorId:1}).populate('advisorId');
  
  respArray.push({trustList:trustList},{advisorList:advisorList});

  return respArray;
}

function chatCollection(req, res) {
  let { fields, query } = req.body;
  User.find(query, fields, function (err, userInfo) {

    let chatCollection = [
      {
        id: "89564a680b3249760ea21fe77",
        chats: [
          {
            contactId: "323sa680b3249760ea21rt47",
            text: "Do you ever find yourself falling into the “discount trap?”",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "7863a6802ez0e277a0f98534",
            text: "HI how are you?",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "323sa680b3249760ea21rt47",
            text: "Yes",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "7863a6802ez0e277a0f98534",
            text: "I am fine bro",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "323sa680b3249760ea21rt47",
            text: "Do you ever find yourself falling into the “discount trap?”",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "7863a6802ez0e277a0f98534",
            text: "Giving away your knowledge or product just to gain clients?",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "323sa680b3249760ea21rt47",
            text: "Yes",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "7863a6802ez0e277a0f98534",
            text: "Don’t feel bad. It happens to a lot of us",
            time: "2018-02-32T08:45:28.291Z"
          }
        ]
      },
      {
        id: "3289564a680b2134760ea21fe7753",
        chats: [
          {
            contactId: "14663a3406eb47ffa63d4fec9429cb71",
            text: "kay re kay karatoy?”",
            time: "2018-03-32T08:45:28.291Z"
          },
          {
            contactId: "7863a6802ez0e277a0f98534",
            text: "Kaam kar timepass nako?",
            time: "2018-03-32T08:45:28.291Z"
          },
          {
            contactId: "14663a3406eb47ffa63d4fec9429cb71",
            text: "Yes",
            time: "2018-03-32T08:45:28.291Z"
          },
          {
            contactId: "7863a6802ez0e277a0f98534",
            text: "Don’t feel bad. It happens to a lot of us",
            time: "2018-03-32T08:45:28.291Z"
          }
        ]
      }
    ];
    res.send(chatCollection)
  });


}

function saveMessage(req, res) {
  let { fields, query } = req.body;
  
  User.findOne(query, fields, function (err, userInfo) {
   let userPicture =  "assets/images/arkenea/default.jpg"
   if(userInfo.profilePicture!=null){
    let profilePicturePath = constants.s3Details.url + "/" + constants.s3Details.profilePicturesPath;
    userPicture = profilePicturePath+userInfo.profilePicture;
   }
   
   let user = [
      {
        id: userInfo._id,
        name: userInfo.firstName+' '+userInfo.lastName,
        avatar: userPicture,
        status: "online",
        chatInfo: []
        // chatInfo: [
        //   {
        //     chatId: "89564a680b3249760ea21fe77",
        //     contactId: "323sa680b3249760ea21rt47",
        //     contactName: "Laxman Gatade",
        //     unread: 4,
        //     lastChatTime: "2017-06-12T02:10:18.931Z"
        //   },
        //   {
        //     chatId: "3289564a680b2134760ea21fe7753",
        //     contactId: "14663a3406eb47ffa63d4fec9429cb71",
        //     contactName: "Jazz Diaz",
        //     unread: 0,
        //     lastChatTime: "2017-06-12T02:10:18.931Z"
        //   }
        // ]
      }
    ];

    res.send(user)
  });
}


router.post("/getContacts", contactList)
router.post("/getUser", loginUser)
router.post("/putMessage", saveMessage)
router.post("/getchatCollection", chatCollection)
module.exports = router
