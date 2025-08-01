"use client"

import { motion } from "framer-motion"
import Lottie from "lottie-react"
import { Heart } from 'lucide-react'
import animationData from "./animations/loading.json"  // ✅ path from 'LoadingScreen.tsx'

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img 
              src="/g5.png" 
              alt="Medicare Nepal" 
              className="w-16 h-16 rounded-full animate-pulse-glow" 
            />
            <Heart className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold neon-text mb-2">Medicare Nepal</h1>
          <p className="text-gray-400">AI-Powered Health Assistant</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center justify-center space-x-2"
        >
          <Lottie animationData={animationData} className="w-24 h-24" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500"
        >
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>AI Ready</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Secure</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span>Multilingual</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoadingScreen
