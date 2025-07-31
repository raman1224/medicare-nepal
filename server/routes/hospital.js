import express from "express"
import { body, validationResult } from "express-validator"
import Hospital from "../models/Hospital.js"
import { auth } from "../middleware/auth.js"
import { logger } from "../utils/logger.js"

const router = express.Router()

// @route   GET /api/hospitals
// @desc    Get hospitals with filtering and pagination
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      province,
      district,
      department,
      type,
      level,
      search,
      sortBy = "rating.average",
      sortOrder = "desc",
      latitude,
      longitude,
      radius = 50000, // 50km default
    } = req.query

    // Build query
    const query = { isActive: true }

    if (province) {
      query["location.province"] = province
    }

    if (district) {
      query["location.district"] = { $regex: district, $options: "i" }
    }

    if (department) {
      query["departments.name"] = { $regex: department, $options: "i" }
    }

    if (type) {
      query.type = type
    }

    if (level) {
      query.level = level
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { nameNepali: { $regex: search, $options: "i" } },
        { nameHindi: { $regex: search, $options: "i" } },
        { "location.district": { $regex: search, $options: "i" } },
        { "departments.name": { $regex: search, $options: "i" } },
      ]
    }

    let hospitals
    let total

    // If coordinates provided, use geospatial query
    if (latitude && longitude) {
      hospitals = await Hospital.findNearby(
        Number.parseFloat(latitude),
        Number.parseFloat(longitude),
        Number.parseInt(radius),
      )

      // Apply additional filters
      hospitals = hospitals.filter((hospital) => {
        return Object.keys(query).every((key) => {
          if (key === "$or") {
            return query[key].some((condition) => {
              const field = Object.keys(condition)[0]
              const value = condition[field]
              return hospital[field] && hospital[field].toString().match(new RegExp(value.$regex, value.$options))
            })
          }
          return (
            hospital[key] === query[key] ||
            (typeof query[key] === "object" &&
              query[key].$regex &&
              hospital[key] &&
              hospital[key].toString().match(new RegExp(query[key].$regex, query[key].$options)))
          )
        })
      })

      total = hospitals.length

      // Apply pagination
      const startIndex = (page - 1) * limit
      hospitals = hospitals.slice(startIndex, startIndex + Number.parseInt(limit))
    } else {
      // Regular query with sorting
      const sortOptions = {}
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

      hospitals = await Hospital.find(query)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate("reviews.user", "name")
        .select("-reviews.user.email")

      total = await Hospital.countDocuments(query)
    }

    res.json({
      success: true,
      data: {
        hospitals,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        filters: {
          province,
          district,
          department,
          type,
          level,
          search,
        },
      },
    })
  } catch (error) {
    logger.error(`Get hospitals error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/hospitals/provinces
// @desc    Get all provinces with hospital counts
// @access  Public
router.get("/provinces", async (req, res) => {
  try {
    const provinces = await Hospital.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: "$location.province",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating.average" },
          types: { $addToSet: "$type" },
          levels: { $addToSet: "$level" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ])

    res.json({
      success: true,
      data: { provinces },
    })
  } catch (error) {
    logger.error(`Get provinces error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/hospitals/districts/:province
// @desc    Get districts in a province with hospital counts
// @access  Public
router.get("/districts/:province", async (req, res) => {
  try {
    const { province } = req.params

    const districts = await Hospital.aggregate([
      {
        $match: {
          "location.province": province,
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$location.district",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating.average" },
          hospitals: {
            $push: {
              name: "$name",
              type: "$type",
              level: "$level",
              rating: "$rating.average",
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
      data: { districts },
    })
  } catch (error) {
    logger.error(`Get districts error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/hospitals/departments
// @desc    Get all available departments
// @access  Public
router.get("/departments", async (req, res) => {
  try {
    const departments = await Hospital.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $unwind: "$departments",
      },
      {
        $group: {
          _id: "$departments.name",
          count: { $sum: 1 },
          hospitals: { $addToSet: "$name" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ])

    res.json({
      success: true,
      data: { departments },
    })
  } catch (error) {
    logger.error(`Get departments error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/hospitals/:id
// @desc    Get hospital by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate("reviews.user", "name avatar")
      .select("-reviews.user.email")

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      })
    }

    // Increment view count (you might want to track this)
    // hospital.statistics.views = (hospital.statistics.views || 0) + 1;
    // await hospital.save();

    res.json({
      success: true,
      data: { hospital },
    })
  } catch (error) {
    logger.error(`Get hospital error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/hospitals/:id/review
// @desc    Add review to hospital
// @access  Private
router.post(
  "/:id/review",
  auth,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().isLength({ max: 500 }).withMessage("Comment cannot exceed 500 characters"),
    body("department").optional().isLength({ max: 100 }).withMessage("Department name too long"),
    body("visitDate").optional().isISO8601().withMessage("Invalid visit date"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { rating, comment, department, visitDate } = req.body
      const hospital = await Hospital.findById(req.params.id)

      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: "Hospital not found",
        })
      }

      // Check if user already reviewed this hospital
      const existingReview = hospital.reviews.find((review) => review.user.toString() === req.user.id)

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: "You have already reviewed this hospital",
        })
      }

      await hospital.addReview(req.user.id, rating, comment, department, visitDate)

      logger.info(`Review added for hospital ${hospital.name} by user ${req.user.id}`)

      res.json({
        success: true,
        message: "Review added successfully",
      })
    } catch (error) {
      logger.error(`Add review error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/hospitals/emergency/numbers
// @desc    Get emergency contact numbers by location
// @access  Public
router.get("/emergency/numbers", async (req, res) => {
  try {
    const { province, district } = req.query

    const query = { isActive: true }
    if (province) query["location.province"] = province
    if (district) query["location.district"] = { $regex: district, $options: "i" }

    const emergencyContacts = await Hospital.find(query)
      .select("name location.district location.province contact.phone contact.ambulanceNumber contact.emergencyNumber")
      .sort({ "location.province": 1, "location.district": 1 })

    // Group by district
    const groupedContacts = emergencyContacts.reduce((acc, hospital) => {
      const key = `${hospital.location.province}-${hospital.location.district}`
      if (!acc[key]) {
        acc[key] = {
          province: hospital.location.province,
          district: hospital.location.district,
          hospitals: [],
        }
      }
      acc[key].hospitals.push({
        name: hospital.name,
        phone: hospital.contact.phone,
        ambulance: hospital.contact.ambulanceNumber,
        emergency: hospital.contact.emergencyNumber,
      })
      return acc
    }, {})

    res.json({
      success: true,
      data: {
        contacts: Object.values(groupedContacts),
        nationalEmergency: {
          ambulance: "102",
          police: "100",
          fire: "101",
          healthHotline: "1166",
        },
      },
    })
  } catch (error) {
    logger.error(`Get emergency numbers error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/hospitals/top/:province
// @desc    Get top hospitals in a province
// @access  Public
router.get("/top/:province", async (req, res) => {
  try {
    const { province } = req.params
    const { limit = 14 } = req.query

    const topHospitals = await Hospital.find({
      "location.province": province,
      isActive: true,
      isVerified: true,
    })
      .sort({ "rating.average": -1, "rating.totalReviews": -1 })
      .limit(Number.parseInt(limit))
      .select("name location contact departments rating establishedYear type level")

    res.json({
      success: true,
      data: {
        province,
        hospitals: topHospitals,
        count: topHospitals.length,
      },
    })
  } catch (error) {
    logger.error(`Get top hospitals error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/hospitals/search/nearby
// @desc    Search nearby hospitals
// @access  Public
router.post(
  "/search/nearby",
  [
    body("latitude").isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude"),
    body("longitude").isFloat({ min: -180, max: 180 }).withMessage("Invalid longitude"),
    body("radius").optional().isInt({ min: 1000, max: 100000 }).withMessage("Radius must be between 1km and 100km"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { latitude, longitude, radius = 50000, department, type, level } = req.body

      let nearbyHospitals = await Hospital.findNearby(latitude, longitude, radius)

      // Apply additional filters
      if (department) {
        nearbyHospitals = nearbyHospitals.filter((hospital) =>
          hospital.departments.some((dept) => dept.name.toLowerCase().includes(department.toLowerCase())),
        )
      }

      if (type) {
        nearbyHospitals = nearbyHospitals.filter((hospital) => hospital.type === type)
      }

      if (level) {
        nearbyHospitals = nearbyHospitals.filter((hospital) => hospital.level === level)
      }

      res.json({
        success: true,
        data: {
          hospitals: nearbyHospitals,
          count: nearbyHospitals.length,
          searchCenter: { latitude, longitude },
          radius,
        },
      })
    } catch (error) {
      logger.error(`Nearby hospitals search error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

export default router
