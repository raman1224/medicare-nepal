import { GoogleGenerativeAI } from "@google/generative-ai"
import { logger } from "../utils/logger.js"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const analyzeSymptoms = async ({
  symptoms,
  temperature,
  emotions = [],
  additionalInfo = "",
  language = "en",
  userAge,
  userGender,
}) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
You are a medical AI assistant for Medicare Nepal. Analyze the following symptoms and provide a comprehensive health assessment.

Patient Information:
- Age: ${userAge || "Not provided"}
- Gender: ${userGender || "Not provided"}
- Language: ${language}

Symptoms: ${symptoms.join(", ")}
Temperature: ${temperature ? `${temperature.value}°${temperature.unit}` : "Not provided"}
Emotional State: ${emotions.join(", ") || "Not provided"}
Additional Information: ${additionalInfo || "None"}

Please provide a detailed analysis in JSON format with the following structure:
{
  "possibleConditions": [
    {
      "name": "Condition name",
      "nameNepali": "नेपाली नाम (if language is ne)",
      "nameHindi": "हिंदी नाम (if language is hi)",
      "probability": 85,
      "severity": "medium",
      "description": "Detailed description",
      "symptoms": ["matching symptoms"],
      "causes": ["possible causes"],
      "riskFactors": ["risk factors"]
    }
  ],
  "recommendations": {
    "immediateActions": ["immediate steps to take"],
    "medicines": [
      {
        "name": "Medicine name",
        "genericName": "Generic name",
        "dosage": "Dosage information",
        "frequency": "How often to take",
        "duration": "How long to take",
        "instructions": "Special instructions",
        "sideEffects": ["possible side effects"],
        "contraindications": ["when not to use"],
        "price": {"min": 50, "max": 100, "currency": "NPR"},
        "alternatives": ["alternative medicines"],
        "image": "medicine_image_placeholder.jpg"
      }
    ],
    "homeRemedies": [
      {
        "name": "Remedy name",
        "description": "How it helps",
        "ingredients": ["required ingredients"],
        "preparation": "How to prepare",
        "usage": "How to use",
        "precautions": ["safety precautions"]
      }
    ],
    "lifestyle": {
      "diet": {
        "recommended": ["foods to eat"],
        "avoid": ["foods to avoid"],
        "supplements": ["recommended supplements"]
      },
      "exercise": {
        "recommended": ["safe exercises"],
        "avoid": ["exercises to avoid"],
        "duration": "recommended duration"
      },
      "sleep": {
        "duration": "recommended sleep hours",
        "position": "best sleeping position",
        "environment": ["sleep environment tips"]
      }
    },
    "followUp": {
      "timeframe": "when to follow up",
      "symptoms": ["symptoms to watch for"],
      "tests": ["recommended tests"]
    }
  },
  "doctorConsultation": {
    "required": true/false,
    "urgency": "immediate/within-24h/within-week/routine",
    "specialization": ["required specializations"],
    "reasons": ["reasons for consultation"]
  },
  "confidence": 85,
  "riskLevel": "low/medium/high/critical"
}

Important guidelines:
1. Always recommend consulting a doctor for serious symptoms
2. Provide culturally appropriate remedies for Nepal
3. Include pricing in Nepali Rupees (NPR)
4. Consider local availability of medicines
5. Be conservative with diagnoses - emphasize the need for professional medical advice
6. If language is 'ne' or 'hi', provide translations for key terms
7. Focus on common conditions in Nepal's climate and environment

Respond only with valid JSON.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    let analysis
    try {
      analysis = JSON.parse(text)
    } catch (parseError) {
      logger.error(`Failed to parse Gemini response: ${parseError.message}`)
      // Fallback response
      analysis = {
        possibleConditions: [
          {
            name: "General Health Concern",
            probability: 70,
            severity: "medium",
            description: "Based on the symptoms provided, further medical evaluation is recommended.",
            symptoms: symptoms,
            causes: ["Various factors"],
            riskFactors: ["Individual health factors"],
          },
        ],
        recommendations: {
          immediateActions: ["Rest and stay hydrated", "Monitor symptoms"],
          medicines: [],
          homeRemedies: [],
          lifestyle: {
            diet: { recommended: ["Balanced diet"], avoid: [], supplements: [] },
            exercise: { recommended: ["Light exercise"], avoid: [], duration: "30 minutes" },
            sleep: { duration: "7-8 hours", position: "Comfortable", environment: [] },
          },
          followUp: {
            timeframe: "If symptoms persist or worsen",
            symptoms: ["Worsening of current symptoms"],
            tests: [],
          },
        },
        doctorConsultation: {
          required: true,
          urgency: "within-week",
          specialization: ["General Practitioner"],
          reasons: ["Professional medical evaluation needed"],
        },
        confidence: 70,
        riskLevel: "medium",
      }
    }

    return analysis
  } catch (error) {
    logger.error(`Gemini symptom analysis error: ${error.message}`)
    throw new Error("Failed to analyze symptoms using AI")
  }
}

export const getMedicineInfo = async ({
  medicineName,
  detectedText = [],
  objects = [],
  additionalInfo = "",
  language = "en",
}) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
You are a pharmaceutical AI assistant for Medicare Nepal. Analyze the following medicine information and provide comprehensive details.

Medicine Information:
- Medicine Name: ${medicineName || "Not provided"}
- Detected Text from Image: ${detectedText.join(", ") || "None"}
- Detected Objects: ${objects.join(", ") || "None"}
- Additional Information: ${additionalInfo || "None"}
- Language: ${language}

Please provide detailed medicine information in JSON format with the following structure:
{
  "medicine": {
    "name": "Medicine name",
    "nameNepali": "नेपाली नाम (if language is ne)",
    "nameHindi": "हिंदी नाम (if language is hi)",
    "genericName": "Generic name",
    "brandNames": ["brand names"],
    "manufacturer": "Manufacturer name",
    "category": "Medicine category",
    "classification": "Therapeutic classification"
  },
  "composition": [
    {
      "ingredient": "Active ingredient",
      "strength": "Strength amount",
      "unit": "mg/ml/etc",
      "percentage": 100
    }
  ],
  "indications": {
    "primary": ["primary uses"],
    "secondary": ["secondary uses"],
    "offLabel": ["off-label uses"]
  },
  "dosage": {
    "adults": {
      "standard": "Standard adult dose",
      "maximum": "Maximum daily dose",
      "frequency": "How often per day"
    },
    "children": {
      "standard": "Pediatric dose",
      "maximum": "Maximum pediatric dose",
      "frequency": "How often per day",
      "ageRestriction": "Age restrictions"
    },
    "elderly": {
      "standard": "Elderly dose",
      "adjustments": "Special considerations"
    }
  },
  "administration": {
    "route": ["oral", "topical", "injection"],
    "timing": "Before/after meals, etc",
    "instructions": ["special instructions"],
    "storage": "Storage requirements"
  },
  "sideEffects": {
    "common": ["common side effects"],
    "serious": ["serious side effects"],
    "rare": ["rare side effects"],
    "allergicReactions": ["allergic reaction signs"]
  },
  "contraindications": {
    "absolute": ["absolute contraindications"],
    "relative": ["relative contraindications"],
    "pregnancy": "Pregnancy category/advice",
    "breastfeeding": "Breastfeeding advice",
    "pediatric": "Pediatric considerations",
    "geriatric": "Geriatric considerations"
  },
  "interactions": {
    "drugs": [
      {
        "name": "Interacting drug",
        "severity": "mild/moderate/severe",
        "description": "Interaction description"
      }
    ],
    "food": [
      {
        "item": "Food item",
        "effect": "Effect description",
        "recommendation": "What to do"
      }
    ],
    "alcohol": "Alcohol interaction advice",
    "supplements": ["supplement interactions"]
  },
  "alternatives": {
    "generic": [
      {
        "name": "Generic alternative",
        "manufacturer": "Manufacturer",
        "price": 50
      }
    ],
    "therapeutic": [
      {
        "name": "Therapeutic alternative",
        "similarity": 85,
        "advantages": ["advantages"],
        "disadvantages": ["disadvantages"]
      }
    ],
    "natural": [
      {
        "name": "Natural alternative",
        "description": "How it works",
        "effectiveness": "Effectiveness level",
        "preparation": "How to prepare/use"
      }
    ]
  },
  "pricing": {
    "current": {
      "min": 50,
      "max": 100,
      "average": 75,
      "currency": "NPR"
    }
  },
  "availability": {
    "prescription": {
      "required": true/false,
      "type": "OTC/prescription/controlled"
    },
    "pharmacies": [
      {
        "name": "Pharmacy name",
        "location": "Location",
        "contact": "Contact info",
        "inStock": true,
        "price": 75
      }
    ]
  },
  "warnings": {
    "blackBox": ["black box warnings"],
    "important": ["important warnings"],
    "general": ["general precautions"]
  },
  "monitoring": {
    "parameters": ["what to monitor"],
    "frequency": "how often to monitor",
    "duration": "how long to monitor"
  }
}

Important guidelines:
1. Provide accurate information based on standard pharmaceutical references
2. Include pricing in Nepali Rupees (NPR)
3. Consider local availability in Nepal
4. If language is 'ne' or 'hi', provide translations for key terms
5. Always emphasize consulting healthcare professionals
6. Include culturally appropriate alternatives
7. Be conservative with recommendations

Respond only with valid JSON.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    let medicineInfo
    try {
      medicineInfo = JSON.parse(text)
    } catch (parseError) {
      logger.error(`Failed to parse Gemini medicine response: ${parseError.message}`)
      // Fallback response
      medicineInfo = {
        medicine: {
          name: medicineName || "Unknown Medicine",
          genericName: "Generic name not available",
          category: "Pharmaceutical",
          classification: "Requires professional identification",
        },
        composition: [],
        indications: {
          primary: ["Consult healthcare provider for proper usage"],
          secondary: [],
          offLabel: [],
        },
        dosage: {
          adults: {
            standard: "As prescribed by healthcare provider",
            frequency: "As directed",
          },
        },
        warnings: {
          important: ["Always consult a healthcare provider before using any medication"],
          general: ["Do not use without proper medical guidance"],
        },
      }
    }

    return medicineInfo
  } catch (error) {
    logger.error(`Gemini medicine analysis error: ${error.message}`)
    throw new Error("Failed to analyze medicine using AI")
  }
}
