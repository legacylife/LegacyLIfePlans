var app = require('./index')
var debug = require('debug')('LLP:server')
const fs = require('fs')
const http = require('http')
const https = require('https')
var port = normalizePort(process.env.PORT || '8080')
var express = require('express')
var router = express.Router()
const apps = express()
 const server = http.createServer(app).listen(8080, () => {
   console.log('http server running at ' + 8080)
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
     var unreadCnt = chats.userMessagesStatus(data,'online');
     io.emit('message-unread-count-'+data.userId, unreadCnt);
  });
  
  socket.on('new-message', (message) => {
    // console.log(`started on port: ${port}`);
     //console.log('new-message-'+message.chatwithid, message);
    io.emit('new-message-'+message.chatwithid, message);
  });

  socket.on('message-unread-count', (data) => {
  console.log(`message-unread-count`);
  var unreadCnt = chats.userMessagesStatus(data,'online');
     io.emit('message-unread-count-'+data.userId, unreadCnt);
  });

  socket.on('get-chat-rrom', (chatId,userId) => {
     chats.chatRoom(chatId);
   // io.emit('get-chat-rrom'+contactId);
  });
 
  
  socket.on('disconnect', function(){
    if(users[socket.id]!=='undefined'){
      console.log('user ' + users[socket.id] + ' disconnected');
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