import { logger } from "./logger.js"

const SPAM_KEYWORDS = [
  "viagra",
  "casino",
  "lottery",
  "winner",
  "congratulations",
  "free money",
  "click here",
  "urgent",
  "limited time",
  "act now",
  "guaranteed",
  "make money fast",
  "work from home",
  "lose weight",
  "miracle cure",
]

const SUSPICIOUS_PATTERNS = [
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card numbers
  /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/, // SSN patterns
  /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g, // URLs
]

export const detectSpam = (text, email = "", additionalData = {}) => {
  try {
    let spamScore = 0
    const flags = []

    // Convert to lowercase for analysis
    const lowerText = text.toLowerCase()
    const lowerEmail = email.toLowerCase()

    // Check for spam keywords
    const keywordMatches = SPAM_KEYWORDS.filter((keyword) => lowerText.includes(keyword.toLowerCase()))

    if (keywordMatches.length > 0) {
      spamScore += keywordMatches.length * 10
      flags.push(`Spam keywords detected: ${keywordMatches.join(", ")}`)
    }

    // Check for suspicious patterns
    SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(text)) {
        spamScore += 15
        flags.push(`Suspicious pattern ${index + 1} detected`)
      }
    })

    // Check for excessive capitalization
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
    if (capsRatio > 0.3 && text.length > 20) {
      spamScore += 10
      flags.push("Excessive capitalization")
    }

    // Check for excessive punctuation
    const punctuationRatio = (text.match(/[!?]{2,}/g) || []).length
    if (punctuationRatio > 2) {
      spamScore += 5
      flags.push("Excessive punctuation")
    }

    // Check email patterns
    if (email) {
      // Suspicious email domains
      const suspiciousDomains = [
        "tempmail",
        "10minutemail",
        "guerrillamail",
        "mailinator",
        "throwaway",
        "temp-mail",
        "fakeinbox",
      ]

      if (suspiciousDomains.some((domain) => lowerEmail.includes(domain))) {
        spamScore += 20
        flags.push("Suspicious email domain")
      }

      // Random character patterns in email
      if (/[a-z]{10,}@/.test(lowerEmail) || /\d{5,}@/.test(email)) {
        spamScore += 10
        flags.push("Suspicious email pattern")
      }
    }

    // Check for repeated submissions (if IP or user data provided)
    if (additionalData.ip) {
      // This would typically check against a database of recent submissions
      // For now, we'll just flag it for manual review
      if (additionalData.recentSubmissions > 5) {
        spamScore += 15
        flags.push("Multiple recent submissions from same IP")
      }
    }

    // Check message length and content quality
    if (text.length < 10) {
      spamScore += 5
      flags.push("Message too short")
    }

    if (text.length > 5000) {
      spamScore += 10
      flags.push("Message unusually long")
    }

    // Check for gibberish (simple heuristic)
    const words = text.split(/\s+/)
    const longWords = words.filter((word) => word.length > 15)
    if (longWords.length > 3) {
      spamScore += 8
      flags.push("Potential gibberish content")
    }

    // Determine spam likelihood
    let likelihood = "low"
    if (spamScore >= 50) {
      likelihood = "high"
    } else if (spamScore >= 25) {
      likelihood = "medium"
    }

    const result = {
      isSpam: spamScore >= 30,
      spamScore,
      likelihood,
      flags,
      recommendation: spamScore >= 50 ? "block" : spamScore >= 30 ? "review" : "allow",
    }

    logger.info(`Spam detection completed: Score ${spamScore}, Likelihood: ${likelihood}`)
    return result
  } catch (error) {
    logger.error(`Spam detection error: ${error.message}`)
    return {
      isSpam: false,
      spamScore: 0,
      likelihood: "unknown",
      flags: ["Error in spam detection"],
      recommendation: "review",
    }
  }
}

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone) => {
  // Nepal phone number patterns
  const nepalPhoneRegex = /^(\+977)?[0-9]{10}$/
  const cleanPhone = phone.replace(/[\s-()]/g, "")
  return nepalPhoneRegex.test(cleanPhone)
}

export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input

  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
}
