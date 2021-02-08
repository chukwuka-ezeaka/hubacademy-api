r = require('rethinkdb');
EVENTS = require('./events');
const socket = (socketio,server)=> {
    const io = socketio(server, {
        handlePreflightRequest: (req, res) => {
            const headers = {
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
                "Access-Control-Allow-Credentials": true
            };
            res.writeHead(200, headers);
            res.end();
        }
    });

    let connectedUsers = { };

    function addUser(userList, user){
        let newList = Object.assign({}, userList)
        newList[user.id] = user
        return newList
    }

    function removeUser(userList, username){
        let newList = Object.assign({}, userList)
        delete newList[username]
        return newList
    }


            io.of('/api/v1/chat').on('connection', function (socket) {
                // this is socket for each user
                console.log("User connected", socket.id);
                socket.emit('connection', 'connected')
                // socket.on("chat", function (data) {
                //     // this is socket for each user
                //     io.sockets.emit('user_chatting', data);
                //     console.log("User sent data", data);
                // });

                socket.on(EVENTS.TYPING, function (data) {
                    socket.broadcast.emit(EVENTS.TYPING, data)
                    // this is socket for each user
                    // io.sockets.emit(EVENTS.TYPING, data);
                    console.log("Typing event", data);
                });

                //User Connects with username
                socket.on(EVENTS.USER_CONNECTED, (user)=>{
                    user.socketId = socket.id
                    connectedUsers = addUser(connectedUsers, user)
                    socket.user = user

                    io.of('/api/v1/chat').emit(EVENTS.USER_CONNECTED, connectedUsers)
                    console.log(connectedUsers);

                })


                //Chat request
                socket.on(EVENTS.PRIVATE_MESSAGE,(private_msg_payload, callback)=> {
                    // if (!private_msg_payload.sender_username || !private_msg_payload.sender_id || !private_msg_payload.sender_name ||
                    //     !private_msg_payload.receiver_username || !private_msg_payload.receiver_id || !private_msg_payload.receiver_name){
                    //     callback({error:'Invalid Payload'})
                    // }else{
                    //
                    // }
                    io.of('/api/v1/chat').to(`${private_msg_payload.receiverSocketId}`).emit(EVENTS.PRIVATE_MESSAGE,private_msg_payload);
                    // socket.broadcast.emit(EVENTS.PRIVATE_MESSAGE, private_msg_payload)
                    // this is socket for each user

                    console.log("User sent chat", private_msg_payload);
                });

                //User disconnects
                socket.on('disconnect', ()=>{
                    if("user" in socket){
                        connectedUsers = removeUser(connectedUsers, socket.user.id)
                        io.emit(EVENTS.USER_DISCONNECTED, connectedUsers)
                    }
                });

                //User logsout
                socket.on(EVENTS.LOGOUT, ()=>{
                    connectedUsers = removeUser(connectedUsers, socket.user.id)
                    io.emit(EVENTS.USER_DISCONNECTED, connectedUsers)
                    console.log("Disconnect", connectedUsers);

                })

            })

    io.of('/api/v1/chat').on('disconnect', (socket)=>{
        console.log("Disconnect", socket.id);
        if("user" in socket){
            connectedUsers = removeUser(connectedUsers, socket.user.name)

            io.emit(EVENTS.USER_DISCONNECTED, connectedUsers)
            console.log("Disconnect", connectedUsers);
        }
    });



}

module.exports = socket;
