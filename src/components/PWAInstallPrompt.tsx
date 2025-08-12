"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X, Smartphone } from "lucide-react"
import { usePWA } from "../context/PWAContext"

const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, showInstallPrompt, hideInstallPrompt } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Show prompt after 30 seconds if installable and not dismissed
    const timer = setTimeout(() => {
      if (isInstallable && !isInstalled && !dismissed) {
        setShowPrompt(true)
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [isInstallable, isInstalled, dismissed])

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const hasBeenDismissed = localStorage.getItem("pwa-install-dismissed")
    if (hasBeenDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleInstall = async () => {
    await showInstallPrompt()
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem("pwa-install-dismissed", "true")
    hideInstallPrompt()
  }

  if (!isInstallable || isInstalled || dismissed) {
    return null
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="glass rounded-lg p-4 shadow-2xl border border-white/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-white">Install Medicare Nepal</h3>
              </div>
              <button onClick={handleDismiss} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-gray-300 text-sm mb-4">
              Install our app for faster access, offline support, and a better experience!
            </p>

            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="flex-1 glow-button flex items-center justify-center space-x-2 py-2 px-4 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Install App</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PWAInstallPrompt
