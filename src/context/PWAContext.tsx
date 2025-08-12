"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface PWAContextType {
  isInstallable: boolean
  isInstalled: boolean
  installPrompt: any
  showInstallPrompt: () => void
  hideInstallPrompt: () => void
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export const usePWA = () => {
  const context = useContext(PWAContext)
  if (context === undefined) {
    throw new Error("usePWA must be used within a PWAProvider")
  }
  return context
}

interface PWAProviderProps {
  children: ReactNode
}

export const PWAProvider = ({ children }: PWAProviderProps) => {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsInstallable(true)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setInstallPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const showInstallPrompt = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === "accepted") {
        setIsInstallable(false)
        setInstallPrompt(null)
      }
    }
  }

  const hideInstallPrompt = () => {
    setIsInstallable(false)
    setInstallPrompt(null)
  }

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        installPrompt,
        showInstallPrompt,
        hideInstallPrompt,
      }}
    >
      {children}
    </PWAContext.Provider>
  )
}
