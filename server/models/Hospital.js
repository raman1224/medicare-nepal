import mongoose from "mongoose"

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
      maxlength: [100, "Hospital name cannot exceed 100 characters"],
    },
    nameNepali: {
      type: String,
      trim: true,
    },
    nameHindi: {
      type: String,
      trim: true,
    },
    location: {
      province: {
        type: String,
        required: [true, "Province is required"],
        enum: ["Koshi", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim", "Madhesh"],
      },
      district: {
        type: String,
        required: [true, "District is required"],
      },
      municipality: String,
      ward: String,
      street: String,
      coordinates: {
        latitude: {
          type: Number,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          min: -180,
          max: 180,
        },
      },
    },
    contact: {
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^[0-9\-+$$$$\s]+$/, "Please enter a valid phone number"],
      },
      ambulanceNumber: {
        type: String,
        match: [/^[0-9\-+$$$$\s]+$/, "Please enter a valid ambulance number"],
      },
      emergencyNumber: {
        type: String,
        match: [/^[0-9\-+$$$$\s]+$/, "Please enter a valid emergency number"],
      },
      email: {
        type: String,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
      },
      website: {
        type: String,
        match: [/^https?:\/\/.+/, "Please enter a valid website URL"],
      },
    },
    departments: [
      {
        name: {
          type: String,
          required: true,
        },
        nameNepali: String,
        nameHindi: String,
        description: String,
        doctors: [
          {
            name: String,
            specialization: String,
            experience: Number,
            availability: {
              days: [String],
              startTime: String,
              endTime: String,
            },
          },
        ],
        facilities: [String],
      },
    ],
    services: [
      {
        name: String,
        description: String,
        cost: {
          min: Number,
          max: Number,
          currency: { type: String, default: "NPR" },
        },
        availability: {
          type: String,
          enum: ["24/7", "business-hours", "appointment-only"],
          default: "business-hours",
        },
      },
    ],
    facilities: [
      {
        name: String,
        description: String,
        isAvailable: { type: Boolean, default: true },
      },
    ],
    operatingHours: {
      monday: { open: String, close: String, is24Hours: Boolean },
      tuesday: { open: String, close: String, is24Hours: Boolean },
      wednesday: { open: String, close: String, is24Hours: Boolean },
      thursday: { open: String, close: String, is24Hours: Boolean },
      friday: { open: String, close: String, is24Hours: Boolean },
      saturday: { open: String, close: String, is24Hours: Boolean },
      sunday: { open: String, close: String, is24Hours: Boolean },
    },
    establishedYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },
    type: {
      type: String,
      enum: ["government", "private", "semi-government", "community"],
      required: true,
    },
    level: {
      type: String,
      enum: ["primary", "secondary", "tertiary", "specialized"],
      required: true,
    },
    bedCapacity: {
      total: Number,
      icu: Number,
      emergency: Number,
      general: Number,
      private: Number,
    },
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        comment: String,
        department: String,
        visitDate: Date,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    images: [
      {
        url: String,
        caption: String,
        type: {
          type: String,
          enum: ["exterior", "interior", "equipment", "staff", "other"],
          default: "other",
        },
      },
    ],
    accreditation: [
      {
        organization: String,
        certificate: String,
        validUntil: Date,
        status: {
          type: String,
          enum: ["active", "expired", "pending"],
          default: "active",
        },
      },
    ],
    insurance: [
      {
        provider: String,
        coverage: String,
        isAccepted: { type: Boolean, default: true },
      },
    ],
    statistics: {
      totalPatients: { type: Number, default: 0 },
      monthlyPatients: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      averageWaitTime: { type: Number, default: 0 }, // in minutes
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDate: Date,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for better query performance
hospitalSchema.index({ "location.province": 1, "location.district": 1 })
hospitalSchema.index({ "departments.name": 1 })
hospitalSchema.index({ type: 1, level: 1 })
hospitalSchema.index({ "rating.average": -1 })
hospitalSchema.index({ "location.coordinates": "2dsphere" })

// Virtual for full address
hospitalSchema.virtual("fullAddress").get(function () {
  const parts = [
    this.location.street,
    this.location.ward ? `Ward ${this.location.ward}` : null,
    this.location.municipality,
    this.location.district,
    this.location.province,
  ].filter(Boolean)

  return parts.join(", ")
})

// Virtual for distance calculation (requires coordinates in query)
hospitalSchema.virtual("distance").get(function () {
  return this._distance || null
})

// Method to calculate average rating
hospitalSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating.average = 0
    this.rating.totalReviews = 0
    return
  }

  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0)
  this.rating.average = (sum / this.reviews.length).toFixed(1)
  this.rating.totalReviews = this.reviews.length
}

// Method to add review
hospitalSchema.methods.addReview = function (userId, rating, comment, department, visitDate) {
  this.reviews.push({
    user: userId,
    rating,
    comment,
    department,
    visitDate: visitDate || new Date(),
  })

  this.calculateAverageRating()
  return this.save()
}

// Method to check if hospital is open now
hospitalSchema.methods.isOpenNow = function () {
  const now = new Date()
  const dayName = now.toLocaleDateString("en-US", { weekday: "lowercase" })
  const currentTime = now.toTimeString().slice(0, 5) // HH:MM format

  const todayHours = this.operatingHours[dayName]
  if (!todayHours) return false

  if (todayHours.is24Hours) return true

  return currentTime >= todayHours.open && currentTime <= todayHours.close
}

// Static method to find nearby hospitals
hospitalSchema.statics.findNearby = function (latitude, longitude, maxDistance = 50000) {
  return this.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        distanceField: "distance",
        maxDistance: maxDistance,
        spherical: true,
      },
    },
    {
      $match: { isActive: true },
    },
    {
      $sort: { distance: 1 },
    },
  ])
}

// Pre-save middleware
hospitalSchema.pre("save", function (next) {
  this.lastUpdated = new Date()
  if (this.isModified("reviews")) {
    this.calculateAverageRating()
  }
  next()
})

export default mongoose.model("Hospital", hospitalSchema)
