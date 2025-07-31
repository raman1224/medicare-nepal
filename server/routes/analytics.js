import express from "express"
import Analytics from "../models/Analytics.js"
import SymptomAnalysis from "../models/SymptomAnalysis.js"
import MedicineAnalysis from "../models/MedicineAnalysis.js"
import User from "../models/User.js"
import Hospital from "../models/Hospital.js"
import Contact from "../models/Contact.js"
import { logger } from "../utils/logger.js"

const router = express.Router()

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Public
router.get("/dashboard", async (req, res) => {
  try {
    const { days = 30 } = req.query
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(days))

    // Get summary statistics
    const [totalUsers, totalSymptomAnalyses, totalMedicineAnalyses, totalHospitals, totalContacts, recentAnalytics] =
      await Promise.all([
        User.countDocuments(),
        SymptomAnalysis.countDocuments({ status: "completed" }),
        MedicineAnalysis.countDocuments({ status: "completed" }),
        Hospital.countDocuments({ isActive: true }),
        Contact.countDocuments(),
        Analytics.getDateRangeAnalytics(startDate, new Date()),
      ])

    // Calculate trends
    const previousPeriodStart = new Date(startDate)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - Number.parseInt(days))

    const [previousUsers, previousSymptomAnalyses, previousMedicineAnalyses] = await Promise.all([
      User.countDocuments({
        createdAt: {
          $gte: previousPeriodStart,
          $lt: startDate,
        },
      }),
      SymptomAnalysis.countDocuments({
        status: "completed",
        createdAt: {
          $gte: previousPeriodStart,
          $lt: startDate,
        },
      }),
      MedicineAnalysis.countDocuments({
        status: "completed",
        createdAt: {
          $gte: previousPeriodStart,
          $lt: startDate,
        },
      }),
    ])

    const currentUsers = await User.countDocuments({
      createdAt: { $gte: startDate },
    })
    const currentSymptomAnalyses = await SymptomAnalysis.countDocuments({
      status: "completed",
      createdAt: { $gte: startDate },
    })
    const currentMedicineAnalyses = await MedicineAnalysis.countDocuments({
      status: "completed",
      createdAt: { $gte: startDate },
    })

    // Calculate percentage changes
    const userTrend = previousUsers > 0 ? (((currentUsers - previousUsers) / previousUsers) * 100).toFixed(1) : 0
    const symptomTrend =
      previousSymptomAnalyses > 0
        ? (((currentSymptomAnalyses - previousSymptomAnalyses) / previousSymptomAnalyses) * 100).toFixed(1)
        : 0
    const medicineTrend =
      previousMedicineAnalyses > 0
        ? (((currentMedicineAnalyses - previousMedicineAnalyses) / previousMedicineAnalyses) * 100).toFixed(1)
        : 0

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers: {
            count: totalUsers,
            trend: `${userTrend > 0 ? "+" : ""}${userTrend}%`,
            isPositive: userTrend >= 0,
          },
          totalSymptomAnalyses: {
            count: totalSymptomAnalyses,
            trend: `${symptomTrend > 0 ? "+" : ""}${symptomTrend}%`,
            isPositive: symptomTrend >= 0,
          },
          totalMedicineAnalyses: {
            count: totalMedicineAnalyses,
            trend: `${medicineTrend > 0 ? "+" : ""}${medicineTrend}%`,
            isPositive: medicineTrend >= 0,
          },
          totalHospitals,
          totalContacts,
        },
        chartData: recentAnalytics,
        period: {
          days: Number.parseInt(days),
          startDate,
          endDate: new Date(),
        },
      },
    })
  } catch (error) {
    logger.error(`Get dashboard analytics error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/analytics/health-trends
// @desc    Get health trends data
// @access  Public
router.get("/health-trends", async (req, res) => {
  try {
    const { startYear = 2020, endYear = new Date().getFullYear() } = req.query

    // Generate yearly data from startYear to endYear
    const yearlyData = []

    for (let year = Number.parseInt(startYear); year <= Number.parseInt(endYear); year++) {
      const yearStart = new Date(year, 0, 1)
      const yearEnd = new Date(year, 11, 31, 23, 59, 59)

      const [symptomAnalyses, medicineAnalyses, newUsers] = await Promise.all([
        SymptomAnalysis.countDocuments({
          createdAt: { $gte: yearStart, $lte: yearEnd },
          status: "completed",
        }),
        MedicineAnalysis.countDocuments({
          createdAt: { $gte: yearStart, $lte: yearEnd },
          status: "completed",
        }),
        User.countDocuments({
          createdAt: { $gte: yearStart, $lte: yearEnd },
        }),
      ])

      // Simulate some health trend data for demonstration
      const sickPatients = Math.floor(symptomAnalyses * 0.7) // Assume 70% of analyses indicate illness
      const recoveredPatients = Math.floor(sickPatients * 0.85) // Assume 85% recovery rate

      yearlyData.push({
        year,
        sickPatients,
        recoveredPatients,
        totalUsers: newUsers,
        symptomAnalyses,
        medicineAnalyses,
      })
    }

    // Get common symptoms and conditions
    const [commonSymptoms, commonConditions] = await Promise.all([
      SymptomAnalysis.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: {
              $gte: new Date(new Date().getFullYear(), 0, 1), // This year
            },
          },
        },
        {
          $unwind: "$input.symptoms",
        },
        {
          $group: {
            _id: "$input.symptoms.name",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
      ]),
      SymptomAnalysis.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: {
              $gte: new Date(new Date().getFullYear(), 0, 1), // This year
            },
          },
        },
        {
          $unwind: "$analysis.possibleConditions",
        },
        {
          $group: {
            _id: "$analysis.possibleConditions.name",
            count: { $sum: 1 },
            avgProbability: { $avg: "$analysis.possibleConditions.probability" },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
      ]),
    ])

    // Get province-wise data
    const provinceData = await SymptomAnalysis.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1), // This year
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $group: {
          _id: "$userInfo.address.province",
          count: { $sum: 1 },
          avgRiskLevel: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ["$analysis.riskLevel", "low"] }, then: 1 },
                  { case: { $eq: ["$analysis.riskLevel", "medium"] }, then: 2 },
                  { case: { $eq: ["$analysis.riskLevel", "high"] }, then: 3 },
                  { case: { $eq: ["$analysis.riskLevel", "critical"] }, then: 4 },
                ],
                default: 1,
              },
            },
          },
        },
      },
      {
        $sort: { count: -1 },
      },
    ])

    res.json({
      success: true,
      data: {
        yearlyTrends: yearlyData,
        commonSymptoms,
        commonConditions,
        provinceData,
        metadata: {
          startYear: Number.parseInt(startYear),
          endYear: Number.parseInt(endYear),
          generatedAt: new Date(),
          totalYears: Number.parseInt(endYear) - Number.parseInt(startYear) + 1,
        },
      },
    })
  } catch (error) {
    logger.error(`Get health trends error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/analytics/real-time
// @desc    Get real-time analytics
// @access  Public
router.get("/real-time", async (req, res) => {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [todayAnalyses, last24HourAnalyses, activeUsers, ongoingAnalyses, systemHealth] = await Promise.all([
      SymptomAnalysis.countDocuments({
        createdAt: { $gte: todayStart },
        status: "completed",
      }),
      SymptomAnalysis.countDocuments({
        createdAt: { $gte: last24Hours },
        status: "completed",
      }),
      User.countDocuments({
        lastLogin: { $gte: last24Hours },
      }),
      SymptomAnalysis.countDocuments({
        status: "pending",
      }) +
        MedicineAnalysis.countDocuments({
          status: "pending",
        }),
      // System health metrics (simulated)
      Promise.resolve({
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      }),
    ])

    // Get hourly data for the last 24 hours
    const hourlyData = []
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000)
      hourStart.setMinutes(0, 0, 0)
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)

      const [symptomCount, medicineCount] = await Promise.all([
        SymptomAnalysis.countDocuments({
          createdAt: { $gte: hourStart, $lt: hourEnd },
          status: "completed",
        }),
        MedicineAnalysis.countDocuments({
          createdAt: { $gte: hourStart, $lt: hourEnd },
          status: "completed",
        }),
      ])

      hourlyData.push({
        hour: hourStart.getHours(),
        timestamp: hourStart,
        symptomAnalyses: symptomCount,
        medicineAnalyses: medicineCount,
        total: symptomCount + medicineCount,
      })
    }

    res.json({
      success: true,
      data: {
        liveStats: {
          todayAnalyses,
          last24HourAnalyses,
          activeUsers,
          ongoingAnalyses,
          systemUptime: Math.floor(systemHealth.uptime / 3600), // hours
          memoryUsage: Math.round(systemHealth.memoryUsage.used / 1024 / 1024), // MB
        },
        hourlyData,
        lastUpdated: now,
      },
    })
  } catch (error) {
    logger.error(`Get real-time analytics error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/analytics/user-engagement
// @desc    Get user engagement analytics
// @access  Public
router.get("/user-engagement", async (req, res) => {
  try {
    const { days = 30 } = req.query
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(days))

    // User activity patterns
    const userActivity = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          newUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [{ $gte: ["$lastLogin", startDate] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    // Feature usage
    const featureUsage = await Promise.all([
      SymptomAnalysis.countDocuments({
        createdAt: { $gte: startDate },
        status: "completed",
      }),
      MedicineAnalysis.countDocuments({
        createdAt: { $gte: startDate },
        status: "completed",
      }),
      Hospital.aggregate([
        {
          $unwind: "$reviews",
        },
        {
          $match: {
            "reviews.createdAt": { $gte: startDate },
          },
        },
        {
          $count: "hospitalInteractions",
        },
      ]),
      Contact.countDocuments({
        createdAt: { $gte: startDate },
      }),
    ])

    // Language preferences
    const languageStats = await User.aggregate([
      {
        $group: {
          _id: "$preferences.language",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ])

    // Device usage (simulated data)
    const deviceStats = [
      { device: "Mobile", count: Math.floor(Math.random() * 1000) + 500, percentage: 65 },
      { device: "Desktop", count: Math.floor(Math.random() * 500) + 200, percentage: 25 },
      { device: "Tablet", count: Math.floor(Math.random() * 200) + 50, percentage: 10 },
    ]

    res.json({
      success: true,
      data: {
        userActivity,
        featureUsage: {
          symptomAnalyses: featureUsage[0],
          medicineAnalyses: featureUsage[1],
          hospitalInteractions: featureUsage[2][0]?.hospitalInteractions || 0,
          contactSubmissions: featureUsage[3],
        },
        languageStats,
        deviceStats,
        period: {
          days: Number.parseInt(days),
          startDate,
          endDate: new Date(),
        },
      },
    })
  } catch (error) {
    logger.error(`Get user engagement error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/analytics/track-event
// @desc    Track custom analytics event
// @access  Public
router.post("/track-event", async (req, res) => {
  try {
    const { event, data, userId } = req.body

    // Log the event (in a real app, you'd store this in a dedicated analytics collection)
    logger.info(`Analytics event: ${event}`, {
      event,
      data,
      userId,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.json({
      success: true,
      message: "Event tracked successfully",
    })
  } catch (error) {
    logger.error(`Track event error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

export default router
