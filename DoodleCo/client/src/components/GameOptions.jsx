import React from 'react'
import '../index.css'

const GameOptions = ({socket,role,setTimer,setWords,setRounds}) => {
  const handleStartGame = () => {
    socket.emit('startGame')
  }
  const handleChange = (e) => {
    if (e.target.name === 'timer') {
      setTimer(e.target.value);
    } else if (e.target.name === 'words') {
      setWords(e.target.value);
    } else if (e.target.name === 'rounds') {
      setRounds(e.target.value);
    }
  }

  return (
    <>
    <div className={role === 'host'?'bg-black':'bg-blue-300'}>
      <h1 className='text-2xl text-white'>Game Options</h1>
      <p className='text-white'>Choose your game options below:</p>
      <div className='flex flex-col gap-2 bg-gray-800 p-4 text-white rounded-lg'>
        <div>
          <span>Round Timer</span><input disabled={role!=='host'} type="text" placeholder='60' className='px-3 mx-2' onChange={handleChange} name='timer'/>
          </div>
        <div>
          <span>No of rounds</span>
          <input disabled={role!=='host'}  type="text" placeholder='5' className='px-3 mx-2' name='rounds' onChange={handleChange} />
          </div>
        <div>
           <span>No of words</span>
           <input disabled={role!=='host'}  type="text" placeholder='3' className='px-3 mx-2' onChange={handleChange} name='words'/>
           </div>
      </div>
    </div>
      <div className={role === 'host'?'':'hidden'}>
        <button className='bg-green-500 px-3 py-1 text-white'  onClick={handleStartGame}> Start Game</button>
      </div>
    </>
  )
}

export default GameOptions
