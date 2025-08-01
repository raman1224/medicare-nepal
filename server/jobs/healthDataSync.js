import cron from "node-cron"
import { logger } from "../utils/logger.js"
import Analytics from "../models/Analytics.js"
import SymptomAnalysis from "../models/SymptomAnalysis.js"
import MedicineAnalysis from "../models/MedicineAnalysis.js"
import Hospital from "../models/Hospital.js"
import User from "../models/User.js"

// Run every hour to update analytics
cron.schedule("0 * * * *", async () => {
  try {
    logger.info("Starting hourly analytics update...")

    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get symptom analysis stats
    const symptomStats = await SymptomAnalysis.aggregate([
      {
        $facet: {
          hourly: [{ $match: { createdAt: { $gte: oneHourAgo } } }, { $count: "count" }],
          daily: [{ $match: { createdAt: { $gte: oneDayAgo } } }, { $count: "count" }],
          weekly: [{ $match: { createdAt: { $gte: oneWeekAgo } } }, { $count: "count" }],
          monthly: [{ $match: { createdAt: { $gte: oneMonthAgo } } }, { $count: "count" }],
          topSymptoms: [
            { $match: { createdAt: { $gte: oneWeekAgo } } },
            { $unwind: "$symptoms" },
            { $group: { _id: "$symptoms", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          severityDistribution: [
            { $match: { createdAt: { $gte: oneWeekAgo } } },
            { $group: { _id: "$result.riskLevel", count: { $sum: 1 } } },
          ],
        },
      },
    ])

    // Get medicine analysis stats
    const medicineStats = await MedicineAnalysis.aggregate([
      {
        $facet: {
          hourly: [{ $match: { createdAt: { $gte: oneHourAgo } } }, { $count: "count" }],
          daily: [{ $match: { createdAt: { $gte: oneDayAgo } } }, { $count: "count" }],
          weekly: [{ $match: { createdAt: { $gte: oneWeekAgo } } }, { $count: "count" }],
          monthly: [{ $match: { createdAt: { $gte: oneMonthAgo } } }, { $count: "count" }],
          topMedicines: [
            { $match: { createdAt: { $gte: oneWeekAgo } } },
            { $group: { _id: "$result.medicine.name", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
        },
      },
    ])

    // Get user stats
    const userStats = await User.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          newToday: [{ $match: { createdAt: { $gte: oneDayAgo } } }, { $count: "count" }],
          newThisWeek: [{ $match: { createdAt: { $gte: oneWeekAgo } } }, { $count: "count" }],
          activeToday: [{ $match: { lastLogin: { $gte: oneDayAgo } } }, { $count: "count" }],
          byProvince: [
            { $match: { "address.province": { $exists: true } } },
            { $group: { _id: "$address.province", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
        },
      },
    ])

    // Update analytics document
    await Analytics.findOneAndUpdate(
      {},
      {
        $set: {
          lastUpdated: now,
          symptoms: {
            hourly: symptomStats[0].hourly[0]?.count || 0,
            daily: symptomStats[0].daily[0]?.count || 0,
            weekly: symptomStats[0].weekly[0]?.count || 0,
            monthly: symptomStats[0].monthly[0]?.count || 0,
            topSymptoms: symptomStats[0].topSymptoms,
            severityDistribution: symptomStats[0].severityDistribution,
          },
          medicines: {
            hourly: medicineStats[0].hourly[0]?.count || 0,
            daily: medicineStats[0].daily[0]?.count || 0,
            weekly: medicineStats[0].weekly[0]?.count || 0,
            monthly: medicineStats[0].monthly[0]?.count || 0,
            topMedicines: medicineStats[0].topMedicines,
          },
          users: {
            total: userStats[0].total[0]?.count || 0,
            newToday: userStats[0].newToday[0]?.count || 0,
            newThisWeek: userStats[0].newThisWeek[0]?.count || 0,
            activeToday: userStats[0].activeToday[0]?.count || 0,
            byProvince: userStats[0].byProvince,
          },
        },
      },
      { upsert: true },
    )

    logger.info("Hourly analytics update completed successfully")
  } catch (error) {
    logger.error(`Hourly analytics update failed: ${error.message}`)
  }
})

// Run daily at midnight to generate health trends
cron.schedule("0 0 * * *", async () => {
  try {
    logger.info("Starting daily health trends update...")

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Generate daily health trends for the past 30 days
    const dailyTrends = await SymptomAnalysis.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalAnalyses: { $sum: 1 },
          avgConfidence: { $avg: "$result.confidence" },
          riskLevels: {
            $push: "$result.riskLevel",
          },
        },
      },
      {
        $addFields: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          lowRisk: {
            $size: {
              $filter: {
                input: "$riskLevels",
                cond: { $eq: ["$$this", "low"] },
              },
            },
          },
          mediumRisk: {
            $size: {
              $filter: {
                input: "$riskLevels",
                cond: { $eq: ["$$this", "medium"] },
              },
            },
          },
          highRisk: {
            $size: {
              $filter: {
                input: "$riskLevels",
                cond: { $eq: ["$$this", "high"] },
              },
            },
          },
          criticalRisk: {
            $size: {
              $filter: {
                input: "$riskLevels",
                cond: { $eq: ["$$this", "critical"] },
              },
            },
          },
        },
      },
      {
        $sort: { date: 1 },
      },
    ])

    // Update analytics with health trends
    await Analytics.findOneAndUpdate(
      {},
      {
        $set: {
          "healthTrends.daily": dailyTrends,
          "healthTrends.lastUpdated": now,
        },
      },
      { upsert: true },
    )

    logger.info("Daily health trends update completed successfully")
  } catch (error) {
    logger.error(`Daily health trends update failed: ${error.message}`)
  }
})

// Run weekly to clean up old data
cron.schedule("0 0 * * 0", async () => {
  try {
    logger.info("Starting weekly data cleanup...")

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Clean up old symptom analyses (keep only last 6 months)
    const deletedSymptoms = await SymptomAnalysis.deleteMany({
      createdAt: { $lt: sixMonthsAgo },
    })

    // Clean up old medicine analyses (keep only last 6 months)
    const deletedMedicines = await MedicineAnalysis.deleteMany({
      createdAt: { $lt: sixMonthsAgo },
    })

    // Clean up old user activities (keep only last 3 months)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    await User.updateMany(
      {},
      {
        $pull: {
          activityLog: {
            timestamp: { $lt: threeMonthsAgo },
          },
        },
      },
    )

    logger.info(
      `Weekly cleanup completed: ${deletedSymptoms.deletedCount} symptom analyses, ${deletedMedicines.deletedCount} medicine analyses deleted`,
    )
  } catch (error) {
    logger.error(`Weekly data cleanup failed: ${error.message}`)
  }
})

// Run monthly to update hospital data
cron.schedule("0 0 1 * *", async () => {
  try {
    logger.info("Starting monthly hospital data update...")

    // This would typically fetch updated hospital data from external sources
    // For now, we'll just update the lastUpdated timestamp
    await Hospital.updateMany(
      {},
      {
        $set: {
          lastUpdated: new Date(),
        },
      },
    )

    logger.info("Monthly hospital data update completed")
  } catch (error) {
    logger.error(`Monthly hospital data update failed: ${error.message}`)
  }
})

logger.info("Health data sync cron jobs initialized")
