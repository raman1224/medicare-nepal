import { logger } from "../utils/logger.js"

// Enhanced symptom analysis with comprehensive medical database
export const analyzeSymptoms = async (inputData) => {
  try {
    logger.info("Starting enhanced symptom analysis...")

    const {
      language = "English",
      age,
      gender,
      height_cm,
      weight_kg,
      symptoms,
      temperature,
      duration_days,
      allergies = [],
      medical_history = [],
      pregnancy_status,
      location,
      other_feelings = [],
      selected_medicines = [],
    } = inputData

    // Process input data
    const symptomList = Array.isArray(symptoms) ? symptoms : symptoms.split(",").map((s) => s.trim().toLowerCase())
    const feelingList = Array.isArray(other_feelings)
      ? other_feelings
      : other_feelings.split(",").map((f) => f.trim().toLowerCase())
    const allergyList = Array.isArray(allergies) ? allergies : allergies.split(",").map((a) => a.trim().toLowerCase())
    const conditionList = Array.isArray(medical_history)
      ? medical_history
      : medical_history.split(",").map((c) => c.trim().toLowerCase())

    // Calculate BMI
    const bmi = height_cm && weight_kg ? calculateBMI(Number.parseFloat(height_cm), Number.parseFloat(weight_kg)) : 0

    // Analyze symptoms using advanced algorithm
    const analysis = await performAdvancedAnalysis({
      symptoms: symptomList,
      feelings: feelingList,
      allergies: allergyList,
      conditions: conditionList,
      age: Number.parseInt(age) || 0,
      gender,
      temperature,
      duration_days: Number.parseInt(duration_days) || 0,
      bmi,
      pregnancy_status,
      location,
    })

    // Generate comprehensive result
    const result = {
      primary_disease: {
        name: analysis.primaryCondition.name,
        image_url: analysis.primaryCondition.image_url || "",
        confidence_percent: `${Math.round(analysis.primaryCondition.confidence * 100)}%`,
        description: analysis.primaryCondition.description,
      },
      alternative_diseases: analysis.alternativeConditions.map((condition) => ({
        name: condition.name,
        confidence_percent: `${Math.round(condition.confidence * 100)}%`,
      })),
      medicines: analysis.medicines,
      alternative_medicines: analysis.alternativeMedicines,
      food_to_eat: analysis.dietRecommendations.recommended,
      food_to_avoid: analysis.dietRecommendations.avoid,
      natural_remedies: analysis.homeRemedies,
      exercise_tips: analysis.exerciseRecommendations,
      side_effects: analysis.sideEffects,
      allergy_warnings: analysis.allergyWarnings,
      severity: analysis.severity,
      contagious: analysis.contagious ? "yes" : "no",
      prevention_tips: analysis.preventionTips,
      medicine_usage_timeline: analysis.medicineTimeline,
      stop_medicine_when: analysis.stopMedicineWhen,
      see_doctor_if: analysis.seedoctorIf,
      emergency_symptoms: analysis.emergencySymptoms,
      urgency_status: analysis.urgencyStatus,
      bmi: bmi,
      fitness_advice: generateFitnessAdvice(bmi, age, gender),
      nutrition_advice: generateNutritionAdvice(analysis.severity, bmi),
      personalized_medicine_schedule: generateMedicineSchedule(analysis.medicines),
      ai_health_fitness_tips: generateHealthTips(age, gender, bmi),
      language: language,
      disclaimer: "This is not a medical diagnosis. Please consult a doctor for proper evaluation and treatment.",
      ui_style: {
        button_shadow: "shadow-md shadow-blue-300 rounded-xl hover:scale-105",
        font_shadow: "1px 1px 3px rgba(0,0,0,0.3)",
        card_shadow: "shadow-lg rounded-xl hover:scale-105 transition-all",
        severity_colors: {
          mild: "#a8e6a1",
          moderate: "#ffd966",
          severe: "#ff4d4d",
        },
        "3d_elements": ["rotating_pill_model", "highlighted_body_map"],
      },
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    logger.error(`Symptom analysis error: ${error.message}`)
    throw new Error(`Failed to analyze symptoms: ${error.message}`)
  }
}

// Advanced analysis algorithm
const performAdvancedAnalysis = async (data) => {
  const { symptoms, feelings, age, gender, temperature, duration_days, bmi } = data

  // Symptom-condition mapping with Nepal-specific diseases
  const conditionDatabase = {
    fever: [
      {
        name: "Dengue Fever",
        confidence: 0.7,
        description: "A mosquito-borne viral infection common in Nepal during monsoon season",
        severity: "high",
        contagious: false,
        medicines: [
          {
            name: "Paracetamol",
            image_url: "/images/paracetamol.jpg",
            dosage: "500mg every 6 hours",
            notes: "For fever and pain relief. Avoid aspirin in dengue.",
            price_npr: "50-100",
          },
        ],
      },
      {
        name: "Typhoid Fever",
        confidence: 0.6,
        description: "A bacterial infection common in areas with poor sanitation",
        severity: "high",
        contagious: true,
        medicines: [
          {
            name: "Azithromycin",
            image_url: "/images/azithromycin.jpg",
            dosage: "500mg once daily for 7 days",
            notes: "Antibiotic treatment for typhoid fever",
            price_npr: "200-400",
          },
        ],
      },
      {
        name: "Common Cold",
        confidence: 0.4,
        description: "A viral upper respiratory tract infection",
        severity: "mild",
        contagious: true,
        medicines: [
          {
            name: "Paracetamol",
            image_url: "/images/paracetamol.jpg",
            dosage: "500mg every 6 hours",
            notes: "For symptom relief",
            price_npr: "30-80",
          },
        ],
      },
    ],
    headache: [
      {
        name: "Tension Headache",
        confidence: 0.6,
        description: "Most common type of headache caused by stress or muscle tension",
        severity: "mild",
        contagious: false,
        medicines: [
          {
            name: "Ibuprofen",
            image_url: "/images/ibuprofen.jpg",
            dosage: "400mg every 8 hours",
            notes: "Anti-inflammatory pain relief",
            price_npr: "60-120",
          },
        ],
      },
    ],
    cough: [
      {
        name: "Bronchitis",
        confidence: 0.5,
        description: "Inflammation of the bronchial tubes",
        severity: "moderate",
        contagious: true,
        medicines: [
          {
            name: "Dextromethorphan",
            image_url: "/images/cough-syrup.jpg",
            dosage: "15ml every 4 hours",
            notes: "Cough suppressant",
            price_npr: "150-300",
          },
        ],
      },
    ],
  }

  // Find matching conditions
  let possibleConditions = []
  const allMedicines = []

  for (const symptom of symptoms) {
    if (conditionDatabase[symptom]) {
      possibleConditions.push(...conditionDatabase[symptom])
      conditionDatabase[symptom].forEach((condition) => {
        allMedicines.push(...condition.medicines)
      })
    }
  }

  // Remove duplicates and sort by confidence
  possibleConditions = possibleConditions
    .filter((condition, index, self) => index === self.findIndex((c) => c.name === condition.name))
    .sort((a, b) => b.confidence - a.confidence)

  // Adjust confidence based on additional factors
  if (temperature && temperature.value) {
    let tempCelsius = Number.parseFloat(temperature.value)
    if (temperature.unit === "F") {
      tempCelsius = ((tempCelsius - 32) * 5) / 9
    }

    if (tempCelsius > 38.5) {
      possibleConditions.forEach((condition) => {
        if (
          condition.name.includes("Fever") ||
          condition.name.includes("Dengue") ||
          condition.name.includes("Typhoid")
        ) {
          condition.confidence = Math.min(condition.confidence + 0.2, 1.0)
        }
      })
    }
  }

  // Age-based adjustments
  if (age > 60) {
    possibleConditions.forEach((condition) => {
      if (condition.severity === "mild") {
        condition.severity = "moderate"
      }
    })
  }

  // Determine overall severity and urgency
  let overallSeverity = "mild"
  let urgencyStatus = "🟢"

  if (possibleConditions.some((c) => c.severity === "high")) {
    overallSeverity = "severe"
    urgencyStatus = "🔴"
  } else if (possibleConditions.some((c) => c.severity === "moderate")) {
    overallSeverity = "moderate"
    urgencyStatus = "🟡"
  }

  const primaryCondition = possibleConditions[0] || {
    name: "General Health Concern",
    confidence: 0.5,
    description:
      "Based on your symptoms, this appears to be a general health concern that may require medical attention.",
    severity: "moderate",
    contagious: false,
    medicines: [],
  }

  return {
    primaryCondition,
    alternativeConditions: possibleConditions.slice(1, 4),
    medicines: allMedicines.slice(0, 3),
    alternativeMedicines: [],
    severity: overallSeverity,
    contagious: possibleConditions.some((c) => c.contagious),
    urgencyStatus,
    dietRecommendations: {
      recommended: [
        "Plenty of fluids (water, herbal teas, clear broths)",
        "Fresh fruits rich in vitamin C (oranges, kiwi, guava)",
        "Light, easily digestible foods (rice, toast, bananas)",
        "Warm soups and broths",
        "Honey and ginger tea for throat relief",
      ],
      avoid: [
        "Dairy products (may increase mucus production)",
        "Spicy and fried foods",
        "Caffeinated beverages",
        "Alcohol and smoking",
        "Processed and sugary foods",
      ],
    },
    homeRemedies: [
      "Get adequate rest (7-9 hours of sleep)",
      "Stay hydrated with warm fluids",
      "Use a humidifier or steam inhalation",
      "Gargle with warm salt water for sore throat",
      "Apply warm compress for body aches",
    ],
    exerciseRecommendations: [
      "Avoid strenuous exercise during illness",
      "Light stretching or gentle yoga when feeling better",
      "Short walks in fresh air if no fever",
      "Deep breathing exercises",
      "Gradual return to normal activity as symptoms improve",
    ],
    sideEffects: [
      "Drowsiness from medications",
      "Stomach upset if taken on empty stomach",
      "Allergic reactions (rare but possible)",
    ],
    allergyWarnings: [
      "Check medicine ingredients against known allergies",
      "Consult doctor if you have drug allergies",
      "Stop medication if unusual reactions occur",
    ],
    preventionTips: [
      "Wash hands frequently with soap",
      "Avoid close contact with sick individuals",
      "Cover mouth and nose when coughing/sneezing",
      "Maintain good hygiene",
      "Boost immunity with healthy diet and exercise",
    ],
    medicineTimeline: `Take prescribed medications for ${duration_days || 3}-5 days or as directed by doctor`,
    stopMedicineWhen: "When symptoms improve significantly or as directed by healthcare provider",
    seeoctorIf: "Symptoms worsen, persist beyond 5-7 days, or if you develop severe symptoms",
    emergencySymptoms: [
      "High fever above 39°C (102.2°F)",
      "Difficulty breathing or chest pain",
      "Severe dehydration",
      "Persistent vomiting",
      "Signs of severe infection",
    ],
  }
}

// Helper functions
const calculateBMI = (height_cm, weight_kg) => {
  const height_m = height_cm / 100
  return weight_kg / (height_m * height_m)
}

const generateFitnessAdvice = (bmi, age, gender) => {
  if (bmi === 0) return "Unable to calculate BMI. Maintain regular physical activity for good health."

  if (bmi < 18.5) {
    return "Your BMI suggests you are underweight. Focus on strength training and balanced nutrition to build healthy weight."
  } else if (bmi < 25) {
    return "Your BMI is in the healthy range. Maintain your weight with regular exercise and balanced diet."
  } else if (bmi < 30) {
    return "Your BMI suggests you are overweight. Consider increasing physical activity and reducing calorie intake."
  } else {
    return "Your BMI suggests obesity. Consult a healthcare provider for a personalized weight management plan."
  }
}

const generateNutritionAdvice = (severity, bmi) => {
  let advice = "Eat a balanced diet with plenty of fruits, vegetables, and whole grains. "

  if (severity === "severe") {
    advice += "Focus on easily digestible foods and stay well hydrated during recovery."
  } else {
    advice += "Maintain regular meal times and avoid processed foods."
  }

  return advice
}

const generateMedicineSchedule = (medicines) => {
  return medicines.map((medicine) => ({
    medicine_name: medicine.name,
    dose: medicine.dosage.split(" ")[0] || "1 tablet",
    times: ["08:00", "14:00", "20:00"],
    before_or_after_food: medicine.notes.toLowerCase().includes("with food") ? "after" : "before",
    food_recommendation: "Take with a light snack to avoid stomach upset",
    notes: medicine.notes,
  }))
}

const generateHealthTips = (age, gender, bmi) => {
  const tips = [
    "Get 7-9 hours of quality sleep each night",
    "Stay hydrated by drinking at least 8 glasses of water daily",
    "Practice stress-reduction techniques like meditation or deep breathing",
    "Maintain good hygiene to prevent infections",
    "Exercise regularly as per your fitness level",
  ]

  if (age > 50) {
    tips.push("Regular health check-ups are important at your age")
  }

  if (bmi > 25) {
    tips.push("Focus on maintaining a healthy weight through diet and exercise")
  }

  return tips
}