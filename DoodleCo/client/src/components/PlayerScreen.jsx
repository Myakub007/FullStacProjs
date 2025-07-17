import React, { useState } from 'react'

const PlayerScreen = () => {
  const [score,setScore] = useState(0)
  return (
    <>
          <div id='playerinfo' className='bg-gray-200 p-2 w-[10vw] h-[45vh]'>
            <div className='font-bold border-b '>DoodleCo</div>
            <div>
              <div className='flex justify-evenly'>Yakub {score} avatar</div>
              <div className='flex justify-evenly'>Yakub {score} avatar</div>
              <div className='flex justify-evenly'>Yakub {score} avatar</div>
            </div>
          </div>
    </>
  )
}

export default PlayerScreen
