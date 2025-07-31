import vision from "@google-cloud/vision"
import { logger } from "../utils/logger.js"

// Initialize the Vision API client
const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_VISION_KEY_FILE, // Path to service account key file
  // Or use API key if you prefer
  // apiKey: process.env.GOOGLE_CLOUD_VISION_KEY
})

export const analyzeMedicineImage = async (imageUrl) => {
  try {
    // Perform text detection
    const [textResult] = await client.textDetection(imageUrl)
    const detections = textResult.textAnnotations

    let detectedText = []
    if (detections && detections.length > 0) {
      // First annotation contains the full text
      const fullText = detections[0].description
      detectedText = fullText.split("\n").filter((text) => text.trim().length > 0)
    }

    // Perform object detection
    const [objectResult] = await client.objectLocalization(imageUrl)
    const objects = objectResult.localizedObjectAnnotations || []

    const detectedObjects = objects.map((object) => ({
      name: object.name,
      confidence: object.score,
      boundingBox: object.boundingPoly,
    }))

    // Perform label detection for additional context
    const [labelResult] = await client.labelDetection(imageUrl)
    const labels = labelResult.labelAnnotations || []

    const detectedLabels = labels.map((label) => ({
      description: label.description,
      confidence: label.score,
    }))

    // Calculate overall confidence based on text detection quality
    let confidence = 0
    if (detectedText.length > 0) {
      // Check for medicine-related keywords
      const medicineKeywords = [
        "tablet",
        "capsule",
        "mg",
        "ml",
        "dose",
        "medicine",
        "drug",
        "pharmaceutical",
        "prescription",
        "generic",
        "brand",
      ]

      const textLower = detectedText.join(" ").toLowerCase()
      const keywordMatches = medicineKeywords.filter((keyword) => textLower.includes(keyword)).length

      confidence = Math.min(90, (keywordMatches / medicineKeywords.length) * 100 + 30)
    }

    // Filter and clean detected text for medicine names
    const cleanedText = detectedText
      .filter((text) => {
        // Remove very short text and numbers-only text
        return text.length > 2 && !/^\d+$/.test(text)
      })
      .map((text) => text.trim())
      .filter((text) => text.length > 0)

    logger.info(
      `Vision API analysis completed. Detected ${cleanedText.length} text elements, ${detectedObjects.length} objects`,
    )

    return {
      detectedText: cleanedText,
      objects: detectedObjects.map((obj) => obj.name),
      labels: detectedLabels.map((label) => label.description),
      confidence: Math.round(confidence),
      rawData: {
        textAnnotations: detections,
        objectAnnotations: detectedObjects,
        labelAnnotations: detectedLabels,
      },
    }
  } catch (error) {
    logger.error(`Vision API error: ${error.message}`)

    // Fallback: try to extract basic information from image URL or filename
    const fallbackText = []
    if (imageUrl.includes("paracetamol")) fallbackText.push("Paracetamol")
    if (imageUrl.includes("aspirin")) fallbackText.push("Aspirin")

    return {
      detectedText: fallbackText,
      objects: [],
      labels: [],
      confidence: 20, // Low confidence for fallback
      error: "Vision API unavailable, using fallback detection",
    }
  }
}

export const analyzeSymptomImage = async (imageUrl) => {
  try {
    // This could be used for analyzing images of symptoms, rashes, etc.
    const [labelResult] = await client.labelDetection(imageUrl)
    const labels = labelResult.labelAnnotations || []

    const [textResult] = await client.textDetection(imageUrl)
    const detections = textResult.textAnnotations

    let detectedText = []
    if (detections && detections.length > 0) {
      detectedText = detections[0].description.split("\n").filter((text) => text.trim().length > 0)
    }

    // Look for medical/health-related labels
    const medicalLabels = labels.filter((label) => {
      const medicalKeywords = [
        "skin",
        "rash",
        "wound",
        "injury",
        "swelling",
        "bruise",
        "cut",
        "burn",
        "infection",
        "inflammation",
      ]
      return medicalKeywords.some((keyword) => label.description.toLowerCase().includes(keyword))
    })

    return {
      detectedText,
      medicalLabels: medicalLabels.map((label) => ({
        description: label.description,
        confidence: label.score,
      })),
      allLabels: labels.map((label) => ({
        description: label.description,
        confidence: label.score,
      })),
      confidence: medicalLabels.length > 0 ? 75 : 30,
    }
  } catch (error) {
    logger.error(`Symptom image analysis error: ${error.message}`)
    throw new Error("Failed to analyze symptom image")
  }
}
