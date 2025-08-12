"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Sparkles, Heart } from "lucide-react"

interface WelcomePromptProps {
  onComplete: () => void
  isLoading: boolean
}

const WelcomePrompt: React.FC<WelcomePromptProps> = ({ onComplete, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
    >
      <div id="particles-js"></div>

      <div className="text-center space-y-8 z-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center space-x-2 mb-6">
            <img src="/logo6.png" alt="Nepal Flag" className="w-16 h-16 rounded-full animate-pulse-glow" />
            <Heart className="w-8 h-8 text-red-500 animate-pulse" />
          </div>

          <h1 className="text-6xl font-bold neon-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Medicare Nepal
          </h1>

          <p className="text-2xl text-gray-300 font-light">Welcome, do you want to visit Medicare Nepal?</p>

          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Smart Health Diagnosis System</span>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-4"
        >
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-400 loading-dots">Loading your health companion</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onComplete}
                className="glow-button text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300"
              >
                ✅ Yes, Let's Go
              </button>

              <button
                onClick={() => window.history.back()}
                className="px-8 py-4 border-2 border-gray-600 rounded-lg text-gray-300 hover:border-gray-400 hover:text-white transition-all duration-300"
              >
                ❌ Not Now
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-sm text-gray-500"
        >
          <p>Trusted by doctors • Powered by advanced algorithms</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default WelcomePrompt
