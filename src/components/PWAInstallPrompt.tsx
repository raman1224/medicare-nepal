"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X, Smartphone } from "lucide-react"

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Check if user has dismissed the prompt before
      const dismissed = localStorage.getItem("pwa-install-dismissed")
      if (!dismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowPrompt(false)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-dismissed", "true")

    // Show again after 7 days
    setTimeout(
      () => {
        localStorage.removeItem("pwa-install-dismissed")
      },
      7 * 24 * 60 * 60 * 1000,
    )
  }

  if (!showPrompt && !isIOS) return null

  return (
    <AnimatePresence>
      {(showPrompt || isIOS) && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
        >
          <div className="glass rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm mb-1">Install Medicare Nepal</h3>
                <p className="text-gray-400 text-xs mb-3">
                  {isIOS
                    ? "Add to your home screen for quick access. Tap the share button and select 'Add to Home Screen'."
                    : "Install our app for a better experience with offline access and notifications."}
                </p>

                <div className="flex gap-2">
                  {!isIOS && (
                    <button
                      onClick={handleInstall}
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Install
                    </button>
                  )}

                  <button
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-md transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>

              <button onClick={handleDismiss} className="text-gray-400 hover:text-white p-1 -mt-1 -mr-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PWAInstallPrompt
