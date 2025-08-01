"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { ToastContainer } from "react-toastify"
import AOS from "aos"
import { io, Socket } from "socket.io-client"

// Components
import WelcomePrompt from "./components/WelcomePrompt"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import SymptomAnalyzer from "./pages/SymptomAnalyzer"
import ImageAnalyzer from "./pages/ImageAnalyzer"
import Hospitals from "./pages/Hospitals"
import ContactUs from "./pages/ContactUs"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsOfService from "./pages/TermsOfService"
import Footer from "./components/Footer"
import FireCursor from "./components/FireCursor"
import PWAInstallPrompt from "./components/PWAInstallPrompt"
import LoadingScreen from "./components/LoadingScreen"
import ErrorBoundary from "./components/ErrorBoundary"

// Context
import { AuthProvider, useAuth } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { SocketProvider } from "./context/SocketContext"
import { PWAProvider } from "./context/PWAContext"

// Utils
import { initParticles } from "./utils/particles"
import { registerSW } from "./utils/pwa"

// Styles
import "react-toastify/dist/ReactToastify.css"
import "aos/dist/aos.css"

// i18n
import "./i18n/config"

function AppContent() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isAppReady, setIsAppReady] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // AOS animation init
        AOS.init({
          duration: 1000,
          once: true,
          easing: "ease-out-cubic",
          offset: 100,
        })

        // Check welcome prompt
        const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")
        if (hasSeenWelcome) {
          setShowWelcome(false)
        }

        // Particles background
        await initParticles()

        // PWA service worker
        await registerSW()

        // Socket.IO init
        const socketConnection = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
          transports: ["websocket"],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })

        socketConnection.on("connect", () => {
          console.log("Connected to server")
          if (user) {
            socketConnection.emit("join", `user_${user.id}`)
          }
        })

        socketConnection.on("disconnect", () => {
          console.log("Disconnected from server")
        })

        socketConnection.on("reconnect", () => {
          console.log("Reconnected to server")
        })

        setSocket(socketConnection)
        setIsAppReady(true)

        return () => {
          socketConnection.disconnect()
        }
      } catch (error) {
        console.error("Failed to initialize app:", error)
        setIsAppReady(true) // Allow app to load even if some features fail
      }
    }

    initializeApp()
  }, [user])

  const handleWelcomeComplete = () => {
    setIsLoading(true)
    setTimeout(() => {
      setShowWelcome(false)
      setIsLoading(false)
      localStorage.setItem("hasSeenWelcome", "true")
    }, 1500)
  }

  if (!isAppReady) return <LoadingScreen />

  if (showWelcome) {
    return <WelcomePrompt onComplete={handleWelcomeComplete} isLoading={isLoading} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 fire-cursor">
      <div id="particles-js"></div>
      <FireCursor />

      <Router>
        <SocketProvider socket={socket}>
          <PWAProvider>
            <ErrorBoundary>
              <Navbar />

              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
                  <Route path="/symptom-analyzer" element={<SymptomAnalyzer />} />
                  <Route path="/scanner" element={<ImageAnalyzer />} />
                  <Route path="/image-analyzer" element={<Navigate to="/scanner" />} />
                  <Route path="/hospitals" element={<Hospitals />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </AnimatePresence>

              <Footer />
              <PWAInstallPrompt />
            </ErrorBoundary>
          </PWAProvider>
        </SocketProvider>
      </Router>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="glass"
        className="z-50"
      />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
