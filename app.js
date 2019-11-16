var app = require('./index')
var debug = require('debug')('LLP:server')
const fs = require('fs')
const http = require('http')
const https = require('https')
var port = normalizePort(process.env.PORT || '80')
var express = require('express')
var router = express.Router()
const apps = express()
 const server = http.createServer(app).listen(80, () => {
   console.log('http server running at ' + 80)
 })
 var chats = require('./routes/chatcontrollerRoute')
 
 let socketIO = require('socket.io');
 let io = socketIO(server);

 var users = {};
 io.on('connection', (socket) => {
   //console.log('user connected...');  
   // var clients = io.sockets.clients();
   // var clients = io.sockets.clients('new-message'); 
   socket.on('loginforonline', function(data){
     //saving userId to array with socket ID
     users[socket.id] = data.userId;
    // console.log('a user ' + data.userId +'---' + data.userType + ' connected');
     chats.userStatus(data,'online');
     var unreadCnt = chats.userMessagesStatus(data.userId,'online');
     console.log(`loginforonline message-unread-count`);
     io.emit('message-unread-count-'+data.userId, unreadCnt);
  });

  socket.on('offline', function(data){
    console.log('offline zala re--',data.userId);
    io.emit('offlineContact'+data.userId,data.userId);
    chats.userStatus({userId:data.userId},'offline');
 });
  
  socket.on('new-message', async (message) => {
    // console.log(`started on port: ${port}`);
    console.log('new-message-'+message.chatwithid, message);
    io.emit('new-message-'+message.chatwithid, message);
    var unreadCnt = await chats.userMessagesStatus(message.chatwithid,'online');
    console.log('unreadCnt await ************************',unreadCnt)
    // io.emit('message-unread-count-'+message.chatwithid, unreadCnt);
    // var userUnreadCnt = [{ user_id: "5d36932ce485cd5cd96bdaf0", unreadCnt: Math.floor((Math.random() * 10) + 1) },
    //                      { user_id: "5cc9cb111955852c18c5b737", unreadCnt: Math.floor((Math.random() * 10) + 1) },
    //                      { user_id: "5d369411e485cd5cd96bdaf6", unreadCnt: Math.floor((Math.random() * 10) + 1) } ]
    //io.emit('message-unread-count-'+message.chatwithid, userUnreadCnt);
    io.emit('message-unread-count-'+message.chatwithid, unreadCnt);
    
  });

  socket.on('message-unread-count', async (data) => {
  console.log(`message-unread-count`);
      var unreadCnt = await chats.userMessagesStatus(data.userId,'online');
    //  io.emit('message-unread-count-'+data.userId, unreadCnt);
    // var userUnreadCnt = [{ user_id: "5d36932ce485cd5cd96bdaf0", unreadCnt: Math.floor((Math.random() * 10) + 1) },
    //                      { user_id: "5cc9cb111955852c18c5b737", unreadCnt: Math.floor((Math.random() * 10) + 1) },
    //                      { user_id: "5d369411e485cd5cd96bdaf6", unreadCnt: Math.floor((Math.random() * 10) + 1) } ]
    io.emit('message-unread-count-'+data.userId, unreadCnt);
  });

  socket.on('get-chat-room', (chatId,userId) => {
    console.log('======get-chat-room==',chatId,userId)
     chats.chatRoom(chatId,userId);
   // io.emit('get-chat-rrom'+contactId);
  });
 
  
  socket.on('disconnect', function(){
    if(users[socket.id]!=='undefined'){
      console.log('user ' + users[socket.id] + ' disconnected');
      io.emit('offlineContact', users[socket.id]);
      chats.userStatus({userId:users[socket.id]},'offline');
    }else{
      console.log('user ' + users[socket.id] + ' disconnected here');
    }
  });

});


function normalizePort(val) {
  var port = parseInt(val, 10)

  if (isNaN(port)) {
    return val
  }
  if (port >= 0) {
    return port
  }
  return false
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

// Event listener for HTTP server "listening" event.
function onListening() {

  var addr = server.address()
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
  console.log("server started on port" + addr.port)
}