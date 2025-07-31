import nodemailer from "nodemailer"
import { logger } from "./logger.js"

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"Medicare Nepal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    }

    const info = await transporter.sendMail(mailOptions)
    logger.info(`Email sent: ${info.messageId}`)

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    logger.error(`Email sending error: ${error.message}`)
    throw new Error("Failed to send email")
  }
}

export const sendBulkEmail = async (emails) => {
  try {
    const transporter = createTransporter()
    const results = []

    for (const email of emails) {
      try {
        const info = await transporter.sendMail({
          from: `"Medicare Nepal" <${process.env.EMAIL_USER}>`,
          ...email,
        })

        results.push({
          to: email.to,
          success: true,
          messageId: info.messageId,
        })

        logger.info(`Bulk email sent to ${email.to}: ${info.messageId}`)
      } catch (emailError) {
        results.push({
          to: email.to,
          success: false,
          error: emailError.message,
        })

        logger.error(`Failed to send bulk email to ${email.to}: ${emailError.message}`)
      }
    }

    return results
  } catch (error) {
    logger.error(`Bulk email error: ${error.message}`)
    throw new Error("Failed to send bulk emails")
  }
}
