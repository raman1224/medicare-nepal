import { logger } from "../utils/logger.js"

export const processVoiceInput = async (transcript, language = "en") => {
  try {
    // Process the transcript to extract symptoms
    const symptoms = extractSymptomsFromText(transcript, language)

    // Clean and validate symptoms
    const validSymptoms = symptoms
      .filter((symptom) => symptom.length > 2)
      .map((symptom) => symptom.trim().toLowerCase())
      .filter((symptom, index, array) => array.indexOf(symptom) === index) // Remove duplicates

    logger.info(`Processed voice input: extracted ${validSymptoms.length} symptoms from transcript`)

    return validSymptoms
  } catch (error) {
    logger.error(`Voice processing error: ${error.message}`)
    throw new Error("Failed to process voice input")
  }
}

const extractSymptomsFromText = (text, language) => {
  const symptoms = []
  const lowerText = text.toLowerCase()

  // Define symptom keywords for different languages
  const symptomKeywords = {
    en: [
      "headache",
      "fever",
      "cough",
      "cold",
      "sore throat",
      "runny nose",
      "body ache",
      "fatigue",
      "tired",
      "weakness",
      "dizziness",
      "nausea",
      "vomiting",
      "diarrhea",
      "constipation",
      "stomach ache",
      "chest pain",
      "shortness of breath",
      "difficulty breathing",
      "back pain",
      "joint pain",
      "muscle pain",
      "rash",
      "itching",
      "swelling",
      "bruise",
      "cut",
      "burn",
      "insomnia",
      "anxiety",
      "depression",
      "stress",
      "migraine",
      "toothache",
      "ear ache",
      "eye pain",
      "blurred vision",
      "hearing loss",
      "tinnitus",
    ],
    ne: [
      "टाउको दुख्छ",
      "ज्वरो",
      "खोकी",
      "रुघाखोकी",
      "घाँटी दुख्छ",
      "शरीर दुख्छ",
      "थकान",
      "कमजोरी",
      "चक्कर",
      "वाकवाकी",
      "बान्ता",
      "पखाला",
      "कब्जियत",
      "पेट दुख्छ",
      "छाती दुख्छ",
      "सास फेर्न गाह्रो",
      "ढाड दुख्छ",
      "जोर्नी दुख्छ",
      "मांसपेशी दुख्छ",
      "छाला चिलाउने",
      "सुन्निने",
      "दाँत दुख्छ",
      "कान दुख्छ",
      "आँखा दुख्छ",
    ],
    hi: [
      "सिर दर्द",
      "बुखार",
      "खांसी",
      "सर्दी",
      "गले में दर्द",
      "शरीर दर्द",
      "थकान",
      "कमजोरी",
      "चक्कर",
      "जी मिचलाना",
      "उल्टी",
      "दस्त",
      "कब्ज",
      "पेट दर्द",
      "छाती में दर्द",
      "सांस लेने में तकलीफ",
      "पीठ दर्द",
      "जोड़ों में दर्द",
      "मांसपेशियों में दर्द",
      "खुजली",
      "सूजन",
      "दांत दर्द",
      "कान दर्द",
      "आंख दर्द",
    ],
  }

  const keywords = symptomKeywords[language] || symptomKeywords.en

  // Extract symptoms based on keywords
  keywords.forEach((keyword) => {
    if (lowerText.includes(keyword.toLowerCase())) {
      symptoms.push(keyword)
    }
  })

  // Also try to extract symptoms using common patterns
  const patterns = [
    /i have (.*?)(?:\.|,|$)/gi,
    /i feel (.*?)(?:\.|,|$)/gi,
    /experiencing (.*?)(?:\.|,|$)/gi,
    /suffering from (.*?)(?:\.|,|$)/gi,
    /pain in (.*?)(?:\.|,|$)/gi,
    /my (.*?) hurts?/gi,
    /मलाई (.*?) दुख्छ/gi, // Nepali pattern
    /मेरो (.*?) दुख्छ/gi, // Nepali pattern
    /मुझे (.*?) दर्द है/gi, // Hindi pattern
    /मेरे (.*?) में दर्द है/gi, // Hindi pattern
  ]

  patterns.forEach((pattern) => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach((match) => {
        const extracted = match.replace(pattern, "$1").trim()
        if (extracted && extracted.length > 2) {
          symptoms.push(extracted)
        }
      })
    }
  })

  return symptoms
}

export const generateSpeechResponse = async (text, language = "en") => {
  try {
    // This would integrate with a text-to-speech service
    // For now, we'll return the text with language-specific formatting

    const formattedText = formatTextForSpeech(text, language)

    return {
      text: formattedText,
      language,
      audioUrl: null, // Would contain URL to generated audio file
      duration: estimateSpeechDuration(formattedText),
    }
  } catch (error) {
    logger.error(`Speech generation error: ${error.message}`)
    throw new Error("Failed to generate speech response")
  }
}

const formatTextForSpeech = (text, language) => {
  // Add pauses and emphasis for better speech synthesis
  let formatted = text

  // Add pauses after sentences
  formatted = formatted.replace(/\./g, '. <break time="500ms"/>')
  formatted = formatted.replace(/,/g, ', <break time="200ms"/>')

  // Emphasize important medical terms
  const importantTerms = ["doctor", "hospital", "emergency", "medicine", "treatment"]
  importantTerms.forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi")
    formatted = formatted.replace(regex, `<emphasis level="strong">${term}</emphasis>`)
  })

  return formatted
}

const estimateSpeechDuration = (text) => {
  // Rough estimation: average speaking rate is about 150 words per minute
  const words = text.split(" ").length
  const duration = (words / 150) * 60 // in seconds
  return Math.round(duration)
}
