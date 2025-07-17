import React from 'react'
import Canvas from '../components/Canvas'
import PlayerScreen from '../components/PlayerScreen'
import Chat from '../components/Chat'
import StatusBar from '../components/StatusBar'
import '../index.css'

const Game = ({socket}) => {
  const socketConnection = socket.current;
  if (!socketConnection) {
    return <div className='text-white text-2xl'>Connecting...</div>
  }
  
  return (
    <>
      <div className='bg-blue-900 h-screen flex flex-col items-center justify-center gap-3'>
        <StatusBar />
        <div className='flex gap-4 justify-center items-center'>
          <PlayerScreen/>
          <Canvas />
          <Chat />
        </div>
      </div>
    </>
  )
}

export default Game
