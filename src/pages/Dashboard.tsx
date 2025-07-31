"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, Camera, MapPin, Users, TrendingUp, Clock, Heart, AlertCircle, CheckCircle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../context/AuthContext"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const Dashboard: React.FC = () => {
  useTranslation()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalChecks: 0,
    todayChecks: 0,
    totalUsers: 50000,
    accuracy: 99.9,
  })

  const [healthData] = useState([
    { date: "2024-01-01", checks: 12, accuracy: 98 },
    { date: "2024-01-02", checks: 19, accuracy: 99 },
    { date: "2024-01-03", checks: 15, accuracy: 97 },
    { date: "2024-01-04", checks: 22, accuracy: 99.5 },
    { date: "2024-01-05", checks: 18, accuracy: 98.5 },
    { date: "2024-01-06", checks: 25, accuracy: 99.2 },
    { date: "2024-01-07", checks: 20, accuracy: 99.8 },
  ])

  const [recentActivity] = useState([
    { id: 1, type: "symptom", description: "Fever and headache analysis", time: "2 hours ago", status: "completed" },
    { id: 2, type: "medicine", description: "Paracetamol image scan", time: "5 hours ago", status: "completed" },
    { id: 3, type: "hospital", description: "Found nearby hospitals", time: "1 day ago", status: "completed" },
    { id: 4, type: "symptom", description: "Cough and cold check", time: "2 days ago", status: "completed" },
  ])

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        totalChecks: Math.floor(Math.random() * 100) + 50,
        todayChecks: Math.floor(Math.random() * 10) + 1,
        totalUsers: 50000 + Math.floor(Math.random() * 1000),
        accuracy: 99.9,
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const dashboardCards = [
    {
      title: "Total Health Checks",
      value: stats.totalChecks,
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      change: "+12%",
    },
    {
      title: "Today's Checks",
      value: stats.todayChecks,
      icon: Clock,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      change: "+5%",
    },
    {
      title: "Accuracy Rate",
      value: `${stats.accuracy}%`,
      icon: CheckCircle,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      change: "+0.1%",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-pink-400",
      bgColor: "bg-pink-400/10",
      change: "+8%",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "symptom":
        return Activity
      case "medicine":
        return Camera
      case "hospital":
        return MapPin
      default:
        return AlertCircle
    }
  }

  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <img src="/g5.png" alt="Nepal Flag" className="w-12 h-12 rounded-full animate-pulse-glow" />
            <div>
              <h1 className="text-3xl font-bold neon-text">Welcome back, {user?.name}! 👋</h1>
              <p className="text-gray-400">Here's your health dashboard overview</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <span className="text-sm text-green-400 font-medium">{card.change}</span>
              </div>

              <h3 className="text-2xl font-bold mb-1">{card.value}</h3>
              <p className="text-gray-400 text-sm">{card.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Health Checks Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Health Checks Trend</span>
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="checks"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Accuracy Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Accuracy Rate</span>
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="accuracy" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-400" />
            <span>Recent Activity</span>
          </h3>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type)
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center space-x-4 p-4 glass rounded-lg hover:bg-white/5 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-blue-400/10 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-blue-400" />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-400">{activity.time}</p>
                  </div>

                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-400 capitalize">{activity.status}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="/symptom-analyzer"
              className="glass p-6 rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 group"
            >
              <Activity className="w-8 h-8 text-red-400 mb-4 group-hover:animate-pulse" />
              <h4 className="font-semibold mb-2">Symptom Check</h4>
              <p className="text-gray-400 text-sm">Analyze your symptoms instantly</p>
            </a>

            <a
              href="/image-analyzer"
              className="glass p-6 rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 group"
            >
              <Camera className="w-8 h-8 text-green-400 mb-4 group-hover:animate-pulse" />
              <h4 className="font-semibold mb-2">Medicine Scanner</h4>
              <p className="text-gray-400 text-sm">Scan medicine for details</p>
            </a>

            <a
              href="/hospitals"
              className="glass p-6 rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 group"
            >
              <MapPin className="w-8 h-8 text-blue-400 mb-4 group-hover:animate-pulse" />
              <h4 className="font-semibold mb-2">Find Hospitals</h4>
              <p className="text-gray-400 text-sm">Locate nearby healthcare</p>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
