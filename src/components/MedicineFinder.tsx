import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  FaCamera, 
  FaFileUpload, 
  FaMicrophone, 
  FaSearch, 
  FaPills, 
  FaAppleAlt,
  FaHeart,
  FaBrain,
  FaDownload,
  FaTimes,
  FaPlay,
  FaStop
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import PDFExporter from './PDFExporter'
import LanguageToggle from './LanguageToggle'

interface AnalysisResult {
  type: 'medicine' | 'food' | 'general'
  name: string
  description: string
  usage: string
  dosage: string
  sideEffects: string[]
  precautions: string[]
  healthBenefits?: string[]
  recommendations?: string[]
  confidence: number
  timestamp: string
}

const MedicineFinder: React.FC = () => {
  const [analysisType, setAnalysisType] = useState<'medicine' | 'food' | 'general'>('medicine')
  const [inputMethod, setInputMethod] = useState<'text' | 'image' | 'voice'>('text')
  const [textInput, setTextInput] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [language, setLanguage] = useState('en')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { currentUser } = useAuth()
  const { socket } = useSocket()

  // Speech Recognition setup
  const recognition = useRef<any>(null)
  if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
    recognition.current = new (window as any).webkitSpeechRecognition()
    recognition.current.continuous = true
    recognition.current.interimResults = true
    recognition.current.lang = language === 'ne' ? 'ne-NP' : language === 'hi' ? 'hi-IN' : 'en-US'
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB')
        return
      }
      
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVoiceRecording = () => {
    if (!recognition.current) {
      toast.error('Speech recognition not supported in this browser')
      return
    }

    if (!isRecording) {
      setIsRecording(true)
      setTranscript('')
      recognition.current.start()
      
      recognition.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        setTranscript(finalTranscript)
      }
      
      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        toast.error('Speech recognition failed')
      }
    } else {
      setIsRecording(false)
      recognition.current.stop()
      setTextInput(transcript)
    }
  }

  const analyzeContent = async () => {
    if (!textInput.trim() && !selectedImage) {
      toast.error('Please provide text input or upload an image')
      return
    }

    setIsAnalyzing(true)
    
    try {
      let endpoint = ''
      let formData = new FormData()
      
      if (selectedImage) {
        // Image analysis
        endpoint = analysisType === 'medicine' 
          ? '/api/medicare/analyze-image' 
          : '/api/medicare/analyze-food'
        
        formData.append('image', selectedImage)
        formData.append('analysisType', analysisType)
        formData.append('language', language)
      } else {
        // Text analysis
        endpoint = '/api/medicines/analyze-name'
        formData.append('medicineName', textInput)
        formData.append('language', language)
      }

      // For development, allow without authentication
      // if (!currentUser) {
      //   toast.error('Please login to use this feature')
      //   return
      // }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        // headers: {
        //   'Authorization': `Bearer ${await currentUser.getIdToken()}`
        // }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        const analysisData: AnalysisResult = {
          type: analysisType,
          name: result.data.medicineName || result.data.name || 'Unknown',
          description: result.data.description || result.data.usage || '',
          usage: result.data.usage || '',
          dosage: result.data.dosage || '',
          sideEffects: result.data.sideEffects || [],
          precautions: result.data.precautions || [],
          healthBenefits: result.data.healthBenefits || [],
          recommendations: result.data.recommendations || [],
          confidence: result.data.confidence || 0.8,
          timestamp: new Date().toISOString()
        }
        
        setAnalysisResult(analysisData)
        toast.success('Analysis completed successfully!')
        
        // Emit socket event for real-time updates
        if (socket) {
          socket.emit('analysis_completed', {
            userId: currentUser?.uid || 'anonymous',
            type: analysisType,
            result: analysisData
          })
        }
      } else {
        throw new Error(result.message || 'Analysis failed')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Analysis failed. Please try again.')
      
      // Fallback response
      const fallbackResult: AnalysisResult = {
        type: analysisType,
        name: textInput || 'Uploaded Image',
        description: 'Analysis temporarily unavailable. Please consult a healthcare professional.',
        usage: 'Consult your doctor for proper usage instructions.',
        dosage: 'Dosage should be determined by a healthcare provider.',
        sideEffects: ['Consult your doctor for potential side effects'],
        precautions: ['Always consult a healthcare professional before taking any medication'],
        confidence: 0.5,
        timestamp: new Date().toISOString()
      }
      setAnalysisResult(fallbackResult)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearAll = () => {
    setTextInput('')
    setSelectedImage(null)
    setImagePreview('')
    setAnalysisResult(null)
    setTranscript('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getAnalysisIcon = () => {
    switch (analysisType) {
      case 'medicine':
        return <FaPills className="w-6 h-6 text-blue-500" />
      case 'food':
        return <FaAppleAlt className="w-6 h-6 text-green-500" />
      default:
        return <FaBrain className="w-6 h-6 text-purple-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Medicine Finder
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Analyze medicines, food, and health items with AI-powered insights
          </p>
          
          <div className="flex justify-center mb-6">
            <LanguageToggle onLanguageChange={setLanguage} />
          </div>
        </motion.div>

        {/* Analysis Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="flex space-x-4 p-2 bg-gray-800 rounded-lg">
            {[
              { key: 'medicine', label: 'Medicine', icon: FaPills },
              { key: 'food', label: 'Food', icon: FaAppleAlt },
              { key: 'general', label: 'General', icon: FaBrain }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setAnalysisType(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  analysisType === key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Input Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Text Input */}
          <div className="space-y-4">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setInputMethod('text')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  inputMethod === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <FaSearch className="w-5 h-5" />
                <span>Text Input</span>
              </button>
              <button
                onClick={() => setInputMethod('image')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  inputMethod === 'image'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <FaCamera className="w-5 h-5" />
                <span>Image Upload</span>
              </button>
              <button
                onClick={handleVoiceRecording}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isRecording
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {isRecording ? <FaStop className="w-5 h-5" /> : <FaMicrophone className="w-5 h-5" />}
                <span>{isRecording ? 'Stop' : 'Voice'}</span>
              </button>
            </div>

            {inputMethod === 'text' && (
              <div className="space-y-4">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={`Enter ${analysisType} name or description...`}
                  className="w-full h-32 p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                />
                {transcript && (
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Voice Transcript:</p>
                    <p className="text-white">{transcript}</p>
                  </div>
                )}
              </div>
            )}

            {inputMethod === 'image' && (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-all duration-300"
                >
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full h-64 object-contain mx-auto rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          clearAll()
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                      >
                        <FaTimes className="w-4 h-4" />
                        <span>Remove Image</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FaFileUpload className="w-16 h-16 text-gray-400 mx-auto" />
                      <p className="text-gray-400">Click to upload image or drag and drop</p>
                      <p className="text-sm text-gray-500">Supports JPG, PNG, GIF (max 10MB)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Analysis Button */}
          <div className="flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={analyzeContent}
              disabled={isAnalyzing || (!textInput.trim() && !selectedImage)}
              className={`flex items-center space-x-3 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 ${
                isAnalyzing || (!textInput.trim() && !selectedImage)
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  {getAnalysisIcon()}
                  <span>Analyze {analysisType}</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Results */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {getAnalysisIcon()}
                <h2 className="text-2xl font-bold text-white">{analysisResult.name}</h2>
              </div>
              <div className="flex space-x-2">
                <PDFExporter
                  data={analysisResult}
                  type="medicine-analysis"
                  language={language}
                />
                <button
                  onClick={clearAll}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  <FaTimes className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Description</h3>
                  <p className="text-gray-300">{analysisResult.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Usage</h3>
                  <p className="text-gray-300">{analysisResult.usage}</p>
                </div>
                
                {analysisResult.dosage && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">Dosage</h3>
                    <p className="text-gray-300">{analysisResult.dosage}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {analysisResult.sideEffects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Side Effects</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {analysisResult.sideEffects.map((effect, index) => (
                        <li key={index}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysisResult.precautions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-orange-400 mb-2">Precautions</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {analysisResult.precautions.map((precaution, index) => (
                        <li key={index}>{precaution}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysisResult.healthBenefits && analysisResult.healthBenefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Health Benefits</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {analysisResult.healthBenefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FaHeart className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold">Important Note</span>
              </div>
              <p className="text-gray-300 text-sm">
                This analysis is for informational purposes only. Always consult a healthcare professional 
                before taking any medication or making health-related decisions.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default MedicineFinder
