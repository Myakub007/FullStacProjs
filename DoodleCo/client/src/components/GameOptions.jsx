import React from 'react'

const GameOptions = (setGameStart) => {
    const handleGameStart = ()=>{
        setGameStart(true)
    }
  return (
    <div>
      <div><button onClick={handleGameStart}>Start Game</button></div>
    </div>
  )
}

export default GameOptions
