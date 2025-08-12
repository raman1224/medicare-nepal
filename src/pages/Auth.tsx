"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Heart, Github } from "lucide-react"
import { FaGoogle } from "react-icons/fa"
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
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { t } = useTranslation()
  const { 
    currentUser, 
    login, 
    signup, 
    loginWithGoogle, 
    loginWithGithub, 
    resetPassword,
    loading: authLoading 
  } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard")
    }
  }, [currentUser, router])

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    // Name validation for signup
    if (!isLogin && !formData.name) {
      newErrors.name = "Name is required"
    }

    // Confirm password validation for signup
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await signup(formData.email, formData.password, formData.name)
      }
    } catch (error: any) {
      console.error("Authentication error:", error)
      toast.error(error.message || "Authentication failed. Please try again.")
    }
  }

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle()
    } catch (error: any) {
      console.error("Google sign in error:", error)
      toast.error(error.message || "Google sign-in failed. Please try again.")
    }
  }

  // Handle GitHub sign in
  const handleGithubSignIn = async () => {
    try {
      await loginWithGithub()
    } catch (error: any) {
      console.error("GitHub sign in error:", error)
      toast.error(error.message || "GitHub sign-in failed. Please try again.")
    }
  }

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address")
      return
    }

    try {
      await resetPassword(formData.email)
      toast.success("Password reset email sent!")
    } catch (error: any) {
      console.error("Password reset error:", error)
      toast.error(error.message || "Failed to send password reset email")
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-2xl border border-white/10 shadow-3d"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse-glow" />
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
              onClick={() => {
                setIsLogin(true)
                setErrors({})
                setFormData({ name: "", email: "", password: "", confirmPassword: "" })
              }}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${
                isLogin ? "bg-blue-500 text-white shadow-lg btn-3d-primary" : "text-gray-400 hover:text-white"
              }`}
            >
              {t("auth.login")}
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setErrors({})
                setFormData({ name: "", email: "", password: "", confirmPassword: "" })
              }}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${
                !isLogin ? "bg-blue-500 text-white shadow-lg btn-3d-primary" : "text-gray-400 hover:text-white"
              }`}
            >
              {t("auth.signup")}
            </button>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-600 rounded-lg hover:border-gray-500 hover:bg-white/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-3d-secondary"
            >
              <FaGoogle className="w-5 h-5 text-red-500" />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={handleGithubSignIn}
              disabled={authLoading}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-600 rounded-lg hover:border-gray-500 hover:bg-white/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-3d-secondary"
            >
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or continue with email</span>
            </div>
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
                  className={`glow-input w-full pl-10 pr-4 ${errors.name ? "border-red-500" : ""}`}
                  required={!isLogin}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
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
                className={`glow-input w-full pl-10 pr-4 ${errors.email ? "border-red-500" : ""}`}
                required
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
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
                className={`glow-input w-full pl-10 pr-12 ${errors.password ? "border-red-500" : ""}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className={`glow-input w-full pl-10 pr-4 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  required={!isLogin}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
              </motion.div>
            )}

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {t("auth.forgotPassword")}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="glow-button w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed btn-3d-primary"
            >
              {authLoading ? (
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
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Encrypted</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
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