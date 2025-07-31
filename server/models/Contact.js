import mongoose from "mongoose"

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9+\-$$$$\s]+$/, "Please enter a valid phone number"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      enum: ["general", "technical", "medical", "feedback", "complaint", "suggestion"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved", "closed"],
      default: "new",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    response: {
      message: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      respondedAt: Date,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        url: String,
        size: Number,
        mimeType: String,
      },
    ],
    metadata: {
      ipAddress: String,
      userAgent: String,
      referrer: String,
      language: String,
    },
    tags: [String],
    isSpam: {
      type: Boolean,
      default: false,
    },
    spamScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
contactSchema.index({ status: 1, createdAt: -1 })
contactSchema.index({ category: 1 })
contactSchema.index({ priority: 1 })
contactSchema.index({ email: 1 })

// Method to mark as spam
contactSchema.methods.markAsSpam = function (score = 100) {
  this.isSpam = true
  this.spamScore = score
  this.status = "closed"
  return this.save()
}

// Method to respond to contact
contactSchema.methods.respond = function (message, responderId) {
  this.response = {
    message,
    respondedBy: responderId,
    respondedAt: new Date(),
  }
  this.status = "resolved"
  return this.save()
}

// Static method to get statistics
contactSchema.statics.getStatistics = function (startDate, endDate) {
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
        total: { $sum: 1 },
        byStatus: {
          $push: {
            status: "$status",
            count: 1,
          },
        },
        byCategory: {
          $push: {
            category: "$category",
            count: 1,
          },
        },
        byPriority: {
          $push: {
            priority: "$priority",
            count: 1,
          },
        },
        avgResponseTime: {
          $avg: {
            $cond: [
              { $ne: ["$response.respondedAt", null] },
              { $subtract: ["$response.respondedAt", "$createdAt"] },
              null,
            ],
          },
        },
      },
    },
  ])
}

export default mongoose.model("Contact", contactSchema)
