"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Send,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Pill,
  Home,
  Phone,
  Mic,
  Volume2,
  Thermometer,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../context/SocketContext"
import { apiClient } from "../services/api"
import VoiceRecognition from "../components/VoiceRecognition"
import VoiceTutorial from "../components/VoiceTutorial"
import LoginPrompt from "../components/LoginPrompt"

interface AnalysisResult {
  possibleConditions: Array<{
    name: string
    nameNepali?: string
    nameHindi?: string
    probability: number
    severity: "low" | "medium" | "high" | "critical"
    description: string
    symptoms: string[]
    causes: string[]
    riskFactors: string[]
  }>
  recommendations: {
    immediateActions: string[]
    medicines: Array<{
      name: string
      genericName: string
      dosage: string
      frequency: string
      duration: string
      instructions: string
      sideEffects: string[]
      contraindications: string[]
      price: {
        min: number
        max: number
        currency: string
      }
      alternatives: string[]
      image?: string
    }>
    homeRemedies: Array<{
      name: string
      description: string
      ingredients: string[]
      preparation: string
      usage: string
      precautions: string[]
    }>
    lifestyle: {
      diet: {
        recommended: string[]
        avoid: string[]
        supplements: string[]
      }
      exercise: {
        recommended: string[]
        avoid: string[]
        duration: string
      }
      sleep: {
        duration: string
        position: string
        environment: string[]
      }
    }
    followUp: {
      timeframe: string
      symptoms: string[]
      tests: string[]
    }
  }
  doctorConsultation: {
    required: boolean
    urgency: "immediate" | "within-24h" | "within-week" | "routine"
    specialization: string[]
    reasons: string[]
  }
  confidence: number
  riskLevel: "low" | "medium" | "high" | "critical"
}

const SymptomAnalyzer = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { socket } = useSocket()
  const [symptoms, setSymptoms] = useState("")
  const [temperature, setTemperature] = useState("")
  const [temperatureUnit, setTemperatureUnit] = useState<"C" | "F">("C")
  const [emotions, setEmotions] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showVoiceTutorial, setShowVoiceTutorial] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (socket) {
      socket.on("symptom_analysis_complete", (data) => {
        if (data.sessionId === sessionId) {
          setResult(data.analysis)
          setIsAnalyzing(false)
          toast.success("Analysis completed successfully!")
        }
      })

      return () => {
        socket.off("symptom_analysis_complete")
      }
    }
  }, [socket, sessionId])

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms")
      return
    }

    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await apiClient.post("/symptoms/analyze", {
        symptoms: symptoms
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        temperature: temperature
          ? {
              value: Number.parseFloat(temperature),
              unit: temperatureUnit,
            }
          : undefined,
        emotions: emotions
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e.length > 0),
        language: "en",
      })

      if (response.data.success) {
        setResult(response.data.data.analysis)
        setSessionId(response.data.data.sessionId)
        toast.success("Analysis completed successfully!")
      } else {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      console.error("Analysis error:", error)
      toast.error(error.response?.data?.message || "Failed to analyze symptoms")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "text-green-400"
      case "medium":
        return "text-yellow-400"
      case "high":
        return "text-red-400"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-400"
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-400/10"
      case "medium":
        return "bg-yellow-400/10"
      case "high":
        return "bg-red-400/10"
      case "critical":
        return "bg-red-600/10"
      default:
        return "bg-gray-400/10"
    }
  }

  const speakAnalysisResult = (result: AnalysisResult) => {
    if ("speechSynthesis" in window && result.possibleConditions.length > 0) {
      const condition = result.possibleConditions[0]
      const text = `Analysis complete. You may have ${condition.name} with ${condition.severity} severity. 
        Confidence level is ${result.confidence} percent. 
        ${result.doctorConsultation.required ? "Doctor consultation is recommended." : "You can manage this with home care."}`

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

          <button
            onClick={() => setShowVoiceTutorial(true)}
            className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-400/20 text-blue-400 rounded-lg hover:bg-blue-400/30 transition-colors glass"
          >
            <Mic className="w-4 h-4" />
            <span>🎤 Learn Voice Features</span>
          </button>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-xl mb-8 shadow-3d"
        >
          <div className="space-y-6">
            {/* Symptoms Input */}
            <VoiceRecognition
              value={symptoms}
              onChange={setSymptoms}
              placeholder="e.g., fever, headache, cough, sore throat... or click Voice to speak"
              label="🤒 Describe your symptoms *"
              isTextArea={true}
              language="en-US"
            />

            {/* Temperature and Emotions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Temperature Input */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center space-x-2">
                  <Thermometer className="w-4 h-4" />
                  <span>🌡️ Body Temperature (Optional)</span>
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="37.5"
                    className="glow-input flex-1 rounded-r-none"
                    step="0.1"
                  />
                  <div className="flex glass border-l-0 rounded-l-none rounded-r-lg">
                    <button
                      type="button"
                      onClick={() => setTemperatureUnit("C")}
                      className={`px-3 py-2 text-sm transition-colors ${
                        temperatureUnit === "C" ? "text-blue-400 bg-blue-400/20" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      °C
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemperatureUnit("F")}
                      className={`px-3 py-2 text-sm transition-colors ${
                        temperatureUnit === "F" ? "text-blue-400 bg-blue-400/20" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      °F
                    </button>
                  </div>
                </div>
              </div>

              {/* Emotions Input */}
              <VoiceRecognition
                value={emotions}
                onChange={setEmotions}
                placeholder="tired, anxious, weak... or click Voice to speak"
                label="😔 How are you feeling? (Optional)"
                language="en-US"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !symptoms.trim()}
              className="glow-button w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 btn-3d-primary"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="loading-dots">🔍 Analyzing your symptoms</span>
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
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Condition Overview */}
            <div className="glass p-6 rounded-xl shadow-3d">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{result.possibleConditions[0]?.name}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => speakAnalysisResult(result)}
                    className="flex items-center space-x-2 px-3 py-1 rounded-lg text-sm bg-green-400/20 text-green-400 hover:bg-green-400/30 transition-all duration-300 btn-3d-success"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>🔊 Listen to Results</span>
                  </button>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityBg(result.riskLevel)} ${getSeverityColor(result.riskLevel)}`}
                  >
                    {result.riskLevel.toUpperCase()} RISK
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">📊 Confidence: {result.confidence}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">⏰ Follow-up: {result.recommendations.followUp.timeframe}</span>
                </div>
              </div>

              {result.doctorConsultation.required && (
                <div className="flex items-center space-x-2 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">⚠️ Doctor consultation recommended</span>
                </div>
              )}
            </div>

            {/* Medicines */}
            {result.recommendations.medicines.length > 0 && (
              <div className="glass p-6 rounded-xl shadow-3d">
                <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Pill className="w-5 h-5 text-green-400" />
                  <span>💊 Recommended Medicines</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.recommendations.medicines.map((medicine, index) => (
                    <div key={index} className="glass p-4 rounded-lg shadow-3d">
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={medicine.image || "/placeholder.svg?height=48&width=48&text=Medicine"}
                          alt={medicine.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h5 className="font-semibold">{medicine.name}</h5>
                          <p className="text-sm text-gray-400">{medicine.dosage}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{medicine.duration}</p>
                      <p className="text-sm text-green-400">
                        💰 NPR {medicine.price.min}-{medicine.price.max}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Home Remedies */}
            {result.recommendations.homeRemedies.length > 0 && (
              <div className="glass p-6 rounded-xl shadow-3d">
                <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Home className="w-5 h-5 text-blue-400" />
                  <span>🏠 Home Remedies</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.recommendations.homeRemedies.map((remedy, index) => (
                    <div key={index} className="glass p-4 rounded-lg shadow-3d">
                      <h5 className="font-semibold mb-2">{remedy.name}</h5>
                      <p className="text-sm text-gray-300 mb-2">{remedy.description}</p>
                      <div className="text-xs text-gray-400">
                        <p>
                          <strong>🥄 Ingredients:</strong> {remedy.ingredients.join(", ")}
                        </p>
                        <p>
                          <strong>📝 Usage:</strong> {remedy.usage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Food Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-xl shadow-3d">
                <h4 className="text-xl font-semibold mb-4 text-green-400">🥗 Foods to Eat</h4>
                <ul className="space-y-2">
                  {result.recommendations.lifestyle.diet.recommended.map((food, index) => (
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
                  {result.recommendations.lifestyle.diet.avoid.map((food, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{food}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Emergency Contact */}
            {result.doctorConsultation.required && (
              <div className="glass p-6 rounded-xl border border-red-400/20 shadow-3d">
                <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-red-400">
                  <Phone className="w-5 h-5" />
                  <span>🚨 Emergency Contacts</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="tel:102"
                    className="flex items-center space-x-3 p-3 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors btn-3d-danger"
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
                    className="flex items-center space-x-3 p-3 bg-blue-400/10 rounded-lg hover:bg-blue-400/20 transition-colors btn-3d-primary"
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
          </motion.div>
        )}

        {/* Voice Tutorial */}
        <VoiceTutorial isOpen={showVoiceTutorial} onClose={() => setShowVoiceTutorial(false)} />

        {/* Login Prompt */}
        <LoginPrompt
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          message="Please login to analyze your symptoms and get personalized health recommendations."
        />
      </div>
    </div>
  )
}

export default SymptomAnalyzer
