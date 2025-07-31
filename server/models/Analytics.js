import mongoose from "mongoose"

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    users: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      returning: { type: Number, default: 0 },
    },
    symptomAnalyses: {
      total: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      byRiskLevel: {
        low: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        high: { type: Number, default: 0 },
        critical: { type: Number, default: 0 },
      },
      avgConfidence: { type: Number, default: 0 },
      avgProcessingTime: { type: Number, default: 0 },
    },
    medicineAnalyses: {
      total: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      avgConfidence: { type: Number, default: 0 },
      avgProcessingTime: { type: Number, default: 0 },
    },
    hospitalSearches: {
      total: { type: Number, default: 0 },
      byProvince: [
        {
          province: String,
          count: Number,
        },
      ],
      byDepartment: [
        {
          department: String,
          count: Number,
        },
      ],
    },
    contacts: {
      total: { type: Number, default: 0 },
      resolved: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      byCategory: [
        {
          category: String,
          count: Number,
        },
      ],
    },
    performance: {
      avgResponseTime: { type: Number, default: 0 },
      uptime: { type: Number, default: 100 },
      errorRate: { type: Number, default: 0 },
      apiCalls: { type: Number, default: 0 },
    },
    geography: {
      byCountry: [
        {
          country: String,
          count: Number,
        },
      ],
      byRegion: [
        {
          region: String,
          count: Number,
        },
      ],
      byCity: [
        {
          city: String,
          count: Number,
        },
      ],
    },
    devices: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
    },
    browsers: [
      {
        name: String,
        count: Number,
        percentage: Number,
      },
    ],
    languages: [
      {
        code: String,
        name: String,
        count: Number,
        percentage: Number,
      },
    ],
    healthTrends: {
      commonSymptoms: [
        {
          symptom: String,
          count: Number,
          trend: String, // 'increasing', 'decreasing', 'stable'
        },
      ],
      commonMedicines: [
        {
          medicine: String,
          count: Number,
          trend: String,
        },
      ],
      seasonalPatterns: [
        {
          condition: String,
          season: String,
          prevalence: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
analyticsSchema.index({ date: -1 })
analyticsSchema.index({ "users.total": -1 })
analyticsSchema.index({ "symptomAnalyses.total": -1 })

// Static method to get date range analytics
analyticsSchema.statics.getDateRangeAnalytics = function (startDate, endDate) {
  return this.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  }).sort({ date: 1 })
}

// Static method to get summary statistics
analyticsSchema.statics.getSummary = function (days = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: "$users.total" },
        totalSymptomAnalyses: { $sum: "$symptomAnalyses.total" },
        totalMedicineAnalyses: { $sum: "$medicineAnalyses.total" },
        totalHospitalSearches: { $sum: "$hospitalSearches.total" },
        totalContacts: { $sum: "$contacts.total" },
        avgConfidence: { $avg: "$symptomAnalyses.avgConfidence" },
        avgUptime: { $avg: "$performance.uptime" },
      },
    },
  ])
}

// Method to update daily analytics
analyticsSchema.statics.updateDailyAnalytics = async function (date = new Date()) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  // This would typically aggregate data from other collections
  // Implementation would depend on your specific analytics requirements

  return this.findOneAndUpdate(
    { date: startOfDay },
    {
      $set: {
        // Analytics data would be calculated here
        lastUpdated: new Date(),
      },
    },
    { upsert: true, new: true },
  )
}

export default mongoose.model("Analytics", analyticsSchema)
