"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { ToastContainer } from "react-toastify"
import AOS from "aos"
import { io, Socket } from "socket.io-client" // ✅ Import Socket

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

// Context
import { AuthProvider, useAuth } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { SocketProvider } from "./context/SocketContext"

// Utils
import { initParticles } from "./utils/particles"

// Styles
import "react-toastify/dist/ReactToastify.css"
import "aos/dist/aos.css"

function AppContent() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // ✅ Type socket as Socket or null
  const [socket, setSocket] = useState<Socket | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    })

    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")
    if (hasSeenWelcome) {
      setShowWelcome(false)
    }

    initParticles()

    const socketConnection = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      transports: ["websocket"],
      autoConnect: true,
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

    setSocket(socketConnection) // ✅ Now valid

    return () => {
      socketConnection.disconnect()
    }
  }, [user])

  const handleWelcomeComplete = () => {
    setIsLoading(true)
    setTimeout(() => {
      setShowWelcome(false)
      setIsLoading(false)
      localStorage.setItem("hasSeenWelcome", "true")
    }, 1500)
  }

  if (showWelcome) {
    return <WelcomePrompt onComplete={handleWelcomeComplete} isLoading={isLoading} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 fire-cursor">
      <div id="particles-js"></div>
      <FireCursor />

      <Router>
        <SocketProvider socket={socket}>
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
              <Route path="/symptom-analyzer" element={<SymptomAnalyzer />} />
              <Route path="/image-analyzer" element={<ImageAnalyzer />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
            </Routes>
          </AnimatePresence>
          <Footer />
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
