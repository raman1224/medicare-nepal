import express from "express"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"
import Contact from "../models/Contact.js"
import { sendEmail } from "../utils/email.js"
import { detectSpam } from "../utils/spamDetection.js"
import { logger } from "../utils/logger.js"

const router = express.Router()

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 contact submissions per hour
  message: {
    error: "Too many contact form submissions. Please try again later.",
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation rules
const contactValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),
  body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email address"),
  body("phone")
    .matches(/^[0-9+\-$$$$\s]+$/)
    .withMessage("Please enter a valid phone number"),
  body("subject").trim().isLength({ min: 5, max: 100 }).withMessage("Subject must be between 5 and 100 characters"),
  body("message").trim().isLength({ min: 10, max: 1000 }).withMessage("Message must be between 10 and 1000 characters"),
  body("category")
    .optional()
    .isIn(["general", "technical", "medical", "feedback", "complaint", "suggestion"])
    .withMessage("Invalid category"),
]

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post("/", contactLimiter, contactValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { name, email, phone, subject, message, category = "general" } = req.body

    // Detect spam
    const spamScore = await detectSpam({
      name,
      email,
      subject,
      message,
      ipAddress: req.ip,
    })

    // Create contact record
    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
      category,
      spamScore,
      isSpam: spamScore > 70,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        referrer: req.get("Referrer"),
        language: req.get("Accept-Language"),
      },
    })

    await contact.save()

    // If not spam, send notification email
    if (!contact.isSpam) {
      try {
        // Send confirmation email to user
        await sendEmail({
          to: email,
          subject: "Thank you for contacting Medicare Nepal",
          html: `
            <h2>Thank you for reaching out!</h2>
            <p>Dear ${name},</p>
            <p>We have received your message and will get back to you within 24-48 hours.</p>
            <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3>Your Message:</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Message:</strong> ${message}</p>
            </div>
            <p>If you have any urgent medical concerns, please contact emergency services immediately.</p>
            <p>Best regards,<br>Medicare Nepal Team</p>
            <p>📞 Support: 9763774451</p>
          `,
        })

        // Send notification to admin
        await sendEmail({
          to: process.env.ADMIN_EMAIL || "admin@medicare-nepal.com",
          subject: `New Contact Form Submission - ${category}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
              ${message}
            </div>
            <p><strong>IP Address:</strong> ${req.ip}</p>
            <p><strong>Spam Score:</strong> ${spamScore}%</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          `,
        })
      } catch (emailError) {
        logger.error(`Contact email error: ${emailError.message}`)
        // Don't fail the request if email fails
      }
    }

    logger.info(`Contact form submitted by ${email} (spam score: ${spamScore}%)`)

    res.json({
      success: true,
      message: contact.isSpam
        ? "Your message has been received and is under review."
        : "Thank you for your message! We will get back to you soon.",
      data: {
        id: contact._id,
        status: contact.status,
      },
    })
  } catch (error) {
    logger.error(`Contact form error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    })
  }
})

// @route   GET /api/contact
// @desc    Get all contact submissions (Admin only)
// @access  Private/Admin
router.get("/", async (req, res) => {
  try {
    // This would typically require admin authentication
    // For now, we'll return a simple response

    const { page = 1, limit = 20, status, category, priority, search } = req.query

    const query = {}

    if (status) query.status = status
    if (category) query.category = category
    if (priority) query.priority = priority
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ]
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("assignedTo", "name email")
      .populate("response.respondedBy", "name email")

    const total = await Contact.countDocuments(query)

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    })
  } catch (error) {
    logger.error(`Get contacts error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/contact/stats
// @desc    Get contact statistics
// @access  Private/Admin
router.get("/stats", async (req, res) => {
  try {
    const { days = 30 } = req.query
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(days))

    const stats = await Contact.getStatistics(startDate, new Date())

    res.json({
      success: true,
      data: { stats },
    })
  } catch (error) {
    logger.error(`Get contact stats error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   PUT /api/contact/:id/respond
// @desc    Respond to contact submission
// @access  Private/Admin
router.put(
  "/:id/respond",
  [body("message").notEmpty().withMessage("Response message is required")],
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

      const { message } = req.body
      const contact = await Contact.findById(req.params.id)

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "Contact submission not found",
        })
      }

      // This would typically require admin user ID
      // For now, we'll use a placeholder
      const adminUserId = "admin-user-id"

      await contact.respond(message, adminUserId)

      // Send response email to user
      try {
        await sendEmail({
          to: contact.email,
          subject: `Re: ${contact.subject}`,
          html: `
          <h2>Response from Medicare Nepal</h2>
          <p>Dear ${contact.name},</p>
          <p>Thank you for contacting us. Here is our response to your inquiry:</p>
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Your Original Message:</h3>
            <p>${contact.message}</p>
          </div>
          <div style="background: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Our Response:</h3>
            <p>${message}</p>
          </div>
          <p>If you have any further questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>Medicare Nepal Team</p>
          <p>📞 Support: 9763774451</p>
        `,
        })
      } catch (emailError) {
        logger.error(`Response email error: ${emailError.message}`)
      }

      logger.info(`Response sent for contact ${contact._id}`)

      res.json({
        success: true,
        message: "Response sent successfully",
      })
    } catch (error) {
      logger.error(`Respond to contact error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

export default router
