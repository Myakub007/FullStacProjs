import React, { useState } from 'react'

const PlayerScreen = ({ players = [] }) => {
  return (
    <div id='playerinfo' className='bg-gray-200 p-2 w-[10vw] h-[45vh]'>
      <div className='font-bold border-b '>DoodleCry</div>
      <div>
        {players.length === 0 ? (
          <div className='flex justify-evenly text-gray-500'>No players</div>
        ) : (
          players.map((player, idx) => (
            <div key={player.socketID || idx} className='flex justify-between'>
              <div>{player.nickname}</div><div>{player.score}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PlayerScreen
