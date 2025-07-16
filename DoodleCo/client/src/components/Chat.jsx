import React from 'react'

const Chat = () => {
  return (
    <>
      <div id='chat' className='bg-gray-200 h-[45vh] w-[15vw] relative'>
            <div className='font-bold'>Chat</div>
            <div className='flex flex-col h-[80%] overflow-y-scroll'>
              <div className='w-full text-sm flex gap-2'><span>name:</span><p>message</p></div>
              <div className='w-full text-sm flex gap-2'><span>name:</span><p>message</p></div>
              <div className='w-full text-sm flex gap-2'><span>name:</span><p>message</p></div>
              <div className='w-full text-sm flex gap-2'><span>name:</span><p>message</p></div>
              <div className='w-full text-sm flex gap-2'><span>name:</span><p>message</p></div>
              <div className='w-full text-sm flex gap-2'><span>name:</span><p>message</p></div>

            </div>
            <div className='absolute bottom-0 left-0 flex w-[15vw]'>
              <input className='w-[11vw] px-2 focus:outline-none bg-white' type="text" placeholder='Your guess...' />
              <button className='bg-white w-[4vw] text-green-600 px-3 border'>Send</button>
            </div>
          </div>
    </>
  )
}

export default Chat
