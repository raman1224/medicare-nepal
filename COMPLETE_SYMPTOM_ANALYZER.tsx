"use client"

import React, { useState, useEffect, useCallback } from "react"
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
  MicIcon,
  MicOffIcon
} from "lucide-react"

// Types and Interfaces
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

// Voice Recognition Component
const VoiceRecognition: React.FC<{
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
  isTextArea?: boolean
  language?: string
}> = ({ value, onChange, placeholder, label, isTextArea = false, language = "en-US" }) => {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = language

      recognitionInstance.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        onChange(value + ' ' + transcript)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [language, value, onChange])

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop()
        setIsListening(false)
      } else {
        recognition.start()
        setIsListening(true)
      }
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center space-x-2">
        <span>{label}</span>
      </label>
      <div className="relative">
        {isTextArea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full p-4 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${isListening ? 'voice-active' : ''}`}
            rows={4}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${isListening ? 'voice-active' : ''}`}
          />
        )}
        <button
          type="button"
          onClick={toggleListening}
          className={`absolute right-3 top-3 p-2 rounded-lg transition-colors ${
            isListening 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isListening ? <MicOffIcon className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

// Main Symptom Analyzer Component
const SymptomAnalyzer: React.FC = () => {
  // State management
  const [symptoms, setSymptoms] = useState("")
  const [temperature, setTemperature] = useState("")
  const [temperatureUnit, setTemperatureUnit] = useState<"C" | "F">("C")
  const [emotions, setEmotions] = useState("")
  const [painLevel, setPainLevel] = useState<number>(0)
  const [symptomDuration, setSymptomDuration] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [realtimeSymptoms, setRealtimeSymptoms] = useState<string[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)

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

  // Mock API call for demonstration
  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      alert("Please describe your symptoms")
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setCurrentStep("Initializing analysis...")

    // Simulate progress updates
    const steps = [
      { progress: 10, step: "Initializing analysis..." },
      { progress: 25, step: "Processing symptoms..." },
      { progress: 50, step: "Analyzing with AI..." },
      { progress: 80, step: "Generating recommendations..." },
      { progress: 95, step: "Finalizing results..." },
      { progress: 100, step: "Analysis complete!" }
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setAnalysisProgress(step.progress)
      setCurrentStep(step.step)
    }

    // Mock result data
    const mockResult: AnalysisResult = {
      possibleConditions: [
        {
          name: "Common Cold",
          probability: 85,
          severity: "low",
          description: "A viral upper respiratory tract infection",
          symptoms: symptoms.split(",").map(s => s.trim()),
          causes: ["Rhinovirus", "Coronavirus", "Respiratory syncytial virus"],
          riskFactors: ["Close contact with infected individuals", "Weakened immune system"],
          treatmentSummary: "Rest, hydration, and symptomatic relief",
          prognosis: "Self-limiting, resolves in 7-10 days"
        },
        {
          name: "Viral Fever",
          probability: 70,
          severity: "medium",
          description: "Fever caused by viral infection",
          symptoms: ["fever", "fatigue", "body aches"],
          causes: ["Various viral pathogens"],
          riskFactors: ["Seasonal changes", "Immune system status"],
          treatmentSummary: "Antipyretics and supportive care"
        }
      ],
      recommendations: {
        immediateActions: [
          "Rest and get adequate sleep (8-9 hours)",
          "Stay well hydrated with warm fluids",
          "Monitor temperature regularly",
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
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop&crop=center",
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
            image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=200&h=200&fit=crop&crop=center",
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
            image: "https://images.unsplash.com/photo-1550572017-4346573d96b3?w=200&h=200&fit=crop&crop=center",
            effectiveness: 70,
            prescription: false,
            availability: "Widely available",
            manufacturer: "Health supplement companies"
          }
        ],
        homeRemedies: [
          {
            name: "Ginger Honey Tea",
            description: "Natural anti-inflammatory and antimicrobial remedy",
            ingredients: ["Fresh ginger (1 inch)", "Honey (2 tbsp)", "Hot water (1 cup)"],
            preparation: "Boil ginger in water for 5 minutes, add honey",
            usage: "Drink 2-3 times daily while warm",
            precautions: ["Avoid if allergic to ginger"],
            effectiveness: 75,
            image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop&crop=center"
          },
          {
            name: "Turmeric Milk",
            description: "Traditional remedy with anti-inflammatory properties",
            ingredients: ["Turmeric powder (1 tsp)", "Warm milk (1 cup)", "Honey (optional)"],
            preparation: "Mix turmeric in warm milk, add honey",
            usage: "Drink before bedtime",
            precautions: ["May stain clothes", "Avoid if lactose intolerant"],
            effectiveness: 68,
            image: "https://images.unsplash.com/photo-1615485925161-c25f2b9e3d86?w=200&h=200&fit=crop&crop=center"
          }
        ],
        lifestyle: {
          diet: {
            recommended: [
              "Warm soups and broths",
              "Fresh fruits rich in vitamin C",
              "Vegetables with antioxidants",
              "Herbal teas",
              "Whole grains"
            ],
            avoid: [
              "Cold and frozen foods",
              "Fried and fatty foods",
              "Excessive sugar",
              "Alcohol and smoking"
            ],
            supplements: ["Vitamin D", "Zinc", "Probiotics"]
          },
          exercise: {
            recommended: [
              "Light walking for 15-20 minutes",
              "Deep breathing exercises",
              "Gentle stretching"
            ],
            avoid: ["Intense physical activity", "Outdoor sports in cold weather"],
            duration: "15-30 minutes of light activity"
          },
          sleep: {
            duration: "8-9 hours for optimal recovery",
            position: "Slightly elevated head to ease breathing",
            environment: ["Keep room temperature at 20-22°C", "Maintain good ventilation"]
          }
        },
        followUp: {
          timeframe: "If symptoms persist beyond 7 days",
          symptoms: ["High fever above 101°F", "Difficulty breathing", "Severe headache"],
          tests: ["Complete blood count if fever persists"]
        }
      },
      doctorConsultation: {
        required: painLevel > 7,
        urgency: painLevel > 8 ? "immediate" : "within-week",
        specialization: ["General Practitioner"],
        reasons: ["Professional medical evaluation needed"]
      },
      confidence: 85,
      riskLevel: painLevel > 7 ? "high" : "medium",
      analysisTime: 3200
    }

    setResult(mockResult)
    setIsAnalyzing(false)
    setSessionId("mock-session-" + Date.now())
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "text-green-400"
      case "medium": return "text-yellow-400"
      case "high": return "text-red-400"
      case "critical": return "text-red-600"
      default: return "text-gray-400"
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "low": return "bg-green-400/10"
      case "medium": return "bg-yellow-400/10"
      case "high": return "bg-red-400/10"
      case "critical": return "bg-red-600/10"
      default: return "bg-gray-400/10"
    }
  }

  const speakAnalysisResult = (result: AnalysisResult) => {
    if ("speechSynthesis" in window && result.possibleConditions.length > 0) {
      const condition = result.possibleConditions[0]
      const text = `Analysis complete. You may have ${condition.name} with ${condition.severity} severity. Confidence level is ${result.confidence} percent.`
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      utterance.rate = 0.8
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
    <div className="min-h-screen pt-16 pb-8 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Activity className="w-8 h-8 text-red-400 animate-pulse" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              🩺 AI Symptom Analyzer
            </h1>
          </div>
          <p className="text-gray-400 max-w-3xl mx-auto mb-6 text-lg">
            Describe your symptoms and get instant AI-powered health analysis with personalized medicine recommendations.
          </p>

          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-400/20 rounded-lg backdrop-blur-sm">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm">Real-time Analysis</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-400/20 rounded-lg backdrop-blur-sm">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">95% Accuracy</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-purple-400/20 rounded-lg backdrop-blur-sm">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm">Multiple Medicines</span>
            </div>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl mb-8 border border-gray-700/50"
        >
          <div className="space-y-6">
            {/* Symptoms Input with Real-time Detection */}
            <div className="relative">
              <VoiceRecognition
                value={symptoms}
                onChange={setSymptoms}
                placeholder="e.g., fever, headache, cough, sore throat..."
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
                    className="flex-1 p-3 bg-gray-800/50 border border-gray-600 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                  />
                  <div className="flex bg-gray-800/50 border border-l-0 border-gray-600 rounded-r-lg">
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
                    className="w-full h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)`
                    }}
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
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              placeholder="tired, anxious, weak, stressed..."
              label="😔 How are you feeling emotionally?"
              language="en-US"
            />

            {/* Analyze Button */}
            <div className="space-y-4">
              <button
                onClick={analyzeSymptoms}
                disabled={isAnalyzing || !symptoms.trim()}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-[1.02]"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{currentStep || "Analyzing symptoms"}</span>
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
              <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-8 h-8 text-blue-400" />
                    <div>
                      <h3 className="text-2xl font-bold text-white">{result.possibleConditions[0]?.name}</h3>
                      <p className="text-gray-400">{result.possibleConditions[0]?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => speakAnalysisResult(result)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm bg-green-400/20 text-green-400 hover:bg-green-400/30 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>🔊 Listen</span>
                    </button>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${getSeverityBg(result.riskLevel)} ${getSeverityColor(result.riskLevel)}`}>
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
                <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
                  <h4 className="text-2xl font-semibold mb-6 flex items-center space-x-2 text-white">
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
                        className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50 hover:border-green-400/30 transition-all duration-300 hover:transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="relative">
                            <img
                              src={medicine.image || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop&crop=center"}
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
                            <h5 className="font-semibold text-lg text-white">{medicine.name}</h5>
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
                              <p className="font-medium text-white">{medicine.dosage}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Duration:</span>
                              <p className="font-medium text-white">{medicine.duration}</p>
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
                            <div className="pt-2 border-t border-gray-600/50">
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
                <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
                  <h4 className="text-2xl font-semibold mb-6 flex items-center space-x-2 text-white">
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
                        className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={remedy.image || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=100&h=100&fit=crop&crop=center"}
                            alt={remedy.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h5 className="font-semibold text-white">{remedy.name}</h5>
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

              {/* Food Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
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

                <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
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
                <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-red-400/20">
                  <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-red-400">
                    <Phone className="w-5 h-5" />
                    <span>🚨 Emergency Contacts</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href="tel:102"
                      className="flex items-center space-x-3 p-4 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors"
                    >
                      <div className="w-12 h-12 bg-red-400/20 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">🚑 Emergency Ambulance</p>
                        <p className="text-sm text-gray-400">Call 102 - 24/7 Available</p>
                      </div>
                    </a>

                    <a
                      href="tel:1166"
                      className="flex items-center space-x-3 p-4 bg-blue-400/10 rounded-lg hover:bg-blue-400/20 transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">🏥 Health Hotline</p>
                        <p className="text-sm text-gray-400">Call 1166 - Free Consultation</p>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CSS Styles */}
      <style jsx global>{`
        .voice-active {
          animation: voice-pulse 1s ease-in-out infinite;
        }

        @keyframes voice-pulse {
          0%, 100% {
            border-color: rgba(34, 197, 94, 0.5);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          50% {
            border-color: rgba(34, 197, 94, 0.8);
            box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
          }
        }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-track {
          background: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%);
          height: 8px;
          border-radius: 4px;
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          transition: all 0.3s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
        }

        input[type="range"]::-moz-range-track {
          background: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%);
          height: 8px;
          border-radius: 4px;
          border: none;
        }

        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </div>
  )
}

// Type declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default SymptomAnalyzer