/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var User = require('../api/user/user.model');
var Userclass = require('../api/userclass/userclass.model');

var liveClassList = [];
// var userSockets = [];
var onlineUsers = [];

// When the user disconnects.. perform this
function onDisconnect(socket) {
  if(onlineUsers[socket.decoded_token._id] !== undefined && onlineUsers[socket.decoded_token._id].id === socket.id){
    console.log("User Left Live Class");

    var userID = socket.decoded_token._id;
    var userClassID = onlineUsers[userID].classID;
    var liveClassUserIndex = liveClassList[userClassID].connectedUser.indexOf(userID);
    
    if(liveClassList[userClassID] !== undefined){
      for(var i = 0; i < liveClassList[userClassID].connectedUser.length; i++){
        if(liveClassList[userClassID].connectedUser[i] !== userID){
          onlineUsers[liveClassList[userClassID].connectedUser[i]].emit('userLeftClass', {});
        }
      }
    }
    
    delete onlineUsers[userID];
    delete liveClassList[userClassID].connectedUser.splice(liveClassUserIndex, 1);
  }
}

// When the user connects.. perform this
function onConnect(socket) {
  // When the client emits 'info', this listens and executes
  socket.on('info', function (data) {
    console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
  });

  // Insert sockets below
  require('../api/language/language.socket').register(socket);
  require('../api/countries/countries.socket').register(socket);
  require('../api/transactionhistory/transactionhistory.socket').register(socket);
  require('../api/wallet/wallet.socket').register(socket);
  require('../api/transaction/transaction.socket').register(socket);
  require('../api/search/search.socket').register(socket);
  require('../api/degree/degree.socket').register(socket);
  require('../api/school/school.socket').register(socket);
  require('../api/notification/notification.socket').register(socket);
  require('../api/userclass/userclass.socket').register(socket);
  // require('../api/class/class.socket').register(socket);
  require('../api/video/video.socket').register(socket);
  require('../api/topic/topic.socket').register(socket);
  require('../api/thing/thing.socket').register(socket);

  socket.on('joinClass', function(data,  callback){
    var output = {
          success : false
        },
        classID = data.classID,
        peerID = data.peerID,
        userID = socket.decoded_token._id;

    if(onlineUsers[userID] === undefined){
      Userclass.findById(classID, function (err, userclass) {
        //if(err || !userclass) { 
        if(false) { 
          output.success = false;
          output.error = {
            type: 'invalid_class',
            description: "This class doesnot exists"
          };
        }else{
          onlineUsers[userID] = socket;
          onlineUsers[userID].classID = classID;
          onlineUsers[userID].peerID = peerID;
          if(liveClassList[classID] === undefined){
            liveClassList[classID] = {
              classDetails: null,
              connectedUser: [userID]
            }
          }else{
            liveClassList[classID].connectedUser.push(userID);
          }
          output.success = true
        }
        callback(output);
        startLiveClass(classID);
      });
    }else{
      // onlineUsers[userID].emit('alreadyLoggedIn', {});
      output.success = false;
      output.error = {
        type: 'alreaday_logged_in',
        description: "You are already logged in from a different browser or tab"
      };
      callback(output);
    }
  })
  
}

function startLiveClass(classID){
  if(liveClassList[classID] !== undefined){
    if(liveClassList[classID].connectedUser.length === 2){
      console.log("Requesting start class");
      for(var i = 0; i < liveClassList[classID].connectedUser.length; i++){
        onlineUsers[liveClassList[classID].connectedUser[i]].emit('startClass', {
          'caller'    : {
            userID: liveClassList[classID].connectedUser[0],
            peerID: onlineUsers[liveClassList[classID].connectedUser[0]].peerID
          },
          'receiver'  : {
            userID: liveClassList[classID].connectedUser[1],
            peerID: onlineUsers[liveClassList[classID].connectedUser[1]].peerID
          }
        });
      }
    }
  }
}

module.exports = function (socketio) {
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.handshake.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  socketio.use(require('socketio-jwt').authorize({
    secret: config.secrets.session,
    handshake: true
  }));

  socketio.on('connection', function (socket) {
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

    socket.connectedAt = new Date();

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      console.info('[%s] DISCONNECTED', socket.handshake.address);
    });

    // Call onConnect.
    onConnect(socket);
    console.info('[%s] CONNECTED', socket.handshake.address);
  });
};