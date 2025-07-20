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

const roomTimers ={};


app.get('/', (req, res) => {
    res.send('Socket.IO Server is running');});


app.use(cors());

function startRoomTimer(roomID) {
    if (!rooms[roomID]) return;
    // Clear any existing timer
    if (roomTimers[roomID]) clearInterval(roomTimers[roomID]);

    rooms[roomID].timer = parseInt(rooms[roomID].timer) || 60; // Ensure it's a number
    roomTimers[roomID] = setInterval(() => {
        if (!rooms[roomID]) {
            clearInterval(roomTimers[roomID]);
            return;
        }
        rooms[roomID].timer--;
        io.to(roomID).emit('timerUpdate', rooms[roomID].timer);

        if (rooms[roomID].timer <= 0) {
            clearInterval(roomTimers[roomID]);
            // Optionally: handle end of round/turn here
        }
    }, 1000);
}



io.on('connection',(socket) =>{
    socket.on('createRoom',({nickname,socketID},response)=>{
        let roomID;
        do{
            roomID = generateRoomID();
        } while (rooms[roomID]);
        rooms[roomID] ={players:[{nickname,socketID}],timer:60,rounds:5,words:3};
        socket.join(roomID);
        socket.nickname = nickname;
        socket.roomID = roomID;
        socket.role = 'host';
        io.to(roomID).emit('playerList', rooms[roomID]);
        response({success:true,roomID})

    })
    socket.on('joinRoom',({roomID,nickname,role},callback)=>{
        if(rooms[roomID]){
            if (!rooms[roomID].players.some(player => player.socketID === socket.id)) {
                rooms[roomID].players.push({nickname, socketID: socket.id});
            }
            socket.join(roomID);
            socket.nickname = nickname;
            socket.roomID = roomID;
            socket.role = role;
            io.to(roomID).emit('playerList', rooms[roomID].players);
            callback && callback({success:true})
        }else{
            callback && callback({success:false})
        }
    })
    socket.on('startGame',()=>{
        if(rooms[socket.roomID]){
            io.to(socket.roomID).emit('gameStarted');
            startRoomTimer(socket.roomID)
        }
    });
    socket.on('updateGameOptions', (data) => {
        const { roomID, ...options } = data;
        console.log('Received updateGameOptions:', data);
        console.log('Current rooms:', Object.keys(rooms));
        if (rooms[roomID]) {
            Object.assign(rooms[roomID], options);
            console.log('Updated room:', rooms[roomID]);
        } else {
            console.log('Room not found for roomID:', roomID);
        }
    });
    socket.on('getAvailableRooms', (callback) => {
        // Only return rooms with at least one player
        const availableRooms = Object.keys(rooms).filter(roomID => rooms[roomID].players.length > 0);
        callback(availableRooms);
    });

    socket.on('disconnect',()=>{
        socket.broadcast.emit('userLeft',`${socket.nickname} has left the lobby`);
        console.log('Disconnected',socket.id);

        const roomID = socket.roomID;
        if (roomID && rooms[roomID]){
            rooms[roomID].players = rooms[roomID].players.filter(player => player.socketID !== socket.id)
            if (rooms[roomID].players.length === 0){
                delete rooms[roomID];
                console.log(`Room ${roomID} deleted because empty`)
            }
            else{
                io.to(roomID).emit('playerList',rooms[roomID].players)
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