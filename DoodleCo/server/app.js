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
    console.log('Connected',socket.id);
    socket.on('joinLobby',({nickname})=>{
        socket.nickname = nickname;
        socket.broadcast.emit('userJoined',`${socket.nickname} has joined the lobby`);
    });
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
            rooms[roomID].push({nickname,socketID:socket.id})
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

    socket.on('disconnect',()=>{
        socket.broadcast.emit('userLeft',`${socket.nickname} has left the lobby`);
        console.log('Disconnected',socket.id);
    });
    socket.on('message',(message)=>{
        io.emit('serverMessage',{nickname:socket.nickname, message:message});
    });
    
});

server.listen(Port,()=>{
    console.log('Server is running on ',Port);
});