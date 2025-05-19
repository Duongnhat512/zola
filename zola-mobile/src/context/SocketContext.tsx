// src/contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import setupSocket from "../services/Socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketInstance;
    const initializeSocket = async () => {
      try {
        socketInstance = await setupSocket();
        setSocket(socketInstance);
      } catch (err) {
        console.error("Socket init error:", err);
      }
    };

    initializeSocket();
    
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
