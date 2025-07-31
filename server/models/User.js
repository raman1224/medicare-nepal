import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Please enter a valid phone number"],
    },
    address: {
      province: String,
      district: String,
      municipality: String,
      ward: String,
      street: String,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    avatar: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    preferences: {
      language: {
        type: String,
        enum: ["en", "ne", "hi"],
        default: "en",
      },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "dark",
      },
    },
    healthProfile: {
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
      bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      },
      height: Number, // in cm
      weight: Number, // in kg
      allergies: [String],
      chronicConditions: [String],
      medications: [String],
      emergencyContact: {
        name: String,
        phone: String,
        relation: String,
      },
    },
    activityLog: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
      },
    ],
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for user's age
userSchema.virtual("age").get(function () {
  if (this.healthProfile.dateOfBirth) {
    return Math.floor((Date.now() - this.healthProfile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  }
  return null
})

// Virtual for BMI
userSchema.virtual("bmi").get(function () {
  if (this.healthProfile.height && this.healthProfile.weight) {
    const heightInM = this.healthProfile.height / 100
    return (this.healthProfile.weight / (heightInM * heightInM)).toFixed(1)
  }
  return null
})

// Index for better query performance
userSchema.index({ email: 1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ "healthProfile.bloodGroup": 1 })

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Method to check if account is locked
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
}

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    })
  }

  const updates = { $inc: { loginAttempts: 1 } }

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 hours
  }

  return this.updateOne(updates)
}

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  })
}

// Method to log user activity
userSchema.methods.logActivity = function (action, ipAddress, userAgent) {
  this.activityLog.push({
    action,
    ipAddress,
    userAgent,
    timestamp: new Date(),
  })

  // Keep only last 50 activities
  if (this.activityLog.length > 50) {
    this.activityLog = this.activityLog.slice(-50)
  }

  return this.save()
}

export default mongoose.model("User", userSchema)
