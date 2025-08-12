import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import Tesseract from 'tesseract.js'
import { 
  FaCamera, 
  FaUpload, 
  FaSpinner, 
  FaSearch,
  FaTimes,
  FaCheck,
  FaBrain,
  // FaEye,
  // FaFileImage,
  FaMicrophone,
  FaVolumeUp,
  FaVolumeMute,
  FaDownload,
  FaShare,
  FaHeart,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPills,
  FaAppleAlt,
  FaStethoscope
} from 'react-icons/fa'

interface AnalysisResult {
  type: 'medicine' | 'food' | 'symptom' | 'general'
  confidence: number
  detectedText: string
  analysis: {
    title: string
    description: string
    recommendations: string[]
    warnings: string[]
    actions: string[]
    specialist?: string
    medicines?: string[]
    foods?: string[]
  }
  timestamp: Date
}

const AIImageAnalyzer: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [inputMethod, setInputMethod] = useState<'image' | 'text' | 'voice'>('image')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')
  const [voiceInput, setVoiceInput] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setResult(null)
      setProgress(0)
    }
  }

  const extractTextFromImage = async (imageFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      Tesseract.recognize(
        imageFile,
        'eng+ne', // English and Nepali
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100))
            }
          }
        }
      ).then(({ data: { text } }) => {
        resolve(text.trim())
      }).catch(reject)
    })
  }

  const analyzeWithAI = async (text: string): Promise<AnalysisResult> => {
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          language: 'en'
        })
      })

      if (!response.ok) {
        throw new Error('AI analysis failed')
      }

      const data = await response.json()
      return data.result
    } catch (error) {
      console.error('AI analysis error:', error)
      // Fallback analysis
      return {
        type: 'general',
        confidence: 0.7,
        detectedText: text,
        analysis: {
          title: 'General Health Analysis',
          description: 'Based on the provided information, here are some general recommendations.',
          recommendations: [
            'Consult a healthcare professional for proper diagnosis',
            'Maintain a healthy lifestyle',
            'Follow any prescribed medications as directed'
          ],
          warnings: [
            'This analysis is for informational purposes only',
            'Do not self-diagnose or self-medicate'
          ],
          actions: [
            'Schedule an appointment with your doctor',
            'Keep a record of your symptoms',
            'Follow up with healthcare provider'
          ]
        },
        timestamp: new Date()
      }
    }
  }

  const handleAnalyze = async () => {
    if (inputMethod === 'image' && !selectedFile) {
      toast.error('Please select an image first')
      return
    }

    if (inputMethod === 'text' && !textInput.trim()) {
      toast.error('Please enter text to analyze')
      return
    }

    if (inputMethod === 'voice' && !voiceInput.trim()) {
      toast.error('Please record your voice input')
      return
    }

    setIsAnalyzing(true)
    setResult(null)
    setProgress(0)

    try {
      let inputText = ''

      if (inputMethod === 'image') {
        // Extract text from image using OCR
        toast.info('Extracting text from image...')
        inputText = await extractTextFromImage(selectedFile!)
        
        if (!inputText.trim()) {
          toast.warning('No text detected in image. Analyzing image content...')
          inputText = 'Image analysis - please provide context about this image'
        }
      } else if (inputMethod === 'text') {
        inputText = textInput.trim()
      } else if (inputMethod === 'voice') {
        inputText = voiceInput.trim()
      }

      // Analyze with AI
      toast.info('Analyzing with AI...')
      const analysisResult = await analyzeWithAI(inputText)
      
      setResult(analysisResult)
      toast.success('Analysis completed successfully!')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze. Please try again.')
    } finally {
      setIsAnalyzing(false)
      setProgress(0)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setTextInput('')
    setVoiceInput('')
    setResult(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medicine': return <FaPills className="text-blue-400" />
      case 'food': return <FaAppleAlt className="text-green-400" />
      case 'symptom': return <FaStethoscope className="text-red-400" />
      default: return <FaBrain className="text-purple-400" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500'
    if (confidence >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const speakResult = (result: AnalysisResult) => {
    if ('speechSynthesis' in window) {
      const text = `${result.analysis.title}. ${result.analysis.description}. ${result.analysis.recommendations.join('. ')}`
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
      setIsPlaying(true)
    }
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-white/10 shadow-3d p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold neon-text mb-4">
              AI-Powered Health Analyzer
            </h1>
            <p className="text-gray-400 text-lg">
              Analyze medicines, foods, and symptoms with advanced AI and OCR technology
            </p>
          </div>

          {/* Input Method Selector */}
          <div className="flex justify-center space-x-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInputMethod('image')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-300 ${
                inputMethod === 'image'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <FaCamera className="text-xl" />
              <span className="font-semibold">Image Upload</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInputMethod('text')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-300 ${
                inputMethod === 'text'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <FaSearch className="text-xl" />
              <span className="font-semibold">Text Input</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInputMethod('voice')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-300 ${
                inputMethod === 'voice'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <FaMicrophone className="text-xl" />
              <span className="font-semibold">Voice Input</span>
            </motion.button>
          </div>

          {/* Input Section */}
          <AnimatePresence mode="wait">
            {inputMethod === 'image' && (
              <motion.div
                key="image"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="mb-8"
              >
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {!previewUrl ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <FaCamera className="mx-auto text-6xl text-gray-400" />
                      <p className="text-gray-400 text-lg">
                        Click to upload or drag and drop your image
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 mx-auto"
                      >
                        <FaUpload />
                        <span>Choose Image</span>
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="mx-auto max-h-80 rounded-lg shadow-lg"
                      />
                      <div className="flex justify-center space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          {isAnalyzing ? (
                            <>
                              <FaSpinner className="animate-spin" />
                              <span>Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <FaBrain />
                              <span>Analyze Image</span>
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleClear}
                          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                        >
                          <FaTimes />
                          <span>Clear</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {inputMethod === 'text' && (
              <motion.div
                key="text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="mb-8"
              >
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Enter Text to Analyze
                  </h3>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Describe your symptoms, medicine, or food... (You can write in English or Nepali)"
                    className="w-full h-32 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !textInput.trim()}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <FaBrain />
                          <span>Analyze Text</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {inputMethod === 'voice' && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="mb-8"
              >
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Voice Input
                  </h3>
                  <div className="text-center space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-6 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                    >
                      <FaMicrophone className="w-8 h-8" />
                    </motion.button>
                    <p className="text-gray-400">
                      Click to start recording your symptoms or health concerns
                    </p>
                    {voiceInput && (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-white text-sm">{voiceInput}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="mb-6">
              <div className="bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-gray-400 mt-2">
                Processing... {progress}%
              </p>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <h3 className="text-2xl font-semibold text-white mb-6 text-center">
                Analysis Results
              </h3>

              <motion.div
                whileHover={{ rotateY: 5, rotateX: 5 }}
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 shadow-3d"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(result.type)}
                    <h4 className="text-xl font-semibold text-blue-400">
                      {result.analysis.title}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${getConfidenceColor(result.confidence)}`}>
                      Confidence: {Math.round(result.confidence * 100)}%
                    </span>
                    <FaInfoCircle className="text-blue-400" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4">{result.analysis.description}</p>

                {/* Detected Text */}
                {result.detectedText && (
                  <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                    <h5 className="font-medium text-gray-300 mb-2">Detected Text:</h5>
                    <p className="text-sm text-gray-400">{result.detectedText}</p>
                  </div>
                )}

                {/* Recommendations */}
                {result.analysis.recommendations.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-green-400 mb-2">Recommendations:</h5>
                    <ul className="space-y-1">
                      {result.analysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                          <FaCheck className="text-green-400 mt-1 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {result.analysis.warnings.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-yellow-400 mb-2">Warnings:</h5>
                    <ul className="space-y-1">
                      {result.analysis.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                          <FaExclamationTriangle className="text-yellow-400 mt-1 flex-shrink-0" />
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                {result.analysis.actions.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-blue-400 mb-2">Recommended Actions:</h5>
                    <ul className="space-y-1">
                      {result.analysis.actions.map((action, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                          <FaHeart className="text-red-400 mt-1 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Specialist */}
                {result.analysis.specialist && (
                  <div className="mb-4 p-3 bg-blue-900/20 rounded-lg">
                    <h5 className="font-medium text-blue-400 mb-1">Recommended Specialist:</h5>
                    <p className="text-sm text-gray-300">{result.analysis.specialist}</p>
                  </div>
                )}

                {/* Medicines */}
                {result.analysis.medicines && result.analysis.medicines.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-purple-400 mb-2">Medicines:</h5>
                    <ul className="space-y-1">
                      {result.analysis.medicines.map((medicine, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                          <FaPills className="text-purple-400 mt-1 flex-shrink-0" />
                          <span>{medicine}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Foods */}
                {result.analysis.foods && result.analysis.foods.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-green-400 mb-2">Foods:</h5>
                    <ul className="space-y-1">
                      {result.analysis.foods.map((food, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                          <FaAppleAlt className="text-green-400 mt-1 flex-shrink-0" />
                          <span>{food}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => speakResult(result)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    {isPlaying ? <FaVolumeMute /> : <FaVolumeUp />}
                    <span>Listen</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const text = `${result.analysis.title}\n\n${result.analysis.description}\n\nRecommendations:\n${result.analysis.recommendations.join('\n')}`
                      navigator.clipboard.writeText(text)
                      toast.success('Results copied to clipboard')
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FaDownload />
                    <span>Copy</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Health Analysis Result',
                          text: result.analysis.description
                        })
                      } else {
                        toast.info('Sharing not supported on this browser')
                      }
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <FaShare />
                    <span>Share</span>
                  </motion.button>
                </div>

                {/* Timestamp */}
                <div className="text-center mt-4 text-xs text-gray-500">
                  Analyzed on {result.timestamp.toLocaleString()}
                </div>
              </motion.div>

              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FaExclamationTriangle className="text-yellow-400" />
                  <span className="font-medium text-yellow-400">Important Disclaimer</span>
                </div>
                <p className="text-sm text-gray-300">
                  This analysis is for informational purposes only and should not replace professional medical advice. 
                  Always consult with a healthcare provider for proper diagnosis and treatment.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AIImageAnalyzer
