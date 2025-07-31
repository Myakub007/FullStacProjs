const express = require('express');
const app = express();
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const Port = 3000;
const crypto = require('crypto');
// const fs = require('fs');
const path = require('path');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['https://full-stac-projs.vercel.app/'],
        methods: ['GET', 'POST'],
    }
})
const generateRoomID = () => {
    return crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 8);
};
const rooms = {};
let currentCanvasState = null;

const roomTimers = {};

let words = [];
if (words.length === 0) {
    words = path.join(__dirname, 'words.txt').split(',').map(word => word.trim());
}

const getRandomWords = (roomID) => {
    const shuffled = [...words];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, rooms[roomID].words);
}


app.get('/', (req, res) => {
    res.send('Socket.IO Server is running');
});


app.use(cors());

// const words = [];

// function getRandomWords(){

// }

function startRoomTimer(roomID) {
    if (!rooms[roomID]) return;
    // Clear any existing timer
    if (roomTimers[roomID]) clearInterval(roomTimers[roomID]);

    // Use the actual drawingDuration, not default to 60
    rooms[roomID].timer = rooms[roomID].drawingDuration;
    rooms[roomID].breakTimer = 10; // Default break time
    rooms[roomID].isBreak = false; // Reset break state
    rooms[roomID].wordTimer = 15; // Default word timer
    rooms[roomID].drawerGuessedThisTurn = false; // Reset drawer guessed flag

    let result = [];

    // rooms[roomID].isSelectingWord = false; //reset word selection

    roomTimers[roomID] = setInterval(() => {
        if (!rooms[roomID]) {
            clearInterval(roomTimers[roomID]);
            return;
        }
        if (rooms[roomID].isBreak) {
            rooms[roomID].breakTimer--;
            io.to(roomID).emit('timerUpdate', {
                timer: rooms[roomID].breakTimer,
                isBreak: true
            });
            io.to(roomID).emit('remove');
            rooms[roomID].selectedWord = null;
            rooms[roomID].players.forEach(p => {
                p.guessed = false;
            });

            // Check if break time is over
            if (rooms[roomID].breakTimer <= 0) {
                rooms[roomID].isBreak = false;
                rooms[roomID].timer = rooms[roomID].drawingDuration; // Use actual drawingDuration
                rooms[roomID].breakTimer = 10; // reset break timer
                rooms[roomID].currentTurn = (rooms[roomID].currentTurn + 1) % rooms[roomID].players.length
                rooms[roomID].currentPlayerSocketId = rooms[roomID].players[rooms[roomID].currentTurn].socketID;
                rooms[roomID].selectedWord = null; // Ensure word is cleared before new round
                rooms[roomID].drawerGuessedThisTurn = false; // reset for new turn
                // Increment round if we wrapped to first player
                if (rooms[roomID].currentTurn === 0) {
                    rooms[roomID].currentRound += 1;
                    // If all rounds played, end game
                    if (rooms[roomID].currentRound > rooms[roomID].rounds) {
                        clearInterval(roomTimers[roomID]);
                        // Sort players by score descending
                        const rankings = [...rooms[roomID].players].sort((a, b) => b.score - a.score);
                        io.to(roomID).emit('gameEnded', { rankings });
                        // Optionally reset room state for new game
                        return;
                    }
                }
                io.to(roomID).emit('turnUpdate', {
                    currentPlayerSocketId: rooms[roomID].currentPlayerSocketId,
                    isBreak: false,
                    currentRound: rooms[roomID].currentRound,
                    rounds: rooms[roomID].rounds
                })
            }
        }
        else if (rooms[roomID].isSelectingWord) {
            rooms[roomID].wordTimer--;
            if (result.length === 0) {
                result = getRandomWords(roomID);
                io.to(roomID).emit('selectWord',
                    { words: result }
                )
                console.log(result);
            }
            io.to(roomID).emit('timerUpdate', {
                timer: rooms[roomID].wordTimer
            })

            if (rooms[roomID].selectedWord !== null) {
                rooms[roomID].wordTimer = 0;
            }

            if (rooms[roomID].wordTimer <= 0) {
                rooms[roomID].isSelectingWord = false;
                rooms[roomID].timer = rooms[roomID].drawingDuration; // Use actual drawingDuration
                rooms[roomID].wordTimer = 15;
                io.emit('selectRandomWord')
                result = [];
                console.log('someword selected');
            }
        }
        else {
            //Main game phase
            rooms[roomID].timer--;
            // console.log(`${rooms[roomID].isSelectingWord} and ${rooms[roomID].wordTimer}`)
            io.to(roomID).emit('timerUpdate', {
                timer: rooms[roomID].timer,
                isBreak: false,
            })

            // main timer ended -> start break
            if (rooms[roomID].timer <= 0) {
                // Award drawer if at least one guess
                if (rooms[roomID].drawerGuessedThisTurn) {
                    const drawer = rooms[roomID].players.find(p => p.socketID === rooms[roomID].currentPlayerSocketId);
                    if (drawer) {
                        drawer.score += 50;
                    }
                }
                // Calculate points earned this round for each player
                const roundPoints = rooms[roomID].players.map(player => {
                    // If player has a 'lastScore' property, use it; otherwise, calculate difference
                    const earned = (player.scoreThisTurn || 0);
                    return { nickname: player.nickname, points: earned };
                });
                io.to(roomID).emit('roundPoints', { roundPoints });
                // Reset per-turn points
                rooms[roomID].players.forEach(player => { player.scoreThisTurn = 0; });
                rooms[roomID].drawerGuessedThisTurn = false; // reset for next turn
                rooms[roomID].isBreak = true;
                rooms[roomID].isSelectingWord = true;
                io.to(roomID).emit('turnUpdate', {
                    currentPlayer: null,
                    isBreak: true,
                    currentRound: rooms[roomID].currentRound,
                    rounds: rooms[roomID].rounds
                })
            }
        }

    }, 1000);
}

io.on('connection', (socket) => {
    socket.on('clear-canvas', () => {
        socket.to(socket.roomID).emit('canvas-cleared')
        currentCanvasState = null; // Reset canvas state when cleared
        io.to(socket.roomID).emit('init-canvas', currentCanvasState)
    });

    socket.on('createRoom', ({ nickname, socketID }, response) => {
        let roomID;
        do {
            roomID = generateRoomID();
        } while (rooms[roomID]);
        rooms[roomID] = {
            players: [{ nickname, socketID, guessed: false, score: 0 }],
            timer: 60,
            breakTimer: 10,
            currentTurn: 0,
            currentPlayerSocketId: socketID,
            isBreak: false,
            rounds: 5,
            words: 3,
            drawingDuration: 60,
            wordTimer: 15,
            isSelectingWord: false,
            selectedWord: null,
            drawerGuessedThisTurn: false,
            currentRound: 1,
        };
        socket.join(roomID);
        socket.nickname = nickname;
        socket.roomID = roomID;
        socket.role = 'host';
        io.to(roomID).emit('playerList', rooms[roomID]);
        response({ success: true, roomID })
    })
    socket.on('joinRoom', ({ roomID, nickname, role }, callback) => {
        if (rooms[roomID]) {
            if (!rooms[roomID].players.some(player => player.socketID === socket.id)) {
                rooms[roomID].players.push({ nickname, socketID: socket.id, guessed: false, score: 0 });
            }
            socket.join(roomID);
            socket.nickname = nickname;
            socket.roomID = roomID;
            socket.role = role;
            io.to(roomID).emit('playerList', rooms[roomID].players);
            callback && callback({ success: true })
        } else {
            callback && callback({ success: false })
        }
    })
    socket.on('startGame', () => {
        if (rooms[socket.roomID]) {
            rooms[socket.roomID].currentTurn = 0;
            rooms[socket.roomID].isBreak = false;
            rooms[socket.roomID].isSelectingWord = true;
            rooms[socket.roomID].drawerGuessedThisTurn = false;
            rooms[socket.roomID].currentRound = 1; // Reset to round 1
            currentCanvasState = null; // Reset canvas state when game starts
            io.to(socket.roomID).emit('gameStarted');
            startRoomTimer(socket.roomID)
            io.to(socket.roomID).emit('init-canvas', currentCanvasState)
            // Emit current round info immediately with explicit values
            console.log('Game started - Current round:', rooms[socket.roomID].currentRound, 'Total rounds:', rooms[socket.roomID].rounds);
            io.to(socket.roomID).emit('turnUpdate', {
                currentPlayerSocketId: rooms[socket.roomID].currentPlayerSocketId,
                isBreak: false,
                currentRound: rooms[socket.roomID].currentRound,
                rounds: rooms[socket.roomID].rounds
            })
        }
    });
    socket.on('curentPlayer', () => {
        if (rooms[socket.roomID]) {
            socket.emit('currentPlayer', {
                currentPlayerSocketId: rooms[socket.roomID].players[rooms[socket.roomID].currentTurn].socketID,
                isBreak: false
            });
        }
    });
    
    socket.on('wordSelected', (data) => {
        rooms[socket.roomID].selectedWord = data.word;
        io.to(socket.roomID).emit('guessWord', {
            word: data.word,
        }, console.log('data Emitted'));
        io.to(socket.roomID).emit('drawer', {
            player: data.currentPlayer,
            word: data.word
        })
    })
    
    socket.on('drawing-start', (startData) => {
        socket.to(socket.roomID).emit('remote-drawing', {
            type: 'path',
            path: [{ x: startData.x, y: startData.y }],
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

    socket.on('fill', (fillData) => {
        console.log(fillData);
        socket.to(socket.roomID).emit('remote-fill', fillData);
    })

    socket.on('updateGameOptions', (data) => {
        const { roomID, ...options } = data;
        // console.log('Received updateGameOptions:', data);
        // console.log('Current rooms:', Object.keys(rooms));
        if (rooms[roomID]) {
            if (options.timer !== undefined) options.timer = Number(options.timer);
            if (options.rounds !== undefined) options.rounds = Number(options.rounds);
            if (options.words !== undefined) options.words = Number(options.words);
            // Use the actual timer value, don't default to 60
            if (options.timer !== undefined) {
                rooms[roomID].drawingDuration = options.timer;
            }
            Object.assign(rooms[roomID], options);
            
            // If a game is running and we're in the main phase, update the current timer
            if (roomTimers[roomID] && !rooms[roomID].isBreak && !rooms[roomID].isSelectingWord) {
                rooms[roomID].timer = rooms[roomID].drawingDuration;
            }
            
            if (roomTimers[roomID]) {
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

    socket.on('disconnect', () => {
        socket.to(socket.roomID).emit('userLeft', `${socket.nickname} has left the lobby`);
        console.log('Disconnected', socket.id);

        const roomID = socket.roomID;
        if (roomID && rooms[roomID]) {
            rooms[roomID].players = rooms[roomID].players.filter(player => player.socketID !== socket.id)
            if (rooms[roomID].players.length === 0) {
                clearInterval(roomTimers[roomID]);
                delete rooms[roomID];
                console.log(`Room ${roomID} deleted because empty`)
            }
            else {
                io.to(roomID).emit('playerList', rooms[roomID].players)
            }
        }
    });
    socket.on('message', (message) => {
        if(rooms[socket.roomID]){
            if (message === rooms[socket.roomID].selectedWord) {
                const player = rooms[socket.roomID].players.find(player => player.socketID === socket.id)
                const drawerId = rooms[socket.roomID].currentPlayerSocketId;
                // Prevent the drawer from guessing
                if (socket.id === drawerId) {
                    io.to(socket.roomID).emit('serverMessage', { nickname: socket.nickname, message: "Drawer cannot guess the word!" });
                    return;
                }
                if (!player.guessed && !rooms[socket.roomID].isBreak && rooms[socket.roomID].selectedWord) {
                    player.guessed = true;
                    // Calculate score based on time left
                    const total = rooms[socket.roomID].drawingDuration || 60;
                    const timeLeft = rooms[socket.roomID].timer;
                    let score = 0;
                    if (timeLeft > total * 0.7) {
                        score = 350;
                    } else if (timeLeft > total * 0.4) {
                        score = 250;
                    } else {
                        score = 150;
                    }
                    player.score += score;
                    player.scoreThisTurn = (player.scoreThisTurn || 0) + score;
                    // Mark that at least one player guessed this turn
                    if (!rooms[socket.roomID].drawerGuessedThisTurn) {
                        // First correct guess this turn: award drawer
                        const drawer = rooms[socket.roomID].players.find(p => p.socketID === rooms[socket.roomID].currentPlayerSocketId);
                        if (drawer) {
                            drawer.score += 50;
                            drawer.scoreThisTurn = (drawer.scoreThisTurn || 0) + 50;
                        }
                    }
                    rooms[socket.roomID].drawerGuessedThisTurn = true;
                    // (do NOT award drawer points at round end)
                    console.log(player.nickname, player.score);
                    io.to(socket.roomID).emit('playerList', rooms[socket.roomID].players);
                    io.to(socket.roomID).emit('serverMessage', { nickname: socket.nickname, message:"guessed right" });
                }
            }
            else {
                io.to(socket.roomID).emit('serverMessage', { nickname: socket.nickname, message: message });
            }
        }
    });

});

server.listen(Port, () => {
    console.log('Server is running on ', Port);
});
