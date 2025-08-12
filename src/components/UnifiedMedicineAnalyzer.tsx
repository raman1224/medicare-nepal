import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { 
  FaCamera, 
  FaPills, 
  FaAppleAlt, 
  FaSpinner, 
  FaInfoCircle, 
  FaUpload,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaSearch,
  FaUtensils,
  FaLeaf,
  FaHeart,
  FaBrain,
  // FaEye,
  // FaBone,
  // FaDroplet,
  // FaShield,
  // FaClock,
  // FaThermometer,
  // FaStethoscope
} from 'react-icons/fa'

interface MedicineInfo {
  name: string
  genericName: string
  manufacturer: string
  purpose: string
  dosageForm: string
  sideEffects: string
  precautions: string
  storage: string
  whenToTake: string
  foodInteractions: string
  alternatives: string[]
  price: { min: number; max: number; currency: string }
  source: string
  detectedConfidence?: number
  detectionSource?: string
}

interface FoodInfo {
  name: string
  description: string
  healthBenefits: string
  nutrients: string[]
  category: string
  recommendedFor: string[]
  avoidIf: string[]
}

interface AnalysisResult {
  success: boolean
  message: string
  data: {
    medicines?: MedicineInfo[]
    primaryMedicine?: MedicineInfo
    foods?: FoodInfo[]
    detectedText: string
    confidence: number
    totalMedicines?: number
  }
}

const UnifiedMedicineAnalyzer: React.FC = () => {
  useAuth()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisType, setAnalysisType] = useState<'medicine' | 'food'>('medicine')
  const [inputMethod, setInputMethod] = useState<'text' | 'image'>('text')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setUploadProgress(0)
    }
  }

  const handleAnalyze = async () => {
    // For development, allow without authentication
    // if (!currentUser) {
    //   toast.error('Please login to use this feature')
    //   return
    // }

    if (inputMethod === 'image' && !selectedFile) {
      toast.error('Please select an image first')
      return
    }

    if (inputMethod === 'text' && !textInput.trim()) {
      toast.error('Please enter medicine or food name')
      return
    }

    setIsAnalyzing(true)
    setResult(null)
    setUploadProgress(0)

    try {
      let endpoint = ''
      let requestBody: any = {}

      if (inputMethod === 'image') {
        const formData = new FormData()
        formData.append('image', selectedFile!)
        endpoint = analysisType === 'medicine' 
          ? '/api/medicare/analyze-image' 
          : '/api/medicare/analyze-food'
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return prev
            }
            return prev + 10
          })
        }, 200)

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: {
            // 'Authorization': `Bearer ${await currentUser.getIdToken()}`
          }
        })

        clearInterval(progressInterval)
        setUploadProgress(100)
        const data = await response.json()

        if (data.success) {
          setResult(data)
          toast.success(data.message)
        } else {
          toast.error(data.message || 'Analysis failed')
        }
      } else {
        // Text-based analysis
        endpoint = '/api/medicare/analyze-name'
        requestBody = {
          medicineName: textInput.trim(),
          language: 'en'
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${await currentUser.getIdToken()}`
          },
          body: JSON.stringify(requestBody)
        })

        const data = await response.json()

        if (data.success) {
          // Transform the response to match our expected format
          const transformedData = {
            success: true,
            message: data.message,
            data: {
              medicines: [{
                name: data.data.medicineName,
                genericName: data.data.medicineName,
                manufacturer: 'Various manufacturers',
                purpose: data.data.usage,
                dosageForm: data.data.dosage,
                sideEffects: Array.isArray(data.data.sideEffects) ? data.data.sideEffects.join(', ') : data.data.sideEffects,
                precautions: Array.isArray(data.data.precautions) ? data.data.precautions.join(', ') : data.data.precautions,
                storage: 'Store in a cool, dry place',
                whenToTake: 'As prescribed by your doctor',
                foodInteractions: 'Consult your doctor about food interactions',
                alternatives: [],
                price: { min: 5, max: 50, currency: 'USD' },
                source: 'Text Analysis',
                detectedConfidence: 0.9,
                detectionSource: 'text_input'
              }],
              primaryMedicine: {
                name: data.data.medicineName,
                genericName: data.data.medicineName,
                manufacturer: 'Various manufacturers',
                purpose: data.data.usage,
                dosageForm: data.data.dosage,
                sideEffects: Array.isArray(data.data.sideEffects) ? data.data.sideEffects.join(', ') : data.data.sideEffects,
                precautions: Array.isArray(data.data.precautions) ? data.data.precautions.join(', ') : data.data.precautions,
                storage: 'Store in a cool, dry place',
                whenToTake: 'As prescribed by your doctor',
                foodInteractions: 'Consult your doctor about food interactions',
                alternatives: [],
                price: { min: 5, max: 50, currency: 'USD' },
                source: 'Text Analysis',
                detectedConfidence: 0.9,
                detectionSource: 'text_input'
              },
              detectedText: textInput.trim(),
              confidence: 0.9,
              totalMedicines: 1
            }
          }
          setResult(transformedData)
          toast.success(data.message)
        } else {
          toast.error(data.message || 'Analysis failed')
        }
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze. Please try again.')
    } finally {
      setIsAnalyzing(false)
      setUploadProgress(0)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setTextInput('')
    setResult(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatPrice = (price: { min: number; max: number; currency: string }) => {
    return `${price.currency} ${price.min} - ${price.max}`
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500'
    if (confidence >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getFoodIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fruits': return <FaAppleAlt className="text-green-400" />
      case 'vegetables': return <FaLeaf className="text-green-500" />
      case 'proteins': return <FaHeart className="text-red-400" />
      case 'grains': return <FaUtensils className="text-yellow-400" />
      case 'dairy': return <FaHeart className="text-blue-400" />
      case 'nuts': return <FaBrain className="text-orange-400" />
      default: return <FaUtensils className="text-gray-400" />
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
              AI-Powered Medicine & Food Analyzer
            </h1>
            <p className="text-gray-400 text-lg">
              Analyze medicines and foods for detailed health insights
            </p>
          </div>

          {/* Analysis Type Selector */}
          <div className="flex justify-center space-x-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAnalysisType('medicine')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-300 ${
                analysisType === 'medicine'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <FaPills className="text-xl" />
              <span className="font-semibold">Medicine Analysis</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAnalysisType('food')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-300 ${
                analysisType === 'food'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <FaAppleAlt className="text-xl" />
              <span className="font-semibold">Food Analysis</span>
            </motion.button>
          </div>

          {/* Input Method Selector */}
          <div className="flex justify-center space-x-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInputMethod('text')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-300 ${
                inputMethod === 'text'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <FaSearch className="text-xl" />
              <span className="font-semibold">Text Input</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInputMethod('image')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-300 ${
                inputMethod === 'image'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <FaCamera className="text-xl" />
              <span className="font-semibold">Image Upload</span>
            </motion.button>
          </div>

          {/* Input Section */}
          {inputMethod === 'text' ? (
            <div className="mb-8">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Enter {analysisType === 'medicine' ? 'Medicine' : 'Food'} Name
                </h3>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={`Enter ${analysisType === 'medicine' ? 'medicine' : 'food'} name...`}
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !textInput.trim()}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <FaSearch />
                        <span>Analyze</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8">
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
                            <FaCheck />
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

              {/* Upload Progress */}
              {isAnalyzing && (
                <div className="mt-4">
                  <div className="bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-gray-400 mt-2">
                    Processing {inputMethod === 'image' ? 'image' : 'text'}... {uploadProgress}%
                  </p>
                </div>
              )}
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

              {/* Medicine Analysis Results */}
              {analysisType === 'medicine' && result.data.medicines && (
                <div className="space-y-6">
                  {result.data.medicines.map((medicine, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-semibold text-blue-400">
                          {medicine.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${getConfidenceColor(medicine.detectedConfidence || 0)}`}>
                            Confidence: {Math.round((medicine.detectedConfidence || 0) * 100)}%
                          </span>
                          <FaInfoCircle className="text-blue-400" />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-gray-300">Generic Name:</span>
                            <p className="text-gray-400">{medicine.genericName}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Manufacturer:</span>
                            <p className="text-gray-400">{medicine.manufacturer}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Purpose:</span>
                            <p className="text-gray-400">{medicine.purpose}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Dosage Form:</span>
                            <p className="text-gray-400">{medicine.dosageForm}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">When to Take:</span>
                            <p className="text-gray-400">{medicine.whenToTake}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-gray-300">Side Effects:</span>
                            <p className="text-gray-400">{medicine.sideEffects}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Precautions:</span>
                            <p className="text-gray-400">{medicine.precautions}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Food Interactions:</span>
                            <p className="text-gray-400">{medicine.foodInteractions}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Storage:</span>
                            <p className="text-gray-400">{medicine.storage}</p>
                          </div>
                          {medicine.price && (
                            <div>
                              <span className="font-medium text-gray-300">Price Range:</span>
                              <p className="text-gray-400">{formatPrice(medicine.price)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {medicine.alternatives && medicine.alternatives.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-900/20 rounded-lg">
                          <span className="font-medium text-blue-400">Alternatives:</span>
                          <p className="text-gray-300">{medicine.alternatives.join(', ')}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            Source: {medicine.source}
                          </span>
                          <span className="text-sm text-gray-400">
                            Detection: {medicine.detectionSource}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Food Analysis Results */}
              {analysisType === 'food' && result.data.foods && (
                <div className="space-y-4">
                  {result.data.foods.map((food, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-green-900/20 border border-green-500/30 rounded-lg p-6"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        {getFoodIcon(food.category)}
                        <h4 className="text-xl font-semibold text-green-400">
                          {food.name}
                        </h4>
                      </div>
                      <p className="text-gray-300 mb-3">{food.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-green-800/20 rounded-lg p-4">
                          <span className="font-medium text-green-400">Health Benefits:</span>
                          <p className="text-gray-300 mt-1">{food.healthBenefits}</p>
                        </div>
                        
                        {food.nutrients && food.nutrients.length > 0 && (
                          <div className="bg-green-800/20 rounded-lg p-4">
                            <span className="font-medium text-green-400">Key Nutrients:</span>
                            <p className="text-gray-300 mt-1">{food.nutrients.join(', ')}</p>
                          </div>
                        )}
                      </div>
                      
                      {food.recommendedFor && food.recommendedFor.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-900/20 rounded-lg">
                          <span className="font-medium text-blue-400">Recommended For:</span>
                          <p className="text-gray-300 mt-1">{food.recommendedFor.join(', ')}</p>
                        </div>
                      )}
                      
                      {food.avoidIf && food.avoidIf.length > 0 && (
                        <div className="mt-3 p-3 bg-red-900/20 rounded-lg">
                          <span className="font-medium text-red-400">Avoid If:</span>
                          <p className="text-gray-300 mt-1">{food.avoidIf.join(', ')}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Detected Text */}
              {result.data.detectedText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 bg-gray-800/50 rounded-lg p-4"
                >
                  <h5 className="font-medium text-gray-300 mb-2">Detected Text:</h5>
                  <p className="text-sm text-gray-400 bg-gray-900 p-3 rounded border">
                    {result.data.detectedText}
                  </p>
                </motion.div>
              )}

              {/* Confidence Score */}
              <div className="mt-4 text-center">
                <span className={`text-sm ${getConfidenceColor(result.data.confidence)}`}>
                  Overall Confidence: {Math.round(result.data.confidence * 100)}%
                </span>
              </div>

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

export default UnifiedMedicineAnalyzer 