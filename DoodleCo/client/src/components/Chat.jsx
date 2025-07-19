import React, { useState, useEffect } from 'react'

const Chat = ({socket}) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    socket.emit('message',message);
    setMessage('');
  }
  useEffect(() => {
    const handleServerMessage = (data) => {
      setMessages(prevMessages => [...prevMessages, {nickname: data.nickname, message: data.message}]);
    };
    socket.on('serverMessage', handleServerMessage);
    return () => {
      socket.off('serverMessage', handleServerMessage);
    };
  }, [socket]);
  return (
    <>
      <div id='chat' className='bg-gray-200 h-[45vh] w-[15vw] relative'>
            <div className='font-bold'>Chat</div>
            <div className='flex flex-col h-[38vh] overflow-y-auto '>
              {messages.map((message, index)=>(
                <div key={index} className='w-full text-sm flex gap-2'><span>{message.nickname}:</span><p>{message.message}</p></div>
              ))}

            </div>
            <div className='absolute bottom-0 left-0 flex w-[15vw]'>
              <input className='w-[11vw] px-2 focus:outline-none bg-white' type="text" placeholder='Your guess...' value={message} onChange={(e)=>setMessage(e.target.value)} />
              <button onClick={handleSendMessage} className='bg-white w-[4vw] text-green-600 px-3 border'>Send</button>
            </div>
          </div>
    </>
  )
}

export default Chat
