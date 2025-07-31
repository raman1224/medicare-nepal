import cron from "node-cron"
import Analytics from "../models/Analytics.js"
import SymptomAnalysis from "../models/SymptomAnalysis.js"
import MedicineAnalysis from "../models/MedicineAnalysis.js"
import User from "../models/User.js"
import Contact from "../models/Contact.js"
import { logger } from "../utils/logger.js"

// Run daily at midnight to sync analytics data
cron.schedule("0 0 * * *", async () => {
  try {
    logger.info("Starting daily health data sync...")

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get daily statistics
    const [totalUsers, newUsers, activeUsers, symptomAnalyses, medicineAnalyses, hospitalSearches, contacts] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({
          createdAt: { $gte: today, $lt: tomorrow },
        }),
        User.countDocuments({
          lastLogin: { $gte: today, $lt: tomorrow },
        }),
        SymptomAnalysis.aggregate([
          {
            $match: {
              createdAt: { $gte: today, $lt: tomorrow },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
              },
              failed: {
                $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
              },
              avgConfidence: { $avg: "$confidence" },
              avgProcessingTime: { $avg: "$processingTime" },
              byRiskLevel: {
                $push: {
                  riskLevel: "$analysis.riskLevel",
                  count: 1,
                },
              },
            },
          },
        ]),
        MedicineAnalysis.aggregate([
          {
            $match: {
              createdAt: { $gte: today, $lt: tomorrow },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
              },
              failed: {
                $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
              },
              avgConfidence: { $avg: "$confidence" },
              avgProcessingTime: { $avg: "$processingTime" },
            },
          },
        ]),
        // Simulate hospital searches (would be actual data in production)
        Promise.resolve([
          {
            total: Math.floor(Math.random() * 100) + 50,
            byProvince: [
              { province: "Bagmati", count: Math.floor(Math.random() * 30) + 20 },
              { province: "Gandaki", count: Math.floor(Math.random() * 20) + 10 },
              { province: "Koshi", count: Math.floor(Math.random() * 15) + 5 },
            ],
          },
        ]),
        Contact.aggregate([
          {
            $match: {
              createdAt: { $gte: today, $lt: tomorrow },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              resolved: {
                $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
              },
              pending: {
                $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] },
              },
              byCategory: {
                $push: {
                  category: "$category",
                  count: 1,
                },
              },
            },
          },
        ]),
      ])

    // Process risk level data
    const riskLevelCounts = { low: 0, medium: 0, high: 0, critical: 0 }
    if (symptomAnalyses[0]?.byRiskLevel) {
      symptomAnalyses[0].byRiskLevel.forEach((item) => {
        if (riskLevelCounts.hasOwnProperty(item.riskLevel)) {
          riskLevelCounts[item.riskLevel]++
        }
      })
    }

    // Create or update analytics record
    await Analytics.findOneAndUpdate(
      { date: today },
      {
        $set: {
          users: {
            total: totalUsers,
            new: newUsers,
            active: activeUsers,
            returning: activeUsers - newUsers,
          },
          symptomAnalyses: {
            total: symptomAnalyses[0]?.total || 0,
            completed: symptomAnalyses[0]?.completed || 0,
            failed: symptomAnalyses[0]?.failed || 0,
            byRiskLevel: riskLevelCounts,
            avgConfidence: symptomAnalyses[0]?.avgConfidence || 0,
            avgProcessingTime: symptomAnalyses[0]?.avgProcessingTime || 0,
          },
          medicineAnalyses: {
            total: medicineAnalyses[0]?.total || 0,
            completed: medicineAnalyses[0]?.completed || 0,
            failed: medicineAnalyses[0]?.failed || 0,
            avgConfidence: medicineAnalyses[0]?.avgConfidence || 0,
            avgProcessingTime: medicineAnalyses[0]?.avgProcessingTime || 0,
          },
          hospitalSearches: {
            total: hospitalSearches[0]?.total || 0,
            byProvince: hospitalSearches[0]?.byProvince || [],
          },
          contacts: {
            total: contacts[0]?.total || 0,
            resolved: contacts[0]?.resolved || 0,
            pending: contacts[0]?.pending || 0,
            byCategory: contacts[0]?.byCategory || [],
          },
          performance: {
            avgResponseTime: Math.random() * 200 + 100, // Simulated
            uptime: 99.9,
            errorRate: Math.random() * 2,
            apiCalls: (symptomAnalyses[0]?.total || 0) + (medicineAnalyses[0]?.total || 0),
          },
        },
      },
      { upsert: true, new: true },
    )

    logger.info("Daily health data sync completed successfully")
  } catch (error) {
    logger.error(`Health data sync error: ${error.message}`)
  }
})

// Run hourly to update real-time statistics
cron.schedule("0 * * * *", async () => {
  try {
    logger.info("Updating hourly statistics...")

    const now = new Date()
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // Update real-time metrics
    const hourlyStats = await Promise.all([
      SymptomAnalysis.countDocuments({
        createdAt: { $gte: hourAgo },
        status: "completed",
      }),
      MedicineAnalysis.countDocuments({
        createdAt: { $gte: hourAgo },
        status: "completed",
      }),
      User.countDocuments({
        lastLogin: { $gte: hourAgo },
      }),
    ])

    // Store in cache or emit via socket for real-time updates
    // This would typically be stored in Redis or similar cache
    logger.info(
      `Hourly stats - Symptoms: ${hourlyStats[0]}, Medicines: ${hourlyStats[1]}, Active Users: ${hourlyStats[2]}`,
    )
  } catch (error) {
    logger.error(`Hourly stats update error: ${error.message}`)
  }
})

logger.info("Health data sync jobs initialized")
