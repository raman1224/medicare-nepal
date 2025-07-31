"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, LogIn, UserPlus } from "lucide-react"
import { Link } from "react-router-dom"

interface LoginPromptProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

const LoginPrompt = ({ isOpen, onClose, message }: LoginPromptProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: -10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: -10 }}
            className="glass p-8 rounded-2xl max-w-md w-full border border-white/10 shadow-3d modal-3d active"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold neon-text">🔐 Login Required</h2>
              <button onClick={onClose} className="p-2 rounded-lg glass hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-300">
                {message || "Please login to access this feature and get personalized recommendations."}
              </p>

              <div className="p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-400">✨ Benefits of logging in:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 📊 Personalized health analysis</li>
                  <li>• 📈 Track your health history</li>
                  <li>• 🔔 Get follow-up reminders</li>
                  <li>• 💾 Save your analysis results</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/auth"
                onClick={onClose}
                className="flex-1 flex items-center justify-center space-x-2 glow-button py-3 btn-3d-primary"
              >
                <LogIn className="w-4 h-4" />
                <span>🚀 Login</span>
              </Link>

              <Link
                to="/auth"
                onClick={onClose}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-600 rounded-lg text-gray-300 hover:border-gray-400 hover:text-white transition-all duration-300 btn-3d-success"
              >
                <UserPlus className="w-4 h-4" />
                <span>📝 Sign Up</span>
              </Link>
            </div>

            <div className="mt-4 text-center">
              <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
                ❌ Continue without login
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default LoginPrompt
