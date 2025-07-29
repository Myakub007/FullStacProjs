const express = require('express');
const app = express();
const cors = require('cors');
const {Server} = require('socket.io');
const http = require('http');
const Port = 3000;
const crypto = require('crypto');
const fs = require('fs');

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
let currentCanvasState = null;

const roomTimers ={};

let words = [];
if(words.length === 0){
    words = fs.readFileSync(__dirname+'/words.txt','utf-8').split(',').map(word => word.trim());
}

const getRandomWords =()=>{
    const shuffled = [...words];

    for (let i = shuffled.length-1;i>0;i--){
        const j = Math.floor(Math.random() * (i+1));
        [shuffled[i],shuffled[j]] = [shuffled[j],shuffled[i]];
    }
    return shuffled.slice(0,3);
}


app.get('/', (req, res) => {
    res.send('Socket.IO Server is running');});


app.use(cors());

// const words = [];

// function getRandomWords(){

// }

function startRoomTimer(roomID) {
    if (!rooms[roomID]) return;
    // Clear any existing timer
    if (roomTimers[roomID]) clearInterval(roomTimers[roomID]);
    
    rooms[roomID].timer = rooms[roomID].drawingDuration || 60;
    rooms[roomID].breakTimer = 10; // Default break time
    rooms[roomID].isBreak = false; // Reset break state
    rooms[roomID].wordTimer = 15; // Default word timer

    let result = [];

    // rooms[roomID].isSelectingWord = false; //reset word selection

    roomTimers[roomID] = setInterval(() => {
        if (!rooms[roomID]) {
            clearInterval(roomTimers[roomID]);
            return;
        }
        if(rooms[roomID].isBreak){
            rooms[roomID].breakTimer--;
            io.to(roomID).emit('timerUpdate',{ 
                timer: rooms[roomID].breakTimer,
                isBreak: true
            });
            rooms[roomID].selectedWord = null;

            // Check if break time is over
            if(rooms[roomID].breakTimer <=0){
                rooms[roomID].isBreak = false;
                rooms[roomID].timer = rooms[roomID].drawingDuration || 60; // reset main timer
                rooms[roomID].breakTimer = 10; // reset break timer
                rooms[roomID].currentTurn = (rooms[roomID].currentTurn + 1)%rooms[roomID].players.length
                rooms[roomID].currentPlayerSocketId = rooms[roomID].players[rooms[roomID].currentTurn].socketID;
                io.to(roomID).emit('turnUpdate',{
                    currentPlayerSocketId: rooms[roomID].currentPlayerSocketId,
                    isBreak: false
                })
            }
        }
        else if(rooms[roomID].isSelectingWord){
            rooms[roomID].wordTimer--;
            if(result.length === 0){
                result = getRandomWords();
                io.to(roomID).emit('selectWord',
                    {words:result}
                )
                console.log(result);
            }
            io.to(roomID).emit('timerUpdate',{
                timer: rooms[roomID].wordTimer
            })

            if(rooms[roomID].selectedWord !== null){
                rooms[roomID].wordTimer = 0;
            }

            if(rooms[roomID].wordTimer<=0){
                rooms[roomID].isSelectingWord = false;
                rooms[roomID].timer = rooms[roomID].drawingDuration || 60;
                rooms[roomID].wordTimer = 15;
                io.emit('selectRandomWord')
                result =[];
                console.log('someword selected');
            }
        }
        else{
            //Main game phase
            rooms[roomID].timer--;
            console.log(`${rooms[roomID].isSelectingWord} and ${rooms[roomID].wordTimer}`)
            io.to(roomID).emit('timerUpdate',{
                timer: rooms[roomID].timer,
                isBreak: false,
            })

            // main timer ended -> start break
            if(rooms[roomID].timer <= 0 ){
                rooms[roomID].isBreak = true;
                rooms[roomID].isSelectingWord = true;
                io.to(roomID).emit('turnUpdate',{
                    currentPlayer:null,
                    isBreak:true,
                })
            }
        }

    }, 1000);
}

io.on('connection',(socket) =>{
    socket.on('clear-canvas',()=>{
        socket.to(socket.roomID).emit('canvas-cleared')
        currentCanvasState = null; // Reset canvas state when cleared
        io.to(socket.roomID).emit('init-canvas', currentCanvasState)
    });
    
    socket.on('createRoom',({nickname,socketID},response)=>{
        let roomID;
        do{
            roomID = generateRoomID();
        } while (rooms[roomID]);
        rooms[roomID] ={
            players:[{nickname,socketID}],
            timer:60,
            breakTimer:10,
            currentTurn:0,
            currentPlayerSocketId: socketID,
            isBreak: false,
            rounds:5,
            words:3,
            drawingDuration:60,
            wordTimer: 15,
            isSelectingWord: false,
            selectedWord: null,
        };
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
            rooms[socket.roomID].currentTurn = 0;
            rooms[socket.roomID].isBreak = false;
            rooms[socket.roomID].isSelectingWord = true;
            currentCanvasState = null; // Reset canvas state when game starts
            io.to(socket.roomID).emit('gameStarted');
            startRoomTimer(socket.roomID)
            io.to(socket.roomID).emit('init-canvas', currentCanvasState)
        }
    });
    socket.on('curentPlayer',()=>{
        if(rooms[socket.roomID]){
            socket.emit('currentPlayer', {
                currentPlayerSocketId: rooms[socket.roomID].players[rooms[socket.roomID].currentTurn].socketID,
                isBreak: false
            });
        }
});

socket.on('wordSelected',({word})=>{
    rooms[socket.roomID].selectedWord = word;
})

socket.on('drawing-start', (startData) => {
  socket.to(socket.roomID).emit('remote-drawing', {
    type: 'path',
    path: [{x: startData.x, y: startData.y}],
    color: startData.color,
    lineWidth: startData.lineWidth,
    socketId: startData.socketId
  });
});

socket.on('drawing-move', (moveData) => {
  socket.to(socket.roomID).emit('remote-drawing', {
    type: 'path',
    path: [moveData.from, moveData.to],
    color: moveData.color,
    lineWidth: moveData.lineWidth,
    socketId: moveData.socketId
  });
});

    socket.on('fill',(fillData)=>{
        console.log(fillData);
        socket.to(socket.roomID).emit('remote-fill',fillData);
    })

    socket.on('updateGameOptions', (data) => {
        const { roomID, ...options } = data;
        // console.log('Received updateGameOptions:', data);
        // console.log('Current rooms:', Object.keys(rooms));
        if (rooms[roomID]) {
            rooms[roomID].drawingDuration = options.timer || 60;
            Object.assign(rooms[roomID], options);

            if(roomTimers[roomID]){
                startRoomTimer(data.roomID)
            }
            // console.log('Updated room:', rooms[roomID]);
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
        socket.to(socket.roomID).emit('userLeft',`${socket.nickname} has left the lobby`);
        console.log('Disconnected',socket.id);

        const roomID = socket.roomID;
        if (roomID && rooms[roomID]){
            rooms[roomID].players = rooms[roomID].players.filter(player => player.socketID !== socket.id)
            if (rooms[roomID].players.length === 0){
                clearInterval(roomTimers[roomID]);
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