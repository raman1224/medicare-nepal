import mongoose from "mongoose"

const symptomAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    input: {
      symptoms: [
        {
          name: String,
          severity: {
            type: Number,
            min: 1,
            max: 10,
          },
          duration: String,
          description: String,
        },
      ],
      temperature: {
        value: Number,
        unit: {
          type: String,
          enum: ["C", "F"],
          default: "C",
        },
      },
      emotions: [String],
      additionalInfo: String,
      images: [
        {
          url: String,
          description: String,
          analysisResult: String,
        },
      ],
      voiceInput: {
        transcript: String,
        confidence: Number,
        language: String,
      },
    },
    analysis: {
      possibleConditions: [
        {
          name: String,
          nameNepali: String,
          nameHindi: String,
          probability: {
            type: Number,
            min: 0,
            max: 100,
          },
          severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
          },
          description: String,
          symptoms: [String],
          causes: [String],
          riskFactors: [String],
        },
      ],
      recommendations: {
        immediateActions: [String],
        medicines: [
          {
            name: String,
            genericName: String,
            dosage: String,
            frequency: String,
            duration: String,
            instructions: String,
            sideEffects: [String],
            contraindications: [String],
            price: {
              min: Number,
              max: Number,
              currency: { type: String, default: "NPR" },
            },
            alternatives: [String],
            image: String,
          },
        ],
        homeRemedies: [
          {
            name: String,
            description: String,
            ingredients: [String],
            preparation: String,
            usage: String,
            precautions: [String],
          },
        ],
        lifestyle: {
          diet: {
            recommended: [String],
            avoid: [String],
            supplements: [String],
          },
          exercise: {
            recommended: [String],
            avoid: [String],
            duration: String,
          },
          sleep: {
            duration: String,
            position: String,
            environment: [String],
          },
        },
        followUp: {
          timeframe: String,
          symptoms: [String],
          tests: [String],
        },
      },
      doctorConsultation: {
        required: Boolean,
        urgency: {
          type: String,
          enum: ["immediate", "within-24h", "within-week", "routine"],
        },
        specialization: [String],
        reasons: [String],
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
      },
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
      },
    },
    aiProvider: {
      type: String,
      enum: ["gemini", "openai", "custom"],
      default: "gemini",
    },
    processingTime: {
      type: Number, // in milliseconds
      default: 0,
    },
    feedback: {
      helpful: Boolean,
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      reportedIssues: [String],
    },
    followUpAnalyses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SymptomAnalysis",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    language: {
      type: String,
      enum: ["en", "ne", "hi"],
      default: "en",
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      location: {
        country: String,
        region: String,
        city: String,
      },
      deviceInfo: {
        type: String,
        browser: String,
        os: String,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes
symptomAnalysisSchema.index({ user: 1, createdAt: -1 })
symptomAnalysisSchema.index({ sessionId: 1 })
symptomAnalysisSchema.index({ "analysis.riskLevel": 1 })
symptomAnalysisSchema.index({ status: 1 })

// Virtual for analysis summary
symptomAnalysisSchema.virtual("summary").get(function () {
  if (!this.analysis.possibleConditions.length) return null

  const topCondition = this.analysis.possibleConditions[0]
  return {
    condition: topCondition.name,
    probability: topCondition.probability,
    severity: topCondition.severity,
    doctorRequired: this.analysis.doctorConsultation.required,
    riskLevel: this.analysis.riskLevel,
  }
})

// Method to add feedback
symptomAnalysisSchema.methods.addFeedback = function (helpful, rating, comment, issues = []) {
  this.feedback = {
    helpful,
    rating,
    comment,
    reportedIssues: issues,
  }
  return this.save()
}

// Method to link follow-up analysis
symptomAnalysisSchema.methods.addFollowUp = function (followUpAnalysisId) {
  this.followUpAnalyses.push(followUpAnalysisId)
  return this.save()
}

// Static method to get user's analysis history
symptomAnalysisSchema.statics.getUserHistory = function (userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "name email")
    .select("-metadata -feedback")
}

// Static method to get analytics data
symptomAnalysisSchema.statics.getAnalytics = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
        status: "completed",
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          riskLevel: "$analysis.riskLevel",
        },
        count: { $sum: 1 },
        avgConfidence: { $avg: "$analysis.confidence" },
        avgProcessingTime: { $avg: "$processingTime" },
      },
    },
    {
      $sort: { "_id.date": 1 },
    },
  ])
}

export default mongoose.model("SymptomAnalysis", symptomAnalysisSchema)
