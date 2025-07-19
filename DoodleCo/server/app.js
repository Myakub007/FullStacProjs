const express = require('express');
const app = express();
const cors = require('cors');
const {Server} = require('socket.io');
const http = require('http');
const Port = 3000;
const crypto = require('crypto');

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    }
})
const generateRoomID = () => {
  return crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 8);
};
const rooms = {};


app.get('/', (req, res) => {
    res.send('Socket.IO Server is running');});


app.use(cors());

io.on('connection',(socket) =>{
    socket.on('createRoom',({nickname,socketID},response)=>{
        let roomID;
        do{
            roomID = generateRoomID();
        } while (rooms[roomID]);
        rooms[roomID] =[{nickname,socketID}];
        socket.join(roomID);
        socket.nickname = nickname;
        socket.roomID = roomID;
        socket.role = 'host';
        io.to(roomID).emit('playerList', rooms[roomID]);
        response({success:true,roomID})

    })
    socket.on('joinRoom',({roomID,nickname,role},callback)=>{
        if(rooms[roomID]){
            if (!rooms[roomID].some(player => player.socketID === socket.id)) {
                rooms[roomID].push({nickname, socketID: socket.id});
            }
            socket.join(roomID);
            socket.nickname = nickname;
            socket.roomID = roomID;
            socket.role = role;
            io.to(roomID).emit('playerList', rooms[roomID]);
            callback && callback({success:true})
        }else{
            callback && callback({success:false})
        }
    })
    socket.on('startGame',()=>{
        if(rooms[socket.roomID]){
            io.to(socket.roomID).emit('gameStarted');
        }
    });
    socket.on('getAvailableRooms', (callback) => {
        // Only return rooms with at least one player
        const availableRooms = Object.keys(rooms).filter(roomID => rooms[roomID].length > 0);
        callback(availableRooms);
    });

    socket.on('disconnect',()=>{
        socket.broadcast.emit('userLeft',`${socket.nickname} has left the lobby`);
        console.log('Disconnected',socket.id);

        const roomID = socket.roomID;
        if (roomID && rooms[roomID]){
            rooms[roomID] = rooms[roomID].filter(player => player.socketID !== socket.id)
            if (rooms[roomID].length === 0){
                delete rooms[roomID];
                console.log(`Room ${roomID} deleted because empty`)
            }
            else{
                io.to(roomID).emit('playerList',rooms[roomID])
            }
        }
    });
    socket.on('message',(message)=>{
        io.emit('serverMessage',{nickname:socket.nickname, message:message});
    });
    
});

server.listen(Port,()=>{
    console.log('Server is running on ',Port);
});