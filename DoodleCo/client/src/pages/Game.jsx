import React, { useEffect, useState } from 'react'
import Canvas from '../components/Canvas'
import PlayerScreen from '../components/PlayerScreen'
import Chat from '../components/Chat'
import StatusBar from '../components/StatusBar'
import GameOptions from '../components/GameOptions'
import '../index.css'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Game = () => {
  const {roomId} = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [gameStart,setGameStart] = useState(false);
  const [nickname, setNickname] = useState(location.state?.nickname || '');
  const [players, setPlayers] = useState([]);

  const socketConnection = useSocket();
  if (!socketConnection) {
    return <div className='text-black text-2xl'>Connecting...</div>
  }

  useEffect(() => {
    const roomID = roomId
    const role = location.state?.role || 'guest';

    if (!nickname) {
      const input = prompt("Enter your nickname to join the room:");
      if (!input) {
        alert('Nickname required!');
        navigate('/');
        return;
      }
      setNickname(input);
      return;
    }
    socketConnection.emit('joinRoom', { roomID, nickname, role}, (response) => {
      if (response.success) {
        console.log("Joined room:", roomID);
        // optionally set user state or load game state here
      } else {
        alert('Room not found or join failed');
        navigate('/');
      }
    });
    socketConnection.on('playerList', (playerList) => {
      setPlayers(playerList);
    });
  }, [roomId,nickname, navigate, socketConnection, location.state]);

  if(!nickname){
    return <div>Retry</div>
  }
  
  return (
    <>{gameStart?
      <div className='bg-blue-900 h-screen flex flex-col items-center justify-center gap-3'>
      <StatusBar />
      <div className='flex gap-4 justify-center items-center'>
        <PlayerScreen socket={socketConnection}/>
        <Canvas socket={socketConnection}/>
        <Chat socket={socketConnection}/>
      </div>
    </div>
    :
      <div className='bg-blue-900 h-screen flex flex-col items-center justify-center gap-3'>
        <GameOptions socket={socketConnection} setGameStart={setGameStart} />
        <div className='flex gap-4 justify-center items-center'>
          <PlayerScreen socket={socketConnection}/>
          <Chat socket={socketConnection}/>
        </div>
      </div>
    }
    </>
  )
}

export default Game
