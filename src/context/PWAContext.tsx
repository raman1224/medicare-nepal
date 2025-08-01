"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface PWAContextType {
  isInstalled: boolean
  isOnline: boolean
  updateAvailable: boolean
  installPrompt: any
  updateApp: () => void
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export const usePWA = () => {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider")
  }
  return context
}

interface PWAProviderProps {
  children: ReactNode
}

export const PWAProvider = ({ children }: PWAProviderProps) => {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    checkInstalled()

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    // Check for service worker updates
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const updateApp = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" })
      window.location.reload()
    }
  }

  return (
    <PWAContext.Provider
      value={{
        isInstalled,
        isOnline,
        updateAvailable,
        installPrompt,
        updateApp,
      }}
    >
      {children}
    </PWAContext.Provider>
  )
}
