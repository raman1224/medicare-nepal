"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, User, Heart } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const { t } = useTranslation()
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let success = false

      if (isLogin) {
        success = await login(formData.email, formData.password)
      } else {
        success = await signup(formData.name, formData.email, formData.password)
      }

      if (success) {
        toast.success(`Welcome to Medicare Nepal! 🎉`)
        navigate("/dashboard")
      } else {
        toast.error("Authentication failed. Please try again.")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-2xl border border-white/10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src="/g5.png" alt="Medicare Nepal" className="w-12 h-12 rounded-full animate-pulse-glow" />
              <Heart className="w-6 h-6 text-red-500 animate-pulse" />
            </div>

            <h2 className="text-3xl font-bold neon-text mb-2">{isLogin ? t("auth.login") : t("auth.signup")}</h2>

            <p className="text-gray-400">
              {isLogin ? "Welcome back to Medicare Nepal" : "Join the Medicare Nepal family"}
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex mb-8 glass rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${
                isLogin ? "bg-blue-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              {t("auth.login")}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${
                !isLogin ? "bg-blue-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              {t("auth.signup")}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t("auth.name")}
                  className="glow-input w-full pl-10 pr-4"
                  required={!isLogin}
                />
              </motion.div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t("auth.email")}
                className="glow-input w-full pl-10 pr-4"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t("auth.password")}
                className="glow-input w-full pl-10 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  {t("auth.forgotPassword")}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="glow-button w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : isLogin ? (
                t("auth.loginButton")
              ) : (
                t("auth.signupButton")
              )}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">{isLogin ? t("auth.switchToSignup") : t("auth.switchToLogin")}</p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Encrypted</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Private</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Auth
