import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaMicrophone, FaMicrophoneSlash, FaBrain, FaFilePdf, FaDownload } from 'react-icons/fa'
import VoiceRecorder from '../components/VoiceRecorder'
import PDFExporter from '../components/PDFExporter'
import LanguageToggle from '../components/LanguageToggle'
import translations from '../data/translations.json'

interface AnalysisResult {
  analysis: string
  recommendations: string[]
  precautions: string[]
  confidence: number
  type: string
}

const EnhancedSymptomAnalyzer: React.FC = () => {
  const [language, setLanguage] = useState('en')
  const [symptoms, setSymptoms] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [isUsingFallback, setIsUsingFallback] = useState(false)

  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = translations
    for (const k of keys) {
      value = value?.[k]
    }
    return value?.[language] || value?.['en'] || key
  }

  // Fallback analysis data
  const fallbackAnalysis = {
    analysis: "Based on your symptoms, here are some general recommendations. Please consult a healthcare professional for proper diagnosis.",
    recommendations: [
      "Stay hydrated and get adequate rest",
      "Monitor your symptoms closely",
      "Consider over-the-counter medications for symptom relief",
      "Maintain a healthy diet and lifestyle"
    ],
    precautions: [
      "Avoid self-diagnosis",
      "Seek medical attention if symptoms worsen",
      "Do not ignore severe symptoms",
      "Follow prescribed medications as directed"
    ],
    confidence: 0.7,
    type: "general"
  }

  const analyzeSymptoms = async (symptomText: string, retryAttempt = 0): Promise<AnalysisResult> => {
    try {
      const response = await fetch('/api/analyzeSymptom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Analyze these symptoms: ${symptomText}. Provide recommendations, precautions, and general advice. Consider common diseases in Nepal.`,
          language: language
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.result) {
        // Parse the AI response
        try {
          const parsedResult = JSON.parse(data.result)
          return {
            analysis: parsedResult.analysis || data.result,
            recommendations: parsedResult.recommendations || [],
            precautions: parsedResult.precautions || [],
            confidence: parsedResult.confidence || 0.8,
            type: parsedResult.type || 'symptom'
          }
        } catch (parseError) {
          // If parsing fails, treat the entire response as analysis
          return {
            analysis: data.result,
            recommendations: [],
            precautions: [],
            confidence: 0.7,
            type: 'symptom'
          }
        }
      } else {
        throw new Error(data.message || 'Analysis failed')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      
      // Retry logic (up to 2 retries)
      if (retryAttempt < 2) {
        console.log(`Retrying analysis... Attempt ${retryAttempt + 1}`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryAttempt + 1))) // Exponential backoff
        return analyzeSymptoms(symptomText, retryAttempt + 1)
      }
      
      // Use fallback after all retries fail
      setIsUsingFallback(true)
      return fallbackAnalysis
    }
  }

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      setError('Please describe your symptoms')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setAnalysisResult(null)
    setIsUsingFallback(false)
    setRetryCount(0)

    try {
      const result = await analyzeSymptoms(symptoms)
      setAnalysisResult(result)
    } catch (error) {
      setError('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleVoiceInput = (text: string) => {
    setSymptoms(text)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8"
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <FaBrain className="text-4xl text-blue-500" />
            <h1 className="text-4xl font-bold text-gray-800">
              {t('symptomAnalyzer.title')}
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('symptomAnalyzer.description')}
          </p>
        </motion.div>

        {/* Language Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mb-8"
        >
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        </motion.div>

        {/* Input Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('symptomAnalyzer.placeholder')}
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder={t('symptomAnalyzer.placeholder')}
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Voice Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('symptomAnalyzer.voiceInput')}
              </label>
              <VoiceRecorder onTranscript={handleVoiceInput} />
            </div>

            {/* Analyze Button */}
            <motion.button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !symptoms.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
              whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>{t('common.loading')}</span>
                </div>
              ) : (
                <span>{t('common.analyze')}</span>
              )}
            </motion.button>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <p className="text-red-600">{error}</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Analysis Results */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaBrain className="text-2xl" />
                  <div>
                    <h2 className="text-2xl font-bold">Analysis Results</h2>
                    {isUsingFallback && (
                      <p className="text-green-100 text-sm">
                        {t('symptomAnalyzer.analysisFailed')}
                      </p>
                    )}
                  </div>
                </div>
                <PDFExporter
                  data={analysisResult}
                  type="analysis"
                  language={language}
                  className="text-white border-white hover:bg-white hover:text-green-600"
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Analysis */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-gray-800">Analysis</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700">{analysisResult.analysis}</p>
                  </div>
                </motion.div>

                {/* Confidence */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-gray-800">Confidence</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${analysisResult.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {Math.round(analysisResult.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Recommendations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-gray-800">
                    {t('symptomAnalyzer.recommendations')}
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                {/* Precautions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-gray-800">
                    {t('symptomAnalyzer.precautions')}
                  </h3>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {analysisResult.precautions.map((prec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-gray-700">{prec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>

              {/* Disclaimer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <p className="text-yellow-800 text-sm">
                  {t('symptomAnalyzer.consultDoctor')}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default EnhancedSymptomAnalyzer

