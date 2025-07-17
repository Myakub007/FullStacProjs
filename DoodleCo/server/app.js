const express = require('express');
const app = express();
const cors = require('cors');
const {Server} = require('socket.io');
const http = require('http');
const Port = 3000;

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    }
})

app.get('/', (req, res) => {
    res.send('Socket.IO Server is running');});

app.use(cors());

io.on('connection',(socket) =>{
    console.log('Connected',socket.id);
    socket.on('joinLobby',({nickname})=>{
        socket.nickname = nickname;
        socket.broadcast.emit('userJoined',`${nickname} has joined the lobby`);
})
});

server.listen(Port,()=>{
    console.log('Server is running on ',Port);
});