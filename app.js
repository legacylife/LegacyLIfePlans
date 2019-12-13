var app = require('./index')
var debug = require('debug')('LLP:server')
const fs = require('fs')
const http = require('http')
const https = require('https')
var port = normalizePort(process.env.PORT || '443')
var express = require('express')
var router = express.Router()
const apps = express()


/**
 * 443 https port & redirection of http to https
 */
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
app.set('port', (process.env.PORT || 443));

// start server
var options = {
	key: fs.readFileSync('../llp-privatekey.pem'),
  cert: fs.readFileSync('../llp-server.crt'),
};
var server = https.createServer(options, app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var chats = require('./routes/chatcontrollerRoute')

let socketIO = require('socket.io');
let io = socketIO(server);

var users = {};
io.on('connection', (socket) => {
  socket.on('loginforonline', function (data) {
    //saving userId to array with socket ID
    users[socket.id] = data.userId;
    chats.userStatus(data, 'online');
    io.emit('online-status', data.userId, 'online');
    //8 var unreadCnt = chats.userMessagesStatus(data.userId,'online');
    //8 console.log(`loginforonline message-unread-count`);
    //8  io.emit('message-unread-count-'+data.userId, unreadCnt);
  });

  socket.on('offline', function (data) {
    io.emit('offlineContact' + data.userId, data.userId);
    chats.userStatus({ userId: data.userId }, 'offline');
    io.emit('online-status', data.userId, 'offline');
  });

  socket.on('typing-with', async (withId) => {
    io.emit('typing-with-' + withId.chatwithid, withId.contactId);
    //withId.contactId
  });

  socket.on('new-message', async (message, chatid) => {
    io.emit('new-message-' + message.chatwithid, message, chatid);
    var unreadCnt = await chats.userMessagesStatus(message.chatwithid, 'online');
    io.emit('message-unread-count-' + message.chatwithid, unreadCnt);
  });

  socket.on('message-unread-count', async (data) => { // functions call when page reload from customizer.ts
    var unreadCnt = await chats.userMessagesStatus(data.userId, 'online');
    io.emit('message-unread-count-' + data.userId, unreadCnt);
  });

  socket.on('get-chat-room', (chatId, userId) => {
    chats.chatRoom(chatId, userId);
  });

  socket.on('get-chat-room-again', (chatId, userId) => {
    chats.chatRoom(chatId, userId);
  });
  socket.on('disconnect', function () {
    if (users[socket.id] !== undefined) {
      io.emit('offlineContact', users[socket.id]);
      chats.userStatus({ userId: users[socket.id] }, 'offline');
      io.emit('online-status', users[socket.id], 'offline');
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



// Redirect from http port 80 to https
//var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80); 