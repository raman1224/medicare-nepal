"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X } from 'lucide-react'
import { useTranslation } from "react-i18next"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

const PWAInstallPrompt = () => {
  const { t } = useTranslation()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt after 30 seconds if not dismissed
      setTimeout(() => {
        const dismissed = localStorage.getItem("pwa-install-dismissed")
        if (!dismissed && !isInstalled) {
          setShowPrompt(true)
        }
      }, 30000)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      localStorage.setItem("pwa-installed", "true")
    }

    // Check if already installed
    const installed = localStorage.getItem("pwa-installed")
    if (installed) {
      setIsInstalled(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === "accepted") {
        setIsInstalled(true)
        localStorage.setItem("pwa-installed", "true")
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error("Error installing PWA:", error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  if (isInstalled || !deferredPrompt) return null

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="install-prompt fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-96 z-50"
        >
          <div className="glass p-4 rounded-xl border border-white/20 shadow-3d">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Medicare Nepal</h3>
                  <p className="text-sm text-gray-300">{t("pwa.installPrompt")}</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="flex-1 glow-button btn-3d-primary text-sm py-2 px-4"
              >
                {t("pwa.install")}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                {t("pwa.dismiss")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PWAInstallPrompt
