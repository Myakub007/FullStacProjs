import React, { useEffect, useRef, useState } from 'react'
import '../index.css'
import Avatar from '../components/AvatarSelect'

const Lobby = ({setIsGameStarted}) => {
    const [nickname,setNickName] = useState('');
    const handleNickname = (e) =>{
        setNickName(e.target.value);
    }
    const startGame = () =>{
        setIsGameStarted(true);
    }
    useEffect(()=>{
        console.log(nickname)
    },[nickname])
    return (
        <>
            <div className='bg-blue-900 h-screen'>
                <div className='flex flex-col gap-10 justify-center items-center p-10'>
                    <div className='text-5xl text-white'>DoodleCo</div>
                    <div className='bg-blue-800 p-3'>
                        <div>
                            <input onChange={handleNickname} type="text" placeholder='Enter NickName' value={nickname} className='px-3 bg-white' />
                            <span className='bg-white border-2'>English</span>
                        </div>
                        <Avatar />
                        <div className='flex flex-col gap-2'>
                            <button onClick={startGame} className='w-full bg-green-500 p-1 text-white text-2xl align-middle text-center'>Play !</button>
                            <button className='w-full bg-blue-400 p-2'>Create Private Room</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Lobby
