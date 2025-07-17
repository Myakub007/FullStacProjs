import { useEffect, useRef, useState } from 'react'
import './index.css'
import Game from './pages/Game'
import Lobby from './pages/Lobby'
import {io} from 'socket.io-client';
import { use } from 'react';


function App() {
  const socketRef = useRef(null);
  const [isGameStarted,setIsGameStarted] = useState(false);
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    const socket = io('http://localhost:3000');
    socketRef.current = socket;
    setConnected(true);
  },[]);

  return (
    <>{
      connected?<> {isGameStarted ?<Game socket={socketRef} />:<Lobby setIsGameStarted={setIsGameStarted} socket={socketRef} />}</> : <div className='text-red-500 text-2xl'>Connecting...</div>
    }
    </>
  )
}

export default App
