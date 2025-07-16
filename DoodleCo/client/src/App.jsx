import { useEffect, useRef, useState } from 'react'
import './App.css'
import './index.css'
import Game from './pages/Game'
import Lobby from './pages/Lobby'


function App() {
  const [isGameStarted,setIsGameStarted] = useState(false);
  
  return (
    <>
      {isGameStarted ?<Game />:<Lobby setIsGameStarted={setIsGameStarted} />}
    </>
  )
}

export default App
