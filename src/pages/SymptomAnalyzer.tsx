// src/pages/SymptomAnalyzer.tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../context/SocketContext"
import {
  Send,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Pill,
  Home,
  Phone,
  Volume2,
  Thermometer,
} from "lucide-react"
import PDFExporter from "../components/PDFExporter"
// import LanguageToggle from "../components/LanguageToggle"
import { analyzeSymptoms } from "../services/aiApi"

interface Medicine {
  name: string
  image_url: string
  dosage: string
  notes: string
  price_npr: string
}

interface Disease {
  name: string
  image_url: string
  confidence_percent: string
  description: string
}

interface AnalysisResult {
  primary_disease: Disease
  alternative_diseases: Array<{
    name: string
    confidence_percent: string
  }>
  medicines: Medicine[]
  alternative_medicines: Medicine[]
  food_to_eat: string[]
  food_to_avoid: string[]
  natural_remedies: string[]
  exercise_tips: string[]
  side_effects: string[]
  allergy_warnings: string[]
  severity: string
  contagious: string
  prevention_tips: string[]
  medicine_usage_timeline: string
  stop_medicine_when: string
  see_doctor_if: string
  emergency_symptoms: string[]
  urgency_status: string
  bmi: number
  fitness_advice: string
  nutrition_advice: string
  personalized_medicine_schedule: Array<{
    medicine_name: string
    dose: string
    times: string[]
    before_or_after_food: string
    food_recommendation: string
    notes: string
  }>
  ai_health_fitness_tips: string[]
  language: string
  disclaimer: string
  ui_style: {
    button_shadow: string
    font_shadow: string
    card_shadow: string
    severity_colors: {
      mild: string
      moderate: string
      severe: string
    }
    "3d_elements": string[]
  }
}

const SymptomAnalyzer = () => {
  const { currentUser } = useAuth()
  const { socket } = useSocket()
  const [input, setInput] = useState({
    language: "English",
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    symptoms: [] as string[],
    temperature: { value: "", unit: "C" },
    duration_days: "",
    allergies: [] as string[],
    medical_history: [] as string[],
    pregnancy_status: "",
    location: "Kathmandu, Nepal",
    other_feelings: [] as string[],
    selected_medicines: [] as string[],
  })

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentSymptom, setCurrentSymptom] = useState("")
  const [currentFeeling, setCurrentFeeling] = useState("")
  const [currentAllergy, setCurrentAllergy] = useState("")
  const [currentCondition, setCurrentCondition] = useState("")

  const handleAnalyze = async () => {
    if (!input.symptoms.length) {
      toast.error("Please enter at least one symptom")
      return
    }

    if (!currentUser) {
      toast.error("Please login to analyze symptoms")
      return
    }

    setIsAnalyzing(true)

    try {
      // Prepare the request data according to the expected format
      const requestData = {
        language: input.language.toLowerCase(),
        age: Number.parseInt(input.age) || 0,
        gender: input.gender,
        height_cm: Number.parseFloat(input.height_cm) || 0,
        weight_kg: Number.parseFloat(input.weight_kg) || 0,
        symptoms: input.symptoms,
        temperature: input.temperature.value
          ? {
              value: Number.parseFloat(input.temperature.value),
              unit: input.temperature.unit as "C" | "F",
            }
          : null,
        duration_days: Number.parseInt(input.duration_days) || 0,
        allergies: input.allergies,
        medical_history: input.medical_history,
        pregnancy_status: input.pregnancy_status,
        location: input.location,
        other_feelings: input.other_feelings,
        selected_medicines: input.selected_medicines,
      }

      // Get token if available
      const idToken = currentUser?.getIdToken ? await currentUser.getIdToken() : undefined

      // CALL AI BACKEND via aiApi
      const result = await analyzeSymptoms(requestData, idToken)

      if (!result) throw new Error("Empty response from analysis API")

      // Map backend payload to AnalysisResult shape if necessary.
      const mappedResult: AnalysisResult = {
        primary_disease: {
          name: result?.diseases?.[0]?.name || "Unknown",
          image_url: result?.diseases?.[0]?.image_url || "",
          confidence_percent: result?.diseases?.[0]?.confidence
            ? `${(result.diseases[0].confidence * 100).toFixed(0)}%`
            : "0%",
          description: result?.diseases?.[0]?.description || "",
        },
        alternative_diseases:
          (result?.diseases?.slice(1) || []).map((d: any) => ({
            name: d.name,
            confidence_percent: d.confidence ? `${(d.confidence * 100).toFixed(0)}%` : "0%",
          })) || [],
        medicines: result?.medicines || [],
        alternative_medicines: result?.alternative_medicines || [],
        food_to_eat: result?.food_to_eat || [],
        food_to_avoid: result?.food_to_avoid || [],
        natural_remedies: result?.natural_remedies || [],
        exercise_tips: result?.exercise_tips || [],
        side_effects: result?.side_effects || [],
        allergy_warnings: result?.allergy_warnings || [],
        severity: result?.severity || "moderate",
        contagious: result?.contagious || "no",
        prevention_tips: result?.prevention_tips || [],
        medicine_usage_timeline: result?.medicine_usage_timeline || "",
        stop_medicine_when: result?.stop_medicine_when || "",
        see_doctor_if: result?.see_doctor_if || "",
        emergency_symptoms: result?.emergency_symptoms || [],
        urgency_status: result?.urgency_status || "🟡",
        bmi: result?.bmi_recommendation?.value || 0,
        fitness_advice: result?.fitness_advice || "",
        nutrition_advice: result?.nutrition_advice || "",
        personalized_medicine_schedule: result?.personalized_medicine_schedule || [],
        ai_health_fitness_tips: result?.ai_health_fitness_tips || [],
        language: input.language,
        disclaimer: result?.disclaimer || "This is not a medical diagnosis. Consult a doctor.",
        ui_style: result?.ui_style || {
          button_shadow: "shadow-md shadow-blue-300 rounded-xl hover:scale-105",
          font_shadow: "1px 1px 3px rgba(0,0,0,0.3)",
          card_shadow: "shadow-lg rounded-xl hover:scale-105",
          severity_colors: { mild: "#a8e6a1", moderate: "#ffd966", severe: "#ff4d4d" },
          "3d_elements": ["rotating_pill_model", "highlighted_body_map"],
        },
      }

      setAnalysisResult(mappedResult)

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("symptom_analysis_completed", {
          userId: currentUser.uid,
          symptoms: input.symptoms,
          result: mappedResult,
        })
      }

      toast.success("Analysis completed successfully!")
    } catch (error: any) {
      console.error("Analysis error:", error)
      toast.error(error.message || "Analysis failed. Please try again.")

      // Provide fallback analysis (kept same as original)
      const fallbackResult: AnalysisResult = {
        primary_disease: {
          name: "General Health Concern",
          image_url: "",
          confidence_percent: "70%",
          description:
            "Based on your symptoms, this appears to be a general health concern. Please consult a healthcare provider for proper diagnosis.",
        },
        alternative_diseases: [
          { name: "Common Cold", confidence_percent: "50%" },
          { name: "Viral Infection", confidence_percent: "40%" },
        ],
        medicines: [
          {
            name: "Paracetamol",
            image_url: "/images/paracetamol.jpg",
            dosage: "500mg every 6 hours",
            notes: "For fever and pain relief",
            price_npr: "50-100",
          },
        ],
        alternative_medicines: [],
        food_to_eat: ["Plenty of fluids", "Fresh fruits", "Light, easily digestible foods", "Warm soups and broths"],
        food_to_avoid: ["Dairy products", "Spicy foods", "Caffeinated beverages", "Processed foods"],
        natural_remedies: ["Get adequate rest", "Stay hydrated", "Use steam inhalation", "Gargle with warm salt water"],
        exercise_tips: [
          "Avoid strenuous exercise during illness",
          "Light stretching when feeling better",
          "Short walks in fresh air if no fever",
        ],
        side_effects: ["Drowsiness from medications", "Stomach upset if taken on empty stomach"],
        allergy_warnings: ["Check medicine ingredients against known allergies"],
        severity: "moderate",
        contagious: "no",
        prevention_tips: [
          "Wash hands frequently",
          "Avoid close contact with sick individuals",
          "Maintain good hygiene",
        ],
        medicine_usage_timeline: "Take as directed for 3-5 days",
        stop_medicine_when: "When symptoms improve",
        see_doctor_if: "Symptoms worsen or persist beyond 5 days",
        emergency_symptoms: ["High fever above 39°C", "Difficulty breathing", "Severe dehydration"],
        urgency_status: "🟡",
        bmi:
          input.height_cm && input.weight_kg
            ? Number.parseFloat(input.weight_kg) / Math.pow(Number.parseFloat(input.height_cm) / 100, 2)
            : 0,
        fitness_advice: "Maintain regular physical activity for good health",
        nutrition_advice: "Eat a balanced diet with plenty of fruits and vegetables",
        personalized_medicine_schedule: [
          {
            medicine_name: "Paracetamol",
            dose: "500mg",
            times: ["08:00", "14:00", "20:00"],
            before_or_after_food: "after",
            food_recommendation: "Take with light snack",
            notes: "For fever and pain relief",
          },
        ],
        ai_health_fitness_tips: [
          "Get 7-9 hours of quality sleep",
          "Stay hydrated",
          "Practice stress-reduction techniques",
        ],
        language: input.language,
        disclaimer: "This is not a medical diagnosis. Please consult a doctor for proper evaluation and treatment.",
        ui_style: {
          button_shadow: "shadow-md shadow-blue-300 rounded-xl hover:scale-105",
          font_shadow: "1px 1px 3px rgba(0,0,0,0.3)",
          card_shadow: "shadow-lg rounded-xl hover:scale-105",
          severity_colors: {
            mild: "#a8e6a1",
            moderate: "#ffd966",
            severe: "#ff4d4d",
          },
          "3d_elements": ["rotating_pill_model", "highlighted_body_map"],
        },
      }

      setAnalysisResult(fallbackResult)
      toast.info("Showing basic analysis. For detailed results, please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const addSymptom = () => {
    if (currentSymptom.trim() && !input.symptoms.includes(currentSymptom.trim())) {
      setInput({
        ...input,
        symptoms: [...input.symptoms, currentSymptom.trim()],
      })
      setCurrentSymptom("")
    }
  }

  const addFeeling = () => {
    if (currentFeeling.trim() && !input.other_feelings.includes(currentFeeling.trim())) {
      setInput({
        ...input,
        other_feelings: [...input.other_feelings, currentFeeling.trim()],
      })
      setCurrentFeeling("")
    }
  }

  const addAllergy = () => {
    if (currentAllergy.trim() && !input.allergies.includes(currentAllergy.trim())) {
      setInput({
        ...input,
        allergies: [...input.allergies, currentAllergy.trim()],
      })
      setCurrentAllergy("")
    }
  }

  const addCondition = () => {
    if (currentCondition.trim() && !input.medical_history.includes(currentCondition.trim())) {
      setInput({
        ...input,
        medical_history: [...input.medical_history, currentCondition.trim()],
      })
      setCurrentCondition("")
    }
  }

  const removeItem = (type: string, item: string) => {
    switch (type) {
      case "symptom":
        setInput({
          ...input,
          symptoms: input.symptoms.filter((s) => s !== item),
        })
        break
      case "feeling":
        setInput({
          ...input,
          other_feelings: input.other_feelings.filter((f) => f !== item),
        })
        break
      case "allergy":
        setInput({
          ...input,
          allergies: input.allergies.filter((a) => a !== item),
        })
        break
      case "condition":
        setInput({
          ...input,
          medical_history: input.medical_history.filter((c) => c !== item),
        })
        break
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "mild":
        return "text-green-400"
      case "moderate":
        return "text-yellow-400"
      case "severe":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "mild":
        return "bg-green-400/10"
      case "moderate":
        return "bg-yellow-400/10"
      case "severe":
        return "bg-red-400/10"
      default:
        return "bg-gray-400/10"
    }
  }

  const speakAnalysisResult = (result: AnalysisResult) => {
    if ("speechSynthesis" in window) {
      const text = `Analysis complete. You may have ${result.primary_disease.name} with ${result.severity} severity. 
        Confidence level is ${result.primary_disease.confidence_percent}. 
        ${result.see_doctor_if ? "Doctor consultation is recommended." : "You can manage this with home care."}`

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Activity className="w-8 h-8 text-red-400 animate-pulse" />
            <h1 className="text-3xl font-bold neon-text">🩺 Symptom Analyzer</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto mb-4">
            Describe your symptoms and get instant health recommendations. Our smart system will analyze your condition
            and provide personalized advice.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-xl mb-8 shadow-3d"
        >
          <div className="space-y-6">
            {/* Language Toggle */}
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">Language</label>
              {/* <LanguageToggle
                value={input.language}
                onChange={(lang: string) => setInput({ ...input, language: lang })}
              /> */}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Age *</label>
                <input
                  type="number"
                  value={input.age}
                  onChange={(e) => setInput({ ...input, age: e.target.value })}
                  placeholder="e.g., 25"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Gender *</label>
                <select
                  value={input.gender}
                  onChange={(e) => setInput({ ...input, gender: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Height and Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Height (cm)</label>
                <input
                  type="number"
                  value={input.height_cm}
                  onChange={(e) => setInput({ ...input, height_cm: e.target.value })}
                  placeholder="e.g., 170"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Weight (kg)</label>
                <input
                  type="number"
                  value={input.weight_kg}
                  onChange={(e) => setInput({ ...input, weight_kg: e.target.value })}
                  placeholder="e.g., 65"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Symptoms *</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentSymptom}
                  onChange={(e) => setCurrentSymptom(e.target.value)}
                  placeholder="e.g., fever, headache, cough"
                  className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && addSymptom()}
                />
                <button
                  onClick={addSymptom}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {input.symptoms.map((symptom) => (
                  <div key={symptom} className="flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full">
                    <span>{symptom}</span>
                    <button
                      onClick={() => removeItem("symptom", symptom)}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Temperature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center space-x-2">
                  <Thermometer className="w-4 h-4" />
                  <span>Body Temperature</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={input.temperature.value}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        temperature: { ...input.temperature, value: e.target.value },
                      })
                    }
                    placeholder="e.g., 37.5"
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                  />
                  <select
                    value={input.temperature.unit}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        temperature: { ...input.temperature, unit: e.target.value },
                      })
                    }
                    className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="C">°C</option>
                    <option value="F">°F</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Duration (days)</label>
                <input
                  type="number"
                  value={input.duration_days}
                  onChange={(e) => setInput({ ...input, duration_days: e.target.value })}
                  placeholder="e.g., 3"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Feelings */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">How are you feeling?</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentFeeling}
                  onChange={(e) => setCurrentFeeling(e.target.value)}
                  placeholder="e.g., tired, anxious, weak"
                  className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && addFeeling()}
                />
                <button
                  onClick={addFeeling}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {input.other_feelings.map((feeling) => (
                  <div key={feeling} className="flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full">
                    <span>{feeling}</span>
                    <button
                      onClick={() => removeItem("feeling", feeling)}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Allergies</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentAllergy}
                  onChange={(e) => setCurrentAllergy(e.target.value)}
                  placeholder="e.g., penicillin, peanuts"
                  className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && addAllergy()}
                />
                <button
                  onClick={addAllergy}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {input.allergies.map((allergy) => (
                  <div key={allergy} className="flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full">
                    <span>{allergy}</span>
                    <button
                      onClick={() => removeItem("allergy", allergy)}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical History */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Medical History</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentCondition}
                  onChange={(e) => setCurrentCondition(e.target.value)}
                  placeholder="e.g., diabetes, hypertension"
                  className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && addCondition()}
                />
                <button
                  onClick={addCondition}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {input.medical_history.map((condition) => (
                  <div key={condition} className="flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full">
                    <span>{condition}</span>
                    <button
                      onClick={() => removeItem("condition", condition)}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pregnancy Status */}
            {input.gender === "female" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Pregnancy Status</label>
                <select
                  value={input.pregnancy_status}
                  onChange={(e) => setInput({ ...input, pregnancy_status: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            )}

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Location</label>
              <input
                type="text"
                value={input.location}
                onChange={(e) => setInput({ ...input, location: e.target.value })}
                placeholder="e.g., Kathmandu, Nepal"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input.symptoms.length || !input.age || !input.gender}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>🔍 Analyzing your symptoms...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>🚀 Analyze Symptoms</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Analysis Result */}
        {analysisResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Condition Overview */}
            <div className="glass p-6 rounded-xl shadow-3d">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{analysisResult.primary_disease.name}</h3>
                <div className="flex items-center space-x-2">
                  <PDFExporter data={analysisResult} type="analysis" language={input.language} />
                  <button
                    onClick={() => speakAnalysisResult(analysisResult)}
                    className="flex items-center space-x-2 px-3 py-1 rounded-lg text-sm bg-green-400/20 text-green-400 hover:bg-green-400/30 transition-all duration-300"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>🔊 Listen to Results</span>
                  </button>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityBg(analysisResult.severity)} ${getSeverityColor(analysisResult.severity)}`}
                  >
                    {analysisResult.severity.toUpperCase()} RISK
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">📊 Confidence: {analysisResult.primary_disease.confidence_percent}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">🦠 Contagious: {analysisResult.contagious === "yes" ? "Yes" : "No"}</span>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{analysisResult.primary_disease.description}</p>

              {analysisResult.urgency_status === "🔴" && (
                <div className="flex items-center space-x-2 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">⚠️ Emergency - Seek medical attention immediately</span>
                </div>
              )}

              {analysisResult.alternative_diseases.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold mb-2">Alternative Possible Conditions</h4>
                  <div className="space-y-2">
                    {analysisResult.alternative_diseases.map((disease, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                        <span>{disease.name}</span>
                        <span className="text-blue-400">{disease.confidence_percent}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Medicines */}
            {analysisResult.medicines.length > 0 && (
              <div className="glass p-6 rounded-xl shadow-3d">
                <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Pill className="w-5 h-5 text-green-400" />
                  <span>💊 Recommended Medicines</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.medicines.map((medicine, index) => (
                    <div key={index} className="glass p-4 rounded-lg shadow-3d">
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={medicine.image_url || "/placeholder.svg?height=48&width=48&text=Medicine"}
                          alt={medicine.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h5 className="font-semibold">{medicine.name}</h5>
                          <p className="text-sm text-gray-400">{medicine.dosage}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{medicine.notes}</p>
                      <p className="text-sm text-green-400">💰 NPR {medicine.price_npr}</p>
                    </div>
                  ))}
                </div>

                {analysisResult.alternative_medicines.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-lg font-medium mb-2">Alternative Medicines</h5>
                    <div className="space-y-2">
                      {analysisResult.alternative_medicines.map((medicine, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                          <span>{medicine.name}</span>
                          <span className="text-blue-400">NPR {medicine.price_npr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Medicine Schedule */}
            {analysisResult.personalized_medicine_schedule.length > 0 && (
              <div className="glass p-6 rounded-xl shadow-3d">
                <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span>⏰ Medicine Schedule</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2">Medicine</th>
                        <th className="text-left py-2">Dose</th>
                        <th className="text-left py-2">Times</th>
                        <th className="text-left py-2">With Food</th>
                        <th className="text-left py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResult.personalized_medicine_schedule.map((schedule, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-3">{schedule.medicine_name}</td>
                          <td className="py-3">{schedule.dose}</td>
                          <td className="py-3">{schedule.times.join(", ")}</td>
                          <td className="py-3">{schedule.before_or_after_food} food</td>
                          <td className="py-3 text-sm text-gray-400">{schedule.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Food Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-xl shadow-3d">
                <h4 className="text-xl font-semibold mb-4 text-green-400">🥗 Foods to Eat</h4>
                <ul className="space-y-2">
                  {analysisResult.food_to_eat.map((food, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{food}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass p-6 rounded-xl shadow-3d">
                <h4 className="text-xl font-semibold mb-4 text-red-400">🚫 Foods to Avoid</h4>
                <ul className="space-y-2">
                  {analysisResult.food_to_avoid.map((food, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{food}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Natural Remedies */}
            {analysisResult.natural_remedies.length > 0 && (
              <div className="glass p-6 rounded-xl shadow-3d">
                <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Home className="w-5 h-5 text-blue-400" />
                  <span>🌿 Natural Remedies</span>
                </h4>
                <ul className="space-y-3">
                  {analysisResult.natural_remedies.map((remedy, index) => (
                    <li key={index} className="text-gray-300">
                      • {remedy}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exercise and Lifestyle */}
            <div className="glass p-6 rounded-xl shadow-3d">
              <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span>🏋️ Exercise & Lifestyle Tips</span>
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Exercise Recommendations</h5>
                  <ul className="space-y-2">
                    {analysisResult.exercise_tips.map((tip, index) => (
                      <li key={index} className="text-gray-300">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Fitness Advice</h5>
                  <p className="text-gray-300">{analysisResult.fitness_advice}</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Nutrition Advice</h5>
                  <p className="text-gray-300">{analysisResult.nutrition_advice}</p>
                </div>
                {analysisResult.bmi > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">BMI Analysis</h5>
                    <p className="text-gray-300">
                      Your BMI is {analysisResult.bmi.toFixed(1)} -{" "}
                      {analysisResult.bmi < 18.5
                        ? "Underweight"
                        : analysisResult.bmi < 25
                          ? "Normal weight"
                          : analysisResult.bmi < 30
                            ? "Overweight"
                            : "Obese"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Warnings and Precautions */}
            <div className="glass p-6 rounded-xl shadow-3d">
              <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-yellow-400">
                <AlertTriangle className="w-5 h-5" />
                <span>⚠️ Warnings & Precautions</span>
              </h4>
              <div className="space-y-4">
                {analysisResult.side_effects.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Possible Side Effects</h5>
                    <ul className="space-y-2">
                      {analysisResult.side_effects.map((effect, index) => (
                        <li key={index} className="text-gray-300">
                          • {effect}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysisResult.allergy_warnings.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Allergy Warnings</h5>
                    <ul className="space-y-2">
                      {analysisResult.allergy_warnings.map((warning, index) => (
                        <li key={index} className="text-gray-300">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysisResult.contagious === "yes" && (
                  <div>
                    <h5 className="font-medium mb-2">Prevention Tips</h5>
                    <ul className="space-y-2">
                      {analysisResult.prevention_tips.map((tip, index) => (
                        <li key={index} className="text-gray-300">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h5 className="font-medium mb-2">When to Stop Medicine</h5>
                  <p className="text-gray-300">{analysisResult.stop_medicine_when}</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">When to See a Doctor</h5>
                  <p className="text-gray-300">{analysisResult.see_doctor_if}</p>
                </div>
                {analysisResult.emergency_symptoms.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2 text-red-400">Emergency Symptoms</h5>
                    <ul className="space-y-2">
                      {analysisResult.emergency_symptoms.map((symptom, index) => (
                        <li key={index} className="text-gray-300">
                          • {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* AI Health Tips */}
            {analysisResult.ai_health_fitness_tips.length > 0 && (
              <div className="glass p-6 rounded-xl shadow-3d">
                <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span>🤖 AI Health & Fitness Tips</span>
                </h4>
                <ul className="space-y-3">
                  {analysisResult.ai_health_fitness_tips.map((tip, index) => (
                    <li key={index} className="text-gray-300">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Emergency Contact */}
            {analysisResult.urgency_status === "🔴" && (
              <div className="glass p-6 rounded-xl border border-red-400/20 shadow-3d">
                <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-red-400">
                  <Phone className="w-5 h-5" />
                  <span>🚨 Emergency Contacts</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="tel:102"
                    className="flex items-center space-x-3 p-3 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors"
                  >
                    <div className="w-10 h-10 bg-red-400/20 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold">🚑 Emergency Ambulance</p>
                      <p className="text-sm text-gray-400">102</p>
                    </div>
                  </a>

                  <a
                    href="tel:1166"
                    className="flex items-center space-x-3 p-3 bg-blue-400/10 rounded-lg hover:bg-blue-400/20 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold">🏥 Health Hotline</p>
                      <p className="text-sm text-gray-400">1166</p>
                    </div>
                  </a>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="text-center text-sm text-gray-500 mt-8 p-4 bg-gray-800/50 rounded-lg">
              <p>{analysisResult.disclaimer}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default SymptomAnalyzer
