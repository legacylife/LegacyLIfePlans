var app = require('./index')
var debug = require('debug')('LLP:server')
const fs = require('fs')
const http = require('http')
const https = require('https')
var port = normalizePort(process.env.PORT || '8080')

 const server = http.createServer(app).listen(8080, () => {
   console.log('http server running at ' + 8080)
 })

 let socketIO = require('socket.io');
 let io = socketIO(server);

 io.on('connection', (socket) => {
  //console.log('user connected');
  socket.on('new-message', (message) => {
  //  console.log(`started on port: ${port}`);
  //    console.log(message);
    io.emit(message);
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
