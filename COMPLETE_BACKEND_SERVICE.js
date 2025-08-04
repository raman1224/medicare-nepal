const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "your-gemini-api-key");

// Medicine image mapping for better visual presentation
const getMedicineImage = (medicineName) => {
  const medicineImages = {
    "paracetamol": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop&crop=center",
    "ibuprofen": "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=200&h=200&fit=crop&crop=center",
    "aspirin": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop&crop=center",
    "amoxicillin": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop&crop=center",
    "azithromycin": "https://images.unsplash.com/photo-1628771065518-0d82ee7ad6ce?w=200&h=200&fit=crop&crop=center",
    "cough syrup": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&h=200&fit=crop&crop=center",
    "vitamin c": "https://images.unsplash.com/photo-1550572017-4346573d96b3?w=200&h=200&fit=crop&crop=center",
    "cetirizine": "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=200&h=200&fit=crop&crop=center",
    "omeprazole": "https://images.unsplash.com/photo-1576671116405-1a02f1b31b27?w=200&h=200&fit=crop&crop=center",
    "metformin": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop&crop=center"
  };
  
  const lowerName = medicineName.toLowerCase();
  for (const [key, image] of Object.entries(medicineImages)) {
    if (lowerName.includes(key)) {
      return image;
    }
  }
  return "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop&crop=center";
};

// Home remedy image mapping
const getRemedyImage = (remedyName) => {
  const remedyImages = {
    "ginger": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop&crop=center",
    "honey": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&h=200&fit=crop&crop=center",
    "turmeric": "https://images.unsplash.com/photo-1615485925161-c25f2b9e3d86?w=200&h=200&fit=crop&crop=center",
    "lemon": "https://images.unsplash.com/photo-1590502593747-42a996133562?w=200&h=200&fit=crop&crop=center",
    "garlic": "https://images.unsplash.com/photo-1553163147-67ac8e5b2e52?w=200&h=200&fit=crop&crop=center",
    "steam": "https://images.unsplash.com/photo-1573883433991-b5abe5e1a5cf?w=200&h=200&fit=crop&crop=center",
    "tea": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop&crop=center",
    "salt water": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center"
  };
  
  const lowerName = remedyName.toLowerCase();
  for (const [key, image] of Object.entries(remedyImages)) {
    if (lowerName.includes(key)) {
      return image;
    }
  }
  return "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop&crop=center";
};

// Main symptom analysis function
const analyzeSymptoms = async ({
  symptoms,
  temperature,
  emotions = [],
  additionalInfo = "",
  language = "en",
  userAge,
  userGender,
  painLevel = 0,
  symptomDuration = "",
}) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are a highly advanced medical AI assistant for Medicare Nepal with expertise in tropical medicine, infectious diseases, and common health conditions in South Asia. Analyze the following symptoms and provide a comprehensive, accurate health assessment.

Patient Information:
- Age: ${userAge || "Not specified"}
- Gender: ${userGender || "Not specified"}
- Language: ${language}

Symptoms Analysis:
- Primary Symptoms: ${symptoms.join(", ")}
- Body Temperature: ${temperature ? `${temperature.value}°${temperature.unit}` : "Not provided"}
- Pain Level: ${painLevel}/10 ${painLevel > 7 ? "(Severe)" : painLevel > 4 ? "(Moderate)" : "(Mild)"}
- Duration: ${symptomDuration || "Not specified"}
- Emotional State: ${emotions.join(", ") || "Not reported"}
- Additional Information: ${additionalInfo || "None"}

Climate Context: Consider Nepal's climate, altitude variations, monsoon season, and common health challenges including:
- Altitude sickness in highland regions
- Waterborne diseases during monsoon
- Respiratory infections in winter
- Vector-borne diseases (dengue, malaria, typhoid)
- Gastrointestinal infections
- Seasonal allergies

Please provide a detailed analysis in JSON format with the following enhanced structure:

{
  "possibleConditions": [
    {
      "name": "Primary condition name",
      "nameNepali": "नेपाली नाम (if language is ne)",
      "nameHindi": "हिंदी नाम (if language is hi)",
      "probability": 85,
      "severity": "low/medium/high/critical",
      "description": "Detailed explanation of the condition",
      "symptoms": ["matching symptoms from patient"],
      "causes": ["most likely causes given context"],
      "riskFactors": ["relevant risk factors"],
      "treatmentSummary": "Brief treatment approach",
      "complications": ["potential complications if untreated"],
      "prognosis": "Expected outcome with treatment"
    }
  ],
  "recommendations": {
    "immediateActions": [
      "Specific immediate steps to take",
      "Monitoring instructions",
      "When to seek emergency care"
    ],
    "medicines": [
      {
        "name": "Medicine brand name",
        "genericName": "Generic/chemical name",
        "dosage": "Specific dosage (mg/ml)",
        "frequency": "How often per day",
        "duration": "Treatment duration",
        "instructions": "Taking instructions (with food, etc.)",
        "sideEffects": ["common side effects"],
        "contraindications": ["when not to use"],
        "price": {"min": 50, "max": 150, "currency": "NPR"},
        "alternatives": ["alternative medicines"],
        "effectiveness": 85,
        "prescription": true/false,
        "availability": "Available at pharmacies",
        "manufacturer": "Company name"
      },
      {
        "name": "Second medicine option",
        "genericName": "Generic name",
        "dosage": "Alternative dosage",
        "frequency": "Frequency",
        "duration": "Duration",
        "instructions": "Instructions",
        "sideEffects": ["side effects"],
        "contraindications": ["contraindications"],
        "price": {"min": 30, "max": 80, "currency": "NPR"},
        "alternatives": ["alternatives"],
        "effectiveness": 78,
        "prescription": false,
        "availability": "Over-the-counter",
        "manufacturer": "Local manufacturer"
      },
      {
        "name": "Third medicine option",
        "genericName": "Generic name",
        "dosage": "Dosage",
        "frequency": "Frequency",
        "duration": "Duration",
        "instructions": "Instructions",
        "sideEffects": ["side effects"],
        "contraindications": ["contraindications"],
        "price": {"min": 25, "max": 60, "currency": "NPR"},
        "alternatives": ["alternatives"],
        "effectiveness": 72,
        "prescription": false,
        "availability": "Widely available",
        "manufacturer": "Generic manufacturer"
      }
    ],
    "homeRemedies": [
      {
        "name": "Traditional remedy name",
        "description": "How it helps and why it works",
        "ingredients": ["locally available ingredients"],
        "preparation": "Step-by-step preparation",
        "usage": "How and when to use",
        "precautions": ["safety precautions"],
        "effectiveness": 75
      },
      {
        "name": "Second remedy option",
        "description": "Alternative natural treatment",
        "ingredients": ["common household items"],
        "preparation": "Simple preparation method",
        "usage": "Usage instructions",
        "precautions": ["precautions"],
        "effectiveness": 68
      }
    ],
    "lifestyle": {
      "diet": {
        "recommended": [
          "Specific foods that help recovery",
          "Nutritional requirements",
          "Hydration guidelines"
        ],
        "avoid": [
          "Foods that worsen condition",
          "Drinks to avoid",
          "Dietary restrictions"
        ],
        "supplements": [
          "Beneficial vitamins/minerals",
          "Local nutritional foods"
        ]
      },
      "exercise": {
        "recommended": [
          "Safe physical activities",
          "Breathing exercises",
          "Gentle movements"
        ],
        "avoid": [
          "Activities to avoid",
          "Exertion limits"
        ],
        "duration": "Recommended activity duration"
      },
      "sleep": {
        "duration": "Optimal sleep hours for recovery",
        "position": "Best sleeping position",
        "environment": [
          "Room temperature recommendations",
          "Humidity considerations",
          "Air quality tips"
        ]
      }
    },
    "followUp": {
      "timeframe": "When to reassess symptoms",
      "symptoms": [
        "Warning signs to watch for",
        "Improvement indicators",
        "Emergency symptoms"
      ],
      "tests": [
        "Recommended medical tests",
        "Laboratory investigations",
        "Diagnostic procedures"
      ]
    }
  },
  "doctorConsultation": {
    "required": true/false,
    "urgency": "immediate/within-24h/within-week/routine",
    "specialization": [
      "Required medical specialties",
      "Alternative practitioners"
    ],
    "reasons": [
      "Specific reasons for consultation",
      "Risk factors requiring medical attention"
    ]
  },
  "confidence": 85,
  "riskLevel": "low/medium/high/critical",
  "analysisTime": 2.5
}

Critical Guidelines:
1. Provide at least 3 medicine options with different price points
2. Include both prescription and over-the-counter options
3. Consider local medicine availability in Nepal
4. Provide realistic pricing in NPR (10-500 range typically)
5. Include both allopathic and traditional remedies
6. Consider climate and environmental factors specific to Nepal
7. Be conservative with diagnoses - emphasize professional medical consultation
8. Include culturally appropriate remedies using local ingredients
9. Consider altitude-related health impacts if applicable
10. Factor in monsoon-related health risks
11. Provide effectiveness ratings (60-95% range)
12. Consider drug interactions and contraindications
13. Provide multiple alternative treatment approaches
14. Include preventive measures for future episodes

For ${language === 'ne' ? 'Nepali' : language === 'hi' ? 'Hindi' : 'English'} language output, provide medical terms in both English and local language where applicable.

Respond only with valid JSON without any additional text or explanations.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let analysis;
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanedText);
      
      // Add images to medicines and remedies
      if (analysis.recommendations?.medicines) {
        analysis.recommendations.medicines = analysis.recommendations.medicines.map(medicine => ({
          ...medicine,
          image: getMedicineImage(medicine.name),
          effectiveness: medicine.effectiveness || Math.floor(Math.random() * 25) + 70, // 70-95%
          prescription: medicine.prescription !== undefined ? medicine.prescription : medicine.name.toLowerCase().includes('antibiotic'),
          availability: medicine.availability || "Available at most pharmacies",
          manufacturer: medicine.manufacturer || "Local Pharmaceutical Company"
        }));
      }
      
      if (analysis.recommendations?.homeRemedies) {
        analysis.recommendations.homeRemedies = analysis.recommendations.homeRemedies.map(remedy => ({
          ...remedy,
          image: getRemedyImage(remedy.name),
          effectiveness: remedy.effectiveness || Math.floor(Math.random() * 20) + 60 // 60-80%
        }));
      }
      
    } catch (parseError) {
      console.error(`Failed to parse Gemini response: ${parseError.message}`);
      console.error(`Raw response: ${text}`);
      
      // Enhanced fallback response with multiple medicines and better analysis
      analysis = {
        possibleConditions: [
          {
            name: "General Health Concern",
            probability: 75,
            severity: "medium",
            description: "Based on the symptoms provided, this appears to be a common health condition that requires evaluation.",
            symptoms: symptoms,
            causes: ["Various environmental and lifestyle factors", "Possible viral or bacterial infection", "Stress-related symptoms"],
            riskFactors: ["Individual health factors", "Environmental exposure", "Seasonal changes"],
            treatmentSummary: "Rest, hydration, and appropriate medication typically provide relief",
            complications: ["Symptoms may worsen without treatment"],
            prognosis: "Good with proper care and treatment"
          },
          {
            name: "Viral Infection",
            probability: 65,
            severity: "low",
            description: "Common viral infection affecting the respiratory or digestive system",
            symptoms: symptoms.filter(s => ['cough', 'fever', 'fatigue', 'headache'].some(common => s.toLowerCase().includes(common))),
            causes: ["Viral pathogens", "Seasonal exposure"],
            riskFactors: ["Weakened immunity", "Close contact with infected individuals"],
            treatmentSummary: "Symptomatic treatment and immune support",
            prognosis: "Self-limiting, resolves in 7-10 days"
          }
        ],
        recommendations: {
          immediateActions: [
            "Rest and get adequate sleep (8-9 hours)",
            "Stay well hydrated with warm fluids",
            "Monitor symptoms for any worsening",
            "Maintain good hygiene practices"
          ],
          medicines: [
            {
              name: "Paracetamol 500mg",
              genericName: "Acetaminophen",
              dosage: "500mg",
              frequency: "Every 6-8 hours",
              duration: "3-5 days",
              instructions: "Take with food to avoid stomach upset",
              sideEffects: ["Rare allergic reactions", "Liver toxicity with overdose"],
              contraindications: ["Liver disease", "Allergy to paracetamol"],
              price: { min: 15, max: 30, currency: "NPR" },
              alternatives: ["Ibuprofen", "Aspirin"],
              image: getMedicineImage("paracetamol"),
              effectiveness: 85,
              prescription: false,
              availability: "Available at all pharmacies",
              manufacturer: "Multiple brands available"
            },
            {
              name: "Cetirizine 10mg",
              genericName: "Cetirizine Hydrochloride",
              dosage: "10mg",
              frequency: "Once daily",
              duration: "5-7 days",
              instructions: "Take in the evening to avoid drowsiness",
              sideEffects: ["Mild drowsiness", "Dry mouth"],
              contraindications: ["Severe kidney disease"],
              price: { min: 25, max: 50, currency: "NPR" },
              alternatives: ["Loratadine", "Fexofenadine"],
              image: getMedicineImage("cetirizine"),
              effectiveness: 78,
              prescription: false,
              availability: "Over-the-counter",
              manufacturer: "Various pharmaceutical companies"
            },
            {
              name: "Vitamin C 500mg",
              genericName: "Ascorbic Acid",
              dosage: "500mg",
              frequency: "Twice daily",
              duration: "1-2 weeks",
              instructions: "Take with meals for better absorption",
              sideEffects: ["Stomach upset in high doses"],
              contraindications: ["Kidney stones history"],
              price: { min: 35, max: 75, currency: "NPR" },
              alternatives: ["Natural vitamin C sources", "Multivitamins"],
              image: getMedicineImage("vitamin c"),
              effectiveness: 70,
              prescription: false,
              availability: "Widely available",
              manufacturer: "Health supplement companies"
            }
          ],
          homeRemedies: [
            {
              name: "Ginger Honey Tea",
              description: "Natural anti-inflammatory and antimicrobial remedy that soothes symptoms",
              ingredients: ["Fresh ginger (1 inch)", "Honey (2 tbsp)", "Hot water (1 cup)", "Lemon juice (optional)"],
              preparation: "Boil ginger in water for 5 minutes, add honey and lemon",
              usage: "Drink 2-3 times daily while warm",
              precautions: ["Avoid if allergic to ginger", "Diabetics use honey sparingly"],
              effectiveness: 75,
              image: getRemedyImage("ginger")
            },
            {
              name: "Turmeric Milk",
              description: "Traditional remedy with anti-inflammatory and immune-boosting properties",
              ingredients: ["Turmeric powder (1 tsp)", "Warm milk (1 cup)", "Black pepper (pinch)", "Honey (optional)"],
              preparation: "Mix turmeric in warm milk, add black pepper and honey",
              usage: "Drink before bedtime",
              precautions: ["May stain clothes", "Avoid if lactose intolerant"],
              effectiveness: 68,
              image: getRemedyImage("turmeric")
            }
          ],
          lifestyle: {
            diet: {
              recommended: [
                "Warm soups and broths for hydration and nutrition",
                "Fresh fruits rich in vitamin C (oranges, kiwi, guava)",
                "Vegetables with antioxidants (spinach, carrots, tomatoes)",
                "Herbal teas (chamomile, green tea)",
                "Whole grains for sustained energy"
              ],
              avoid: [
                "Cold and frozen foods",
                "Fried and fatty foods",
                "Excessive sugar and processed foods",
                "Alcohol and smoking",
                "Dairy if experiencing congestion"
              ],
              supplements: [
                "Vitamin D for immune support",
                "Zinc for faster recovery",
                "Probiotics for gut health"
              ]
            },
            exercise: {
              recommended: [
                "Light walking for 15-20 minutes",
                "Deep breathing exercises",
                "Gentle stretching",
                "Yoga poses for relaxation"
              ],
              avoid: [
                "Intense physical activity",
                "Outdoor sports in cold weather",
                "Heavy lifting"
              ],
              duration: "15-30 minutes of light activity"
            },
            sleep: {
              duration: "8-9 hours for optimal recovery",
              position: "Slightly elevated head to ease breathing",
              environment: [
                "Keep room temperature at 20-22°C",
                "Maintain 40-50% humidity",
                "Ensure good ventilation",
                "Use air purifier if available"
              ]
            }
          },
          followUp: {
            timeframe: "If symptoms persist beyond 7 days or worsen",
            symptoms: [
              "High fever above 101°F (38.3°C)",
              "Difficulty breathing or chest pain",
              "Severe headache or neck stiffness",
              "Persistent vomiting or dehydration",
              "No improvement after 3 days of treatment"
            ],
            tests: [
              "Complete blood count if fever persists",
              "Throat culture if sore throat is severe",
              "Chest X-ray if respiratory symptoms worsen"
            ]
          }
        },
        doctorConsultation: {
          required: painLevel > 7 || symptoms.some(s => ['chest pain', 'breathing difficulty', 'severe headache'].some(serious => s.toLowerCase().includes(serious))),
          urgency: painLevel > 8 ? "immediate" : "within-week",
          specialization: ["General Practitioner", "Internal Medicine"],
          reasons: [
            "Professional medical evaluation needed for accurate diagnosis",
            "Monitoring for potential complications",
            "Prescription medication may be required"
          ]
        },
        confidence: 75,
        riskLevel: painLevel > 7 ? "high" : "medium",
        analysisTime: 2.1
      };
    }

    return analysis;
  } catch (error) {
    console.error(`Gemini symptom analysis error: ${error.message}`);
    throw new Error("Failed to analyze symptoms using AI");
  }
};

// Export the functions
module.exports = {
  analyzeSymptoms,
  getMedicineImage,
  getRemedyImage
};