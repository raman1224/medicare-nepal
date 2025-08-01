import { Workbox } from "workbox-window"

export const registerSW = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const wb = new Workbox("/sw.js")
      
      wb.addEventListener("controlling", () => {
        window.location.reload()
      })

      wb.addEventListener("waiting", () => {
        // Show update available notification
        const updateAvailable = new CustomEvent("sw-update-available")
        window.dispatchEvent(updateAvailable)
      })

      await wb.register()
      console.log("Service Worker registered successfully")
    } catch (error) {
      console.error("Service Worker registration failed:", error)
    }
  }
}

export const checkForUpdates = async () => {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready
    registration.update()
  }
}

export const isInstalled = () => {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
  const isInWebAppiOS = (window.navigator as any).standalone === true
  return isStandalone || isInWebAppiOS
}

export const canInstall = () => {
  return !isInstalled() && "serviceWorker" in navigator
}
