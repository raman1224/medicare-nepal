import { logger } from "./logger.js"

export const detectSpam = async ({ name, email, subject, message, ipAddress }) => {
  try {
    let spamScore = 0

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /viagra|cialis|pharmacy/gi,
      /win.*money|lottery|prize/gi,
      /click.*here|urgent.*action/gi,
      /free.*money|easy.*money/gi,
      /nigerian.*prince|inheritance/gi,
    ]

    const text = `${name} ${email} ${subject} ${message}`.toLowerCase()

    suspiciousPatterns.forEach((pattern) => {
      if (pattern.test(text)) {
        spamScore += 25
      }
    })

    // Check for excessive links
    const linkCount = (message.match(/https?:\/\/[^\s]+/g) || []).length
    if (linkCount > 3) {
      spamScore += 20
    }

    // Check for excessive caps
    const capsPercentage = (message.match(/[A-Z]/g) || []).length / message.length
    if (capsPercentage > 0.5) {
      spamScore += 15
    }

    // Check for repeated characters
    if (/(.)\1{4,}/.test(message)) {
      spamScore += 10
    }

    // Check email domain
    const suspiciousDomains = ["tempmail.org", "10minutemail.com", "guerrillamail.com"]
    const emailDomain = email.split("@")[1]
    if (suspiciousDomains.includes(emailDomain)) {
      spamScore += 30
    }

    // Check for very short or very long messages
    if (message.length < 10 || message.length > 5000) {
      spamScore += 10
    }

    return Math.min(spamScore, 100)
  } catch (error) {
    logger.error(`Spam detection error: ${error.message}`)
    return 0 // Default to not spam if detection fails
  }
}
