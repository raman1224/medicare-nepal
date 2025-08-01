import mongoose from "mongoose"

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow anonymous analytics
    },
    sessionId: {
      type: String,
      required: true,
    },
    event: {
      type: String,
      required: true,
      enum: [
        "page_view",
        "symptom_analysis",
        "medicine_analysis",
        "hospital_search",
        "user_registration",
        "user_login",
        "contact_form",
        "download_report",
        "share_result",
        "voice_command",
        "image_upload",
        "search_query",
        "feature_usage",
        "error_occurred",
        "performance_metric",
      ],
    },
    page: {
      type: String,
      required: function () {
        return this.event === "page_view"
      },
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    device: {
      type: {
        type: String,
        enum: ["desktop", "mobile", "tablet", "unknown"],
        default: "unknown",
      },
      os: String,
      browser: String,
      version: String,
    },
    referrer: {
      type: String,
    },
    duration: {
      type: Number, // in milliseconds
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for better query performance
analyticsSchema.index({ sessionId: 1 })
analyticsSchema.index({ userId: 1 })
analyticsSchema.index({ event: 1 })
analyticsSchema.index({ timestamp: -1 })
analyticsSchema.index({ "device.type": 1 })
analyticsSchema.index({ country: 1 })

const Analytics = mongoose.model("Analytics", analyticsSchema)

export default Analytics
