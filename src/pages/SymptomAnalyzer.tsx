"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  Heart,
  Brain,
  Eye,
  Search,
  Star,
  TrendingUp,
  Shield,
  Zap,
  RefreshCw,
} from "lucide-react"
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
    treatmentSummary?: string
    complications?: string[]
    prognosis?: string
    image?: string
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
      effectiveness?: number
      prescription?: boolean
      availability?: string
      manufacturer?: string
    }>
    homeRemedies: Array<{
      name: string
      description: string
      ingredients: string[]
      preparation: string
      usage: string
      precautions: string[]
      effectiveness?: number
      image?: string
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
  analysisTime?: number
  sessionId?: string
}

const SymptomAnalyzer = () => {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [symptoms, setSymptoms] = useState("")
  const [temperature, setTemperature] = useState("")
  const [temperatureUnit, setTemperatureUnit] = useState<"C" | "F">("C")
  const [emotions, setEmotions] = useState("")
  const [painLevel, setPainLevel] = useState<number>(0)
  const [symptomDuration, setSymptomDuration] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showVoiceTutorial, setShowVoiceTutorial] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [realtimeSymptoms, setRealtimeSymptoms] = useState<string[]>([])

  // Real-time symptom detection
  const detectSymptoms = useCallback((text: string) => {
    const commonSymptoms = [
      "fever", "headache", "cough", "sore throat", "fatigue", "nausea", "vomiting",
      "diarrhea", "constipation", "dizziness", "chest pain", "back pain", "joint pain",
      "muscle pain", "shortness of breath", "runny nose", "sneezing", "itching",
      "rash", "swelling", "loss of appetite", "weight loss", "insomnia", "anxiety"
    ]
    
    const detected = commonSymptoms.filter(symptom => 
      text.toLowerCase().includes(symptom.toLowerCase())
    )
    
    setRealtimeSymptoms(detected)
  }, [])

  useEffect(() => {
    detectSymptoms(symptoms)
  }, [symptoms, detectSymptoms])

  useEffect(() => {
    if (socket) {
      socket.on("symptom_analysis_progress", (data) => {
        if (data.sessionId === sessionId) {
          setAnalysisProgress(data.progress)
          setCurrentStep(data.step)
        }
      })

      socket.on("symptom_analysis_complete", (data) => {
        if (data.sessionId === sessionId) {
          setResult(data.analysis)
          setIsAnalyzing(false)
          setAnalysisProgress(100)
          setCurrentStep("Analysis Complete")
          toast.success("🎉 Analysis completed successfully!")
        }
      })

      return () => {
        socket.off("symptom_analysis_progress")
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
    setAnalysisProgress(0)
    setCurrentStep("Initializing analysis...")

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
        painLevel,
        symptomDuration,
        language: "en",
      })

      if (response.data.success) {
        setResult(response.data.data.analysis)
        setSessionId(response.data.data.sessionId)
        toast.success("✅ Analysis completed successfully!")
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

  const resetAnalysis = () => {
    setResult(null)
    setAnalysisProgress(0)
    setCurrentStep("")
    setSessionId(null)
  }

  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Activity className="w-8 h-8 text-red-400 animate-pulse" />
            <h1 className="text-4xl font-bold neon-text">🩺 AI Symptom Analyzer</h1>
          </div>
          <p className="text-gray-400 max-w-3xl mx-auto mb-6 text-lg">
            Describe your symptoms and get instant AI-powered health analysis with personalized medicine recommendations. 
            Our advanced system provides real-time insights and comprehensive treatment suggestions.
          </p>

          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-400/20 rounded-lg">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm">Real-time Analysis</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-400/20 rounded-lg">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">95% Accuracy</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-purple-400/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm">Multiple Medicines</span>
            </div>
          </div>

          <button
            onClick={() => setShowVoiceTutorial(true)}
            className="flex items-center space-x-2 mx-auto px-6 py-3 bg-blue-400/20 text-blue-400 rounded-lg hover:bg-blue-400/30 transition-colors glass btn-3d-primary"
          >
            <Mic className="w-5 h-5" />
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
            {/* Symptoms Input with Real-time Detection */}
            <div className="relative">
              <VoiceRecognition
                value={symptoms}
                onChange={setSymptoms}
                placeholder="e.g., fever, headache, cough, sore throat... or click Voice to speak"
                label="🤒 Describe your symptoms *"
                isTextArea={true}
                language="en-US"
              />
              
              {/* Real-time Symptom Detection */}
              {realtimeSymptoms.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 bg-blue-400/10 border border-blue-400/20 rounded-lg"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Search className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 text-sm font-medium">Detected Symptoms:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {realtimeSymptoms.map((symptom, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-400/20 text-blue-400 rounded text-xs">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Enhanced Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Temperature Input */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center space-x-2">
                  <Thermometer className="w-4 h-4" />
                  <span>🌡️ Body Temperature</span>
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

              {/* Pain Level */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>😣 Pain Level (0-10)</span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painLevel}
                    onChange={(e) => setPainLevel(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>No Pain</span>
                    <span className="text-red-400 font-medium">{painLevel}/10</span>
                    <span>Severe</span>
                  </div>
                </div>
              </div>

              {/* Symptom Duration */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>⏱️ How long?</span>
                </label>
                <select
                  value={symptomDuration}
                  onChange={(e) => setSymptomDuration(e.target.value)}
                  className="glow-input w-full"
                >
                  <option value="">Select duration</option>
                  <option value="less-than-hour">Less than 1 hour</option>
                  <option value="few-hours">Few hours</option>
                  <option value="1-day">1 day</option>
                  <option value="2-3-days">2-3 days</option>
                  <option value="1-week">1 week</option>
                  <option value="more-than-week">More than 1 week</option>
                  <option value="chronic">Chronic (months)</option>
                </select>
              </div>
            </div>

            {/* Emotions Input */}
            <VoiceRecognition
              value={emotions}
              onChange={setEmotions}
              placeholder="tired, anxious, weak, stressed... or click Voice to speak"
              label="😔 How are you feeling emotionally?"
              language="en-US"
            />

            {/* Analyze Button */}
            <div className="space-y-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !symptoms.trim()}
                className="glow-button w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 btn-3d-primary relative overflow-hidden"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="loading-dots">🔍 {currentStep || "Analyzing symptoms"}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>🚀 Analyze Symptoms</span>
                  </>
                )}
              </button>

              {/* Progress Bar */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full bg-gray-700 rounded-full h-2"
                >
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </motion.div>
              )}

              {result && (
                <button
                  onClick={resetAnalysis}
                  className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>🔄 New Analysis</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Analysis Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Condition Overview */}
              <div className="glass p-6 rounded-xl shadow-3d">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-8 h-8 text-blue-400" />
                    <div>
                      <h3 className="text-2xl font-bold">{result.possibleConditions[0]?.name}</h3>
                      <p className="text-gray-400">{result.possibleConditions[0]?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => speakAnalysisResult(result)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm bg-green-400/20 text-green-400 hover:bg-green-400/30 transition-all duration-300 btn-3d-success"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>🔊 Listen</span>
                    </button>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-medium ${getSeverityBg(result.riskLevel)} ${getSeverityColor(result.riskLevel)}`}
                    >
                      {result.riskLevel.toUpperCase()} RISK
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center space-x-2 p-3 bg-green-400/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <span className="text-sm text-gray-400">Confidence</span>
                      <p className="font-semibold text-green-400">{result.confidence}%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-blue-400/10 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <div>
                      <span className="text-sm text-gray-400">Follow-up</span>
                      <p className="font-semibold text-blue-400">{result.recommendations.followUp.timeframe}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-purple-400/10 rounded-lg">
                    <Star className="w-5 h-5 text-purple-400" />
                    <div>
                      <span className="text-sm text-gray-400">Match</span>
                      <p className="font-semibold text-purple-400">{result.possibleConditions[0]?.probability}%</p>
                    </div>
                  </div>
                </div>

                {result.doctorConsultation.required && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-3 p-4 bg-red-400/10 border border-red-400/20 rounded-lg"
                  >
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <div>
                      <p className="text-red-400 font-medium">⚠️ Doctor consultation recommended</p>
                      <p className="text-sm text-gray-400">Urgency: {result.doctorConsultation.urgency}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Enhanced Medicines Section */}
              {result.recommendations.medicines.length > 0 && (
                <div className="glass p-6 rounded-xl shadow-3d">
                  <h4 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
                    <Pill className="w-6 h-6 text-green-400" />
                    <span>💊 Recommended Medicines</span>
                    <span className="text-sm text-gray-400">({result.recommendations.medicines.length} options)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.recommendations.medicines.map((medicine, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass p-4 rounded-lg shadow-3d hover:shadow-xl transition-all duration-300 border border-gray-700/50 hover:border-green-400/30"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="relative">
                            <img
                              src={medicine.image || `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop&crop=center`}
                              alt={medicine.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            {medicine.effectiveness && (
                              <div className="absolute -top-1 -right-1 bg-green-400 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                {medicine.effectiveness}%
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-lg">{medicine.name}</h5>
                            <p className="text-sm text-gray-400">{medicine.genericName}</p>
                            {medicine.prescription && (
                              <span className="inline-block mt-1 px-2 py-1 bg-orange-400/20 text-orange-400 text-xs rounded">
                                Prescription Required
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Dosage:</span>
                              <p className="font-medium">{medicine.dosage}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Duration:</span>
                              <p className="font-medium">{medicine.duration}</p>
                            </div>
                          </div>

                          <div className="p-3 bg-green-400/10 rounded-lg">
                            <p className="text-green-400 font-semibold text-lg">
                              💰 NPR {medicine.price.min}-{medicine.price.max}
                            </p>
                            {medicine.availability && (
                              <p className="text-xs text-gray-400 mt-1">{medicine.availability}</p>
                            )}
                          </div>

                          <div className="text-xs text-gray-400">
                            <p><strong>Instructions:</strong> {medicine.instructions}</p>
                            {medicine.sideEffects.length > 0 && (
                              <p className="mt-1"><strong>Side Effects:</strong> {medicine.sideEffects.slice(0, 2).join(", ")}</p>
                            )}
                          </div>

                          {medicine.alternatives.length > 0 && (
                            <div className="pt-2 border-t border-gray-700/50">
                              <p className="text-xs text-blue-400">
                                <strong>Alternatives:</strong> {medicine.alternatives.slice(0, 2).join(", ")}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Home Remedies */}
              {result.recommendations.homeRemedies.length > 0 && (
                <div className="glass p-6 rounded-xl shadow-3d">
                  <h4 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
                    <Home className="w-6 h-6 text-blue-400" />
                    <span>🏠 Natural Home Remedies</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.recommendations.homeRemedies.map((remedy, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass p-4 rounded-lg shadow-3d"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={remedy.image || `https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=100&h=100&fit=crop&crop=center`}
                            alt={remedy.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h5 className="font-semibold">{remedy.name}</h5>
                            {remedy.effectiveness && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span className="text-xs text-yellow-400">{remedy.effectiveness}% effective</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">{remedy.description}</p>
                        <div className="text-xs text-gray-400 space-y-2">
                          <p><strong>🥄 Ingredients:</strong> {remedy.ingredients.join(", ")}</p>
                          <p><strong>📝 Usage:</strong> {remedy.usage}</p>
                          {remedy.precautions.length > 0 && (
                            <p><strong>⚠️ Precautions:</strong> {remedy.precautions[0]}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multiple Conditions Analysis */}
              {result.possibleConditions.length > 1 && (
                <div className="glass p-6 rounded-xl shadow-3d">
                  <h4 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
                    <Eye className="w-6 h-6 text-purple-400" />
                    <span>🔍 Other Possible Conditions</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.possibleConditions.slice(1, 4).map((condition, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass p-4 rounded-lg border border-purple-400/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold">{condition.name}</h5>
                          <span className={`px-2 py-1 rounded text-xs ${getSeverityBg(condition.severity)} ${getSeverityColor(condition.severity)}`}>
                            {condition.probability}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{condition.description}</p>
                        {condition.treatmentSummary && (
                          <p className="text-xs text-blue-400 mt-2">💡 {condition.treatmentSummary}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Food Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-xl shadow-3d">
                  <h4 className="text-xl font-semibold mb-4 text-green-400 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>🥗 Foods to Eat</span>
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendations.lifestyle.diet.recommended.map((food, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start space-x-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{food}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="glass p-6 rounded-xl shadow-3d">
                  <h4 className="text-xl font-semibold mb-4 text-red-400 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>🚫 Foods to Avoid</span>
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendations.lifestyle.diet.avoid.map((food, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start space-x-2"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{food}</span>
                      </motion.li>
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
                      className="flex items-center space-x-3 p-4 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors btn-3d-danger"
                    >
                      <div className="w-12 h-12 bg-red-400/20 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <p className="font-semibold">🚑 Emergency Ambulance</p>
                        <p className="text-sm text-gray-400">Call 102 - 24/7 Available</p>
                      </div>
                    </a>

                    <a
                      href="tel:1166"
                      className="flex items-center space-x-3 p-4 bg-blue-400/10 rounded-lg hover:bg-blue-400/20 transition-colors btn-3d-primary"
                    >
                      <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold">🏥 Health Hotline</p>
                        <p className="text-sm text-gray-400">Call 1166 - Free Consultation</p>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Tutorial */}
        <VoiceTutorial isOpen={showVoiceTutorial} onClose={() => setShowVoiceTutorial(false)} />

        {/* Login Prompt */}
        <LoginPrompt
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          message="Please login to analyze your symptoms and get personalized health recommendations with multiple medicine suggestions."
        />
      </div>
    </div>
  )
}

export default SymptomAnalyzer