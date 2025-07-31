import React, { createContext, useContext } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const socket = io('http://localhost:3000') || io('https://doodlecry.onrender.com/') // or your server URL

export const SocketProvider = ({ children }) => (
  <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
);

export const useSocket = () => useContext(SocketContext);
