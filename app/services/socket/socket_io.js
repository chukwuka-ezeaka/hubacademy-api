const request = require('request');
const https = require("https");
const admin = require('firebase-admin');
const User = require('../../models/models.user');



var sockets = {};
var users = {};
var rooms = {};


const updateStatus = async (id, status) => {
    await User.update(
        {
            online:status
        },{
            where:{
                id:id
            }
        }
    )
 }


 async function  call_user(id,caller) {
    let user = null
    await request.get({
       url:     baseUrl+'/api/server/get_user/'+id,
       headers: {
          'content-type' : 'application/json',
          'Authorization': token
        },
     }, function(error, response, body){
       if (error) { return console.log("error"); }
       if( JSON.parse(body).status == 200){
          user = JSON.parse(body).result
          console.log(caller)
          var notificationKey = JSON.parse(body).result.notification_key;
 
          // See the "Defining the message payload" section below for details
          // on how to define a message payload.
          var payload = {
             'data': {
                'caller': JSON.stringify(caller),
                'type':'voice_call',
             },
          };
       
          var options = { 
             'priority': "high",
           };
      
           admin.messaging().sendToDevice(notificationKey, payload,options)
           .then(function(response) {
              console.log('Successfully sent message:', response);
           })
           .catch(function(error) {
              console.log('Error sending message:', error);
           });
       }
     });
 }
 
 async function  message_user(data) {
    await request.get({
       url:     baseUrl+'/api/server/get_user/'+data.to,
       headers: {
          'content-type' : 'application/json',
          'Authorization': token
        },
     }, function(error, response, body){
       if (error) { return console.log("error"); }
       if( JSON.parse(body).status == 200){
            var notificationKey = JSON.parse(body).result.notification_key;
            if(!notificationKey){
                console.log('notificationKey not defined')
                return;
            }
          // See the "Defining the message payload" section below for details
          // on how to define a message payload.
          var payload = {
             'data': {
                'data': JSON.stringify({
                   id:data.id
                }),
                'type':'message',
             },
          };
       
          var options = { 
             'priority': "high",
            //  'timeToLive': 60 * 60 *24
           };
        //    await admin.messaging().sendMulticast(message);
           admin.messaging().sendToDevice(notificationKey, payload,options)
           .then(function(response) {
              console.log('Successfully sent message:', response);
           })
           .catch(function(error) {
              console.log('Error sending message:', error);
           });
       }
     });
 }
 
 function service_request(data){
    var notificationKey = data.notification_key;
 
    // See the "Defining the message payload" section below for details
    // on how to define a message payload.
    var payload = {
       'data': {
          'realname': data.realname,
          'note': data.note,
          'type':'service_request',
          'title': "Service request"
       },
    };
 
    var options = {
       'priority': "high",
     };
 
    // Send a message to the device group corresponding to the provided
    // notification key.
    admin.messaging().sendToDevice(notificationKey, payload,options)
    .then(function(response) {
       // See the MessagingDeviceGroupResponse reference documentation for
       // the contents of response.
       console.log('Successfully sent message:', response);
    })
    .catch(function(error) {
       console.log('Error sending message:', error);
    });
 }
 
 function service_request_update(data){
    var notificationKey = data.notification_key;
 
    // See the "Defining the message payload" section below for details
    // on how to define a message payload.
    var payload = {
       'data': {
          'realname': data.realname,
          'note': data.note,
          'type':'service_request',
          'title': "Service request"
       },
    };
 
    var options = {
       priority: "high",
     };
 
    // Send a message to the device group corresponding to the provided
    // notification key.
    admin.messaging().sendToDevice(notificationKey, payload,options)
    .then(function(response) {
       // See the MessagingDeviceGroupResponse reference documentation for
       // the contents of response.
       console.log('Service request update', response);
    })
    .catch(function(error) {
       console.log('Error sending message:', error);
    });
 }



function sendTo(connection, message) {
    connection.send(message);
 }

const socket_io = (io) => {

    io.on('connection', function(socket){
        console.log("user connected");
        
       
        socket.on('disconnect', function () {
          console.log("user disconnected "+socket.name);
          if(rooms[socket.room]){
               if(rooms[socket.room].users[socket.name]){
                  socket.broadcast.to(socket.room).emit('comfrence',{ type: "leave", username: socket.name})
                  delete rooms[socket.room].users[socket.name];
                  delete rooms[socket.room].sockets[socket.name];
               }
            }
          io.in(socket.name).clients((err, clients) => {
             if(clients.length < 1){
               updateStatus(socket.name, 0)
             }
          });
      
        })
      
      
      
         socket.on('comfrence', function (message) {
            var data = message;
         
            switch (data.type) {
               case "join_room":
                  console.log("User joined room", data.room, data.name);
      
                  if(rooms[data.room]){ 
                     if(rooms[data.room].sockets[data.name]){
                        socket.emit("comfrence", {
                           type: "join",
                           success: false,
                        })
                     }else{
                        var templist = rooms[data.room].users;
                        rooms[data.room].sockets[data.name] = socket;
                        socket.name = data.name;
                        socket.room = data.room;
      
                        socket.emit("comfrence", {
                           type: "join",
                           success: true,
                           username: data.name,
                           userlist: templist
                        })
      
                        socket.broadcast.to(data.room).emit('comfrence',{ type: "new_join", username: data.name})
      
                        socket.join(data.room);
                        socket.room = data.room;
                        rooms[data.room].users[data.name] = socket.id;
                     }
                  }else{
                     rooms[data.room] = {};
                     rooms[data.room]["users"] = {};
                     rooms[data.room]["sockets"] = {};
                     rooms[data.room]["sockets"][data.name] = socket;
                     socket.name = data.name;
                     socket.room = data.room;
                     socket.emit("comfrence", {
                        type: "join", 
                        success: true,
                        username: data.name,
                        userlist: {}
                     })
      
                     socket.broadcast.to(data.room).emit('comfrence',{ type: "new_join", username: data.name})
                     socket.join(data.room);
                     socket.room = data.room;
                     rooms[data.room]["users"][data.name] = socket.id;
      
                  }
               break;
               case "candidate": 
                  console.log("Sending candidate to:",data.to); 
                  var conn =  rooms[data.room].sockets[data.to];
                  
                  if(conn != null) { 
                     conn.emit("comfrence", { 
                        type: "candidate", 
                        candidate: data.candidate,
                        from: data.from
                     }); 
                  } 
               break;
               case "offer": 
                  //for ex. UserA wants to call UserB 
                  console.log("Sending offer to: ", data.to);
                  
                  //if UserB exists then send him offer details 
                  var conn =  rooms[data.room].sockets[data.to];
                  
                  if(conn != null) {                
                     conn.emit("comfrence", { 
                        type: "offer", 
                        offer: data.offer, 
                        from: data.from 
                     }); 
                  }
               break;
               case "answer": 
                  console.log("Sending answer to: ", data.to); 
                  //for ex. UserB answers UserA 
                  var conn = rooms[data.room].sockets[data.to];
                  
                  if(conn != null) { 
                     conn.emit("comfrence", { 
                        type: "answer", 
                        answer: data.answer,
                        from: data.from 
                     }); 
                  } 
               break;
               case "leave": 
                  if(rooms[data.room]){
                     if(rooms[data.room].users[data.name]){
                        socket.broadcast.to(data.room).emit('comfrence',{ type: "leave", username: data.name})
                        delete rooms[data.room].users[data.name];
                        delete rooms[data.room].sockets[data.name];
                     }
                  }
               break;
               default:
               break;
            }
         })
       
        socket.on('message', function(message){
       
          var data = message;
       
          switch (data.type) {
       
          case "login":
            console.log("User logged", data.id);
            socket.join(data.id);
            updateStatus(data.id, 1)
            socket.name = data.id;
            break;
            case "service_request":
               console.log("service_request", data);
               service_request(data)
            break;
            case "service_request_update":
               console.log("service_request_accept", data);
               service_request_update(data)
            break;
            case "sendMessage":
               console.log("sendMessage", data);
               message_user(data.data)
               socket.broadcast.to(data.receiver_id).emit(data.data.from+'chat',{ type: "message", data: data.data})
               socket.broadcast.to(data.receiver_id).emit(data.receiver_id+'messages',{ type: "message", data: data.data})
            break;
            case "messageSeen":
               console.log("messageSeen", data);
               socket.broadcast.to(data.receiver_id).emit(data.data.from+'chat',{ type: "messageSeen", data: data.data})
            break;
            case "keypress":
               console.log("keypress", data);
               socket.broadcast.to(data.receiver_id).emit(data.from+'chat',{ type: "keypress"})
            break;
            case "groupMessage":
               console.log("groupMessage", data);
               io.emit(data.groupid+'group',{ type: "message", data: data.data})
            break;
            case "call_user":
               console.log("call_user", data);
               call_user(data.recipient.id,data.caller)
               socket.broadcast.to(data.recipient.id).emit('voice_call',{ 
                  type: "connecting",
                  data: data
               })
            break;
            case "ringing":
               console.log("ringing", data);
               socket.broadcast.to(data.data.caller.id).emit('voice_call_init',{ 
                  type: "ringing",
                  data: data
               })
            break;
            case "call_accepted":
            sendTo(sockets[data.callername], {
               type: "call_response",
               response: "accepted",
               responsefrom : data.from
       
            });
            break;
            case "call_rejected":
            sendTo(sockets[data.callername], {
               type: "call_response",
               response: "rejected",
               responsefrom : data.from
            });
            break;
      
            case "candidate": 
               console.log("Sending candidate to:",data); 
               socket.broadcast.to(data.id).emit('voice_call',{ 
                  type: "candidate",
                  candidate: data.candidate
               })
            break;
      
            case "offer": 
               //for ex. UserA wants to call UserB 
               console.log("Sending offer to: ", data.id);
               socket.broadcast.to(data.id).emit('voice_call',{ 
                  type: "offer",
                  offer: data.offer, 
               })
            break;
      
            case "answerOffer": 
               console.log("Sending answer to: ", data.id); 
               socket.broadcast.to(data.id).emit('voice_call',{ 
                  type: "answerOffer",
                  answer: data.answer 
               })
            break;
      
            case "leave": 
               console.log("Disconnecting from", data.id); 
               socket.broadcast.to(data.id).emit('voice_call',{ 
                  type: "leave",
               })
            break;
            case "user_busy":
               console.log("user_busy", data);
               socket.broadcast.to(data.data.caller.id).emit('voice_call_init',{ 
                  type: "user_busy",
               })
            break;
            default:
            sendTo(socket, {
               type: "error",
               message: "Command not found: " + data.type
            });
            break;
         }
      })
      
      socket.on('videocall', function(message){
       
         var data = message;
      
         switch (data.type) {
           case "call_user":
              console.log("call_user", data);
              socket.broadcast.to(data.recipient.id).emit('video_call',{ 
                 type: "connecting",
                 data: data
              })
           break;
           case "ringing":
              console.log("ringing", data);
              socket.broadcast.to(data.data.caller.id).emit('video_call',{ 
                 type: "ringing",
                 data: data
              })
           break;
           case "candidate": 
              console.log("Sending candidate to:",data); 
              socket.broadcast.to(data.id).emit('video_call',{ 
                 type: "candidate",
                 candidate: data.candidate
              })
           break;
      
           case "offer": 
              //for ex. UserA wants to call UserB 
              console.log("Sending offer to: ", data.id);
              socket.broadcast.to(data.id).emit('video_call',{ 
                 type: "offer",
                 offer: data.offer, 
              })
           break;
           case "answerOffer": 
              console.log("Sending answer to: ", data.id); 
              socket.broadcast.to(data.id).emit('video_call',{ 
                 type: "answerOffer",
                 answer: data.answer 
              })
           break;
           case "rejectCall": 
              console.log("rejectCall from", data.id); 
              socket.broadcast.to(data.id).emit('video_call',{ 
                 type: "rejectCall",
              })
            break;
           case "leave": 
              console.log("Disconnecting from", data.id); 
              socket.broadcast.to(data.id).emit('video_call',{ 
                 type: "leave",
              })
              socket.broadcast.to(data.currentId).emit('video_call',{ 
                  type: "free_call",
               })
           break;
           case "user_busy":
              console.log("user_busy", data);
              socket.broadcast.to(data.data.caller.id).emit('video_call',{ 
                 type: "user_busy",
              })
           break;
           default:
           sendTo(socket, {
              type: "error",
              message: "Command not found: " + data.type
           });
           break;
         }
      })
      
      })

}


module.exports = socket_io;






