import mongoose from "mongoose"

const medicineAnalysisSchema = new mongoose.Schema(
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
      image: {
        url: String,
        originalName: String,
        size: Number,
        mimeType: String,
      },
      text: String, // If user types medicine name
      additionalInfo: String,
    },
    analysis: {
      medicine: {
        name: String,
        nameNepali: String,
        nameHindi: String,
        genericName: String,
        brandNames: [String],
        manufacturer: String,
        category: String,
        classification: String,
      },
      composition: [
        {
          ingredient: String,
          strength: String,
          unit: String,
          percentage: Number,
        },
      ],
      indications: {
        primary: [String],
        secondary: [String],
        offLabel: [String],
      },
      dosage: {
        adults: {
          standard: String,
          maximum: String,
          frequency: String,
        },
        children: {
          standard: String,
          maximum: String,
          frequency: String,
          ageRestriction: String,
        },
        elderly: {
          standard: String,
          adjustments: String,
        },
        special: [
          {
            condition: String,
            dosage: String,
            precautions: String,
          },
        ],
      },
      administration: {
        route: [String], // oral, topical, injection, etc.
        timing: String, // before/after meals, etc.
        instructions: [String],
        storage: String,
      },
      sideEffects: {
        common: [String],
        serious: [String],
        rare: [String],
        allergicReactions: [String],
      },
      contraindications: {
        absolute: [String],
        relative: [String],
        pregnancy: String,
        breastfeeding: String,
        pediatric: String,
        geriatric: String,
      },
      interactions: {
        drugs: [
          {
            name: String,
            severity: String,
            description: String,
          },
        ],
        food: [
          {
            item: String,
            effect: String,
            recommendation: String,
          },
        ],
        alcohol: String,
        supplements: [String],
      },
      alternatives: {
        generic: [
          {
            name: String,
            manufacturer: String,
            price: Number,
          },
        ],
        therapeutic: [
          {
            name: String,
            similarity: Number,
            advantages: [String],
            disadvantages: [String],
          },
        ],
        natural: [
          {
            name: String,
            description: String,
            effectiveness: String,
            preparation: String,
          },
        ],
      },
      pricing: {
        current: {
          min: Number,
          max: Number,
          average: Number,
          currency: { type: String, default: "NPR" },
        },
        history: [
          {
            date: Date,
            price: Number,
            source: String,
          },
        ],
      },
      availability: {
        prescription: {
          required: Boolean,
          type: String, // OTC, prescription, controlled
        },
        pharmacies: [
          {
            name: String,
            location: String,
            contact: String,
            inStock: Boolean,
            price: Number,
          },
        ],
      },
      warnings: {
        blackBox: [String],
        important: [String],
        general: [String],
      },
      monitoring: {
        parameters: [String],
        frequency: String,
        duration: String,
      },
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    aiProvider: {
      type: String,
      enum: ["google-vision", "gemini", "custom"],
      default: "google-vision",
    },
    processingTime: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    feedback: {
      accurate: Boolean,
      helpful: Boolean,
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      corrections: [
        {
          field: String,
          correctValue: String,
          reason: String,
        },
      ],
    },
    language: {
      type: String,
      enum: ["en", "ne", "hi"],
      default: "en",
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      imageAnalysis: {
        textDetected: [String],
        objectsDetected: [String],
        confidence: Number,
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
medicineAnalysisSchema.index({ user: 1, createdAt: -1 })
medicineAnalysisSchema.index({ sessionId: 1 })
medicineAnalysisSchema.index({ "analysis.medicine.name": 1 })
medicineAnalysisSchema.index({ status: 1 })

// Virtual for medicine summary
medicineAnalysisSchema.virtual("summary").get(function () {
  if (!this.analysis.medicine) return null

  return {
    name: this.analysis.medicine.name,
    genericName: this.analysis.medicine.genericName,
    category: this.analysis.medicine.category,
    prescriptionRequired: this.analysis.availability.prescription.required,
    averagePrice: this.analysis.pricing.current.average,
    confidence: this.confidence,
  }
})

// Method to add feedback
medicineAnalysisSchema.methods.addFeedback = function (accurate, helpful, rating, comment, corrections = []) {
  this.feedback = {
    accurate,
    helpful,
    rating,
    comment,
    corrections,
  }
  return this.save()
}

// Static method to get popular medicines
medicineAnalysisSchema.statics.getPopularMedicines = function (limit = 10) {
  return this.aggregate([
    {
      $match: {
        status: "completed",
        "analysis.medicine.name": { $exists: true },
      },
    },
    {
      $group: {
        _id: "$analysis.medicine.name",
        count: { $sum: 1 },
        avgConfidence: { $avg: "$confidence" },
        lastAnalyzed: { $max: "$createdAt" },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: limit,
    },
  ])
}

// Static method to get analysis statistics
medicineAnalysisSchema.statics.getStatistics = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        completedAnalyses: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        avgConfidence: { $avg: "$confidence" },
        avgProcessingTime: { $avg: "$processingTime" },
        uniqueUsers: { $addToSet: "$user" },
      },
    },
    {
      $project: {
        totalAnalyses: 1,
        completedAnalyses: 1,
        successRate: {
          $multiply: [{ $divide: ["$completedAnalyses", "$totalAnalyses"] }, 100],
        },
        avgConfidence: { $round: ["$avgConfidence", 2] },
        avgProcessingTime: { $round: ["$avgProcessingTime", 2] },
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
  ])
}

export default mongoose.model("MedicineAnalysis", medicineAnalysisSchema)
