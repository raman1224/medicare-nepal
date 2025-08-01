"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, LogIn, UserPlus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

interface LoginPromptProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

const LoginPrompt = ({ isOpen, onClose, message }: LoginPromptProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLogin = () => {
    onClose()
    navigate("/auth")
  }

  const handleContinueWithoutLogin = () => {
    onClose()
    // Continue with limited functionality
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateX: -10 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateX: -10 }}
            className="relative glass p-6 rounded-xl max-w-md w-full shadow-3d modal-3d active"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
              <p className="text-gray-400">
                {message || "Please login to access this feature and get personalized health recommendations."}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleLogin}
                className="w-full glow-button btn-3d-primary flex items-center justify-center space-x-2 py-3"
              >
                <LogIn className="w-5 h-5" />
                <span>{t("auth.login")}</span>
              </button>

              <button
                onClick={handleLogin}
                className="w-full glass border border-white/20 hover:border-white/40 transition-colors rounded-lg py-3 flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>{t("auth.signup")}</span>
              </button>

              <button
                onClick={handleContinueWithoutLogin}
                className="w-full text-gray-400 hover:text-white transition-colors py-2 text-sm"
              >
                Continue without login (limited features)
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Fast</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Private</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default LoginPrompt
