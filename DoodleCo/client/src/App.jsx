import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css'
import Game from './pages/Game'
import Lobby from './pages/Lobby'
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Lobby />} />
          <Route path='/:roomId' element={<Game />} />
        </Routes> 
      </Router>
    </SocketProvider>
  )
}

export default App
