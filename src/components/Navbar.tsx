"use client"

import type React from "react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Menu, X, Moon, Sun, User, LogOut } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import LanguageSelector from "./LanguageSelector"

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const navItems = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.symptomAnalyzer"), path: "/symptom-analyzer" },
    { name: t("nav.imageAnalyzer"), path: "/image-analyzer" },
    { name: t("nav.hospitals"), path: "/hospitals" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/g5.png" alt="Medicare Nepal" className="w-10 h-10 rounded-full animate-pulse-glow" />
            <span className="text-xl font-bold neon-text">Medicare Nepal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === item.path
                    ? "text-blue-400 bg-blue-400/10 glow"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg glass hover:bg-white/10 transition-all duration-300"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-400" />
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg glass hover:bg-white/10 transition-all duration-300"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block">{user.name}</span>
                </button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-lg border border-white/10"
                  >
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 rounded-t-lg"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>{t("nav.dashboard")}</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 rounded-b-lg w-full text-left text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t("nav.logout")}</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="glow-button px-4 py-2 text-sm">
                {t("nav.login")}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg glass hover:bg-white/10 transition-all duration-300"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 mt-4 pt-4 pb-4"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-lg mb-2 transition-all duration-300 ${
                  location.pathname === item.path
                    ? "text-blue-400 bg-blue-400/10"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar
