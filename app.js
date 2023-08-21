var app = require('./index')
var debug = require('debug')('LLP:server')
const fs = require('fs')
const http = require('http')
const https = require('https')
var port = normalizePort(process.env.PORT || '80') 
var express = require('express')
var router = express.Router()
var chats = require('./routes/chatcontrollerRoute')
const server = http.createServer(app).listen(port, () => {
  console.log('*******http server running at port******' + port)
})
//  var server = server.listen(port, function(){
//   console.log('*******http server running at port: ' + port)
//  });
 
 let socketIO = require('socket.io');
 let io = socketIO(server);

 var users = {};
 //console.log('Socket Clients Count >>>>>>>>>>>>>',io.engine.clientsCount)
 io.on('connection', (socket) => {
   // var clients = io.sockets.clients();
   // var clients = io.sockets.clients('new-message'); 
  socket.on('loginforonline', function(data){
    //console.log(`Socket ${socket.id} connected.`,'Socket Clients connection Count >>>>>>>>>>>>>',io.engine.clientsCount);
     //saving userId to array with socket ID
     users[socket.id] = data.userId;
     // console.log('a user ' + data.userId +'---' + data.userType + ' connected');
     chats.userStatus(data,'online');
     io.emit('online-status',data.userId,'online');
     //8 var unreadCnt = chats.userMessagesStatus(data.userId,'online');
     //8 console.log(`loginforonline message-unread-count`);
     //8  io.emit('message-unread-count-'+data.userId, unreadCnt);
  });

  socket.on('offline', function(data){
    console.log(`Socket ${socket.id} connected.`,'Socket Clients offline connection Count >>>>>>>>>>>>>',io.engine.clientsCount);
    io.emit('offlineContact'+data.userId,data.userId);
    chats.userStatus({userId:data.userId},'offline');
    io.emit('online-status',data.userId,'offline');
  });
 
  socket.on('typing-with', async (withId) => {  
    io.emit('typing-with-'+withId.chatwithid,withId.contactId);
    //withId.contactId
  });

  socket.on('new-message', async (message,chatid) => {    
    console.log(`Socket ${socket.id} connected.`,'Socket Clients new-message connection Count >>>>>>>>>>>>>',io.engine.clientsCount);
     io.emit('new-message-'+message.chatwithid, message,chatid);
    //8 chats.chatRoom(chatid,message.chatwithid);
     var unreadCnt = await chats.userMessagesStatus(message.chatwithid,'online','NewMessage');  
     io.emit('message-unread-count-'+message.chatwithid, unreadCnt);    
  });

  socket.on('message-unread-count', async (data) => { // functions call when page reload from customizer.ts
     var unreadCnt = await chats.userMessagesStatus(data.userId,'online');
    io.emit('message-unread-count-'+data.userId, unreadCnt);
  });

  socket.on('get-chat-room', (chatId,userId) => {
    console.log(`Socket ${socket.id} connected.`,'Socket Clients get-chat-room connection Count >>>>>>>>>>>>>',io.engine.clientsCount);
     chats.chatRoom(chatId,userId);
   // io.emit('get-chat-room'+contactId);
  });
   
  socket.on('get-chat-room-again', (chatId,userId) => {
    console.log(`Socket ${socket.id} connected.`,'Socket Clients get-chat-room-again connection Count >>>>>>>>>>>>>',io.engine.clientsCount);
    //console.log('NEW message -----',chatId,'userId>>>>>>>',userId)
    chats.chatRoom(chatId,userId);
  // io.emit('get-chat-room'+contactId);
 });  
  socket.on('disconnect', function(){
    if(users[socket.id]!==undefined){
      console.log(`Socket ${socket.id} disconnect.`,'Socket Clients disconnect connection Count >>>>>>>>>>>>>',io.engine.clientsCount);
      io.emit('offlineContact', users[socket.id]);
      chats.userStatus({userId:users[socket.id]},'offline');
      io.emit('online-status',users[socket.id],'offline');
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
  //console.log("server started on port" + addr.port)
}
