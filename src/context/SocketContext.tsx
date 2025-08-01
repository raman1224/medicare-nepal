"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Socket } from "socket.io-client"

interface SocketContextType {
  socket: Socket | null
}

const SocketContext = createContext<SocketContextType>({ socket: null })

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
  socket: Socket | null
}

export const SocketProvider = ({ children, socket }: SocketProviderProps) => {
  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}
