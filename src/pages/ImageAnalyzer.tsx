"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { Camera, Upload, X, Pill, AlertTriangle, CheckCircle, Clock, Leaf } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

interface MedicineAnalysis {
  name: string
  genericName: string
  manufacturer: string
  purpose: string
  mainIngredients: string[]
  dosage: {
    adults: string
    children: string
  }
  sideEffects: string[]
  contraindications: string[]
  price: {
    min: number
    max: number
    currency: string
  }
  alternatives: {
    medicines: Array<{
      name: string
      price: number
    }>
    naturalFoods: string[]
  }
  whenToAvoid: string[]
  dailyRoutine: string[]
}

const ImageAnalyzer: React.FC = () => {
  useTranslation()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<MedicineAnalysis | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: false,
  })

  const handleAnalyze = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first")
      return
    }

    setIsAnalyzing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 4000))

    // Mock analysis result
    const mockAnalysis: MedicineAnalysis = {
      name: "Paracetamol 500mg",
      genericName: "Acetaminophen",
      manufacturer: "Nepal Pharmaceuticals Ltd.",
      purpose: "Pain relief and fever reduction",
      mainIngredients: ["Paracetamol 500mg", "Microcrystalline Cellulose", "Starch", "Magnesium Stearate"],
      dosage: {
        adults: "1-2 tablets every 4-6 hours (max 8 tablets/day)",
        children: "Consult doctor for appropriate dosage",
      },
      sideEffects: [
        "Nausea (rare)",
        "Skin rash (allergic reaction)",
        "Liver damage (with overdose)",
        "Stomach upset (uncommon)",
      ],
      contraindications: ["Severe liver disease", "Alcohol dependency", "Allergy to paracetamol", "G6PD deficiency"],
      price: {
        min: 15,
        max: 25,
        currency: "NPR",
      },
      alternatives: {
        medicines: [
          { name: "Ibuprofen 400mg", price: 20 },
          { name: "Aspirin 325mg", price: 12 },
          { name: "Diclofenac 50mg", price: 18 },
        ],
        naturalFoods: [
          "Ginger tea for pain relief",
          "Turmeric milk for inflammation",
          "Honey and lemon for throat pain",
          "Cold compress for headaches",
        ],
      },
      whenToAvoid: [
        "During alcohol consumption",
        "With other paracetamol-containing medicines",
        "If you have liver problems",
        "During pregnancy (consult doctor first)",
      ],
      dailyRoutine: [
        "Take with or after meals to reduce stomach irritation",
        "Drink plenty of water",
        "Avoid alcohol completely",
        "Monitor for any unusual symptoms",
        "Do not exceed recommended dosage",
        "Store in cool, dry place",
      ],
    }

    setAnalysis(mockAnalysis)
    setIsAnalyzing(false)
    toast.success("Medicine analysis completed!")
  }

  const removeImage = () => {
    setUploadedImage(null)
    setAnalysis(null)
  }

  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Camera className="w-8 h-8 text-green-400 animate-pulse" />
            <h1 className="text-3xl font-bold neon-text">Medicine Scanner</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Upload or drag & drop a photo of your medicine to get detailed analysis including ingredients, side effects,
            alternatives, and pricing information.
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-xl mb-8"
        >
          {!uploadedImage ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? "border-blue-400 bg-blue-400/10"
                  : "border-gray-600 hover:border-gray-500 hover:bg-white/5"
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-400/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-green-400" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {isDragActive ? "Drop your image here" : "Upload Medicine Image"}
                  </h3>
                  <p className="text-gray-400 mb-4">Drag & drop or click to select an image of your medicine</p>
                  <p className="text-sm text-gray-500">Supports: JPG, PNG, WEBP (Max 10MB)</p>
                </div>

                <button className="glow-button px-6 py-3">Choose Image</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Uploaded medicine"
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="glow-button px-8 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="loading-dots">Analyzing medicine</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      <span>Analyze Medicine</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-400">Why upload medicine images?</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Get accurate medicine identification</li>
              <li>• Learn about ingredients and side effects</li>
              <li>• Find natural alternatives and replacements</li>
              <li>• Get current pricing information</li>
              <li>• Receive personalized usage recommendations</li>
            </ul>
          </div>
        </motion.div>

        {/* Analysis Results */}
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Medicine Overview */}
            <div className="glass p-6 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{analysis.name}</h3>
                  <p className="text-gray-400">Generic: {analysis.genericName}</p>
                  <p className="text-sm text-gray-500">by {analysis.manufacturer}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    {analysis.price.currency} {analysis.price.min}-{analysis.price.max}
                  </div>
                  <p className="text-sm text-gray-400">Price Range</p>
                </div>
              </div>

              <div className="p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-400">Purpose</h4>
                <p className="text-gray-300">{analysis.purpose}</p>
              </div>
            </div>

            {/* Ingredients */}
            <div className="glass p-6 rounded-xl">
              <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Pill className="w-5 h-5 text-purple-400" />
                <span>Main Ingredients</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.mainIngredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 glass rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dosage */}
            <div className="glass p-6 rounded-xl">
              <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>Recommended Dosage</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-400/10 border border-green-400/20 rounded-lg">
                  <h5 className="font-semibold text-green-400 mb-2">Adults</h5>
                  <p className="text-gray-300">{analysis.dosage.adults}</p>
                </div>
                <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                  <h5 className="font-semibold text-yellow-400 mb-2">Children</h5>
                  <p className="text-gray-300">{analysis.dosage.children}</p>
                </div>
              </div>
            </div>

            {/* Side Effects & Contraindications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-xl">
                <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-yellow-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Side Effects</span>
                </h4>

                <ul className="space-y-2">
                  {analysis.sideEffects.map((effect, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{effect}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass p-6 rounded-xl">
                <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-red-400">
                  <X className="w-5 h-5" />
                  <span>When to Avoid</span>
                </h4>

                <ul className="space-y-2">
                  {analysis.whenToAvoid.map((condition, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Alternatives */}
            <div className="glass p-6 rounded-xl">
              <h4 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-green-400" />
                <span>Alternatives & Natural Replacements</span>
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Medicine Alternatives */}
                <div>
                  <h5 className="font-semibold mb-3 text-blue-400">Medicine Alternatives</h5>
                  <div className="space-y-2">
                    {analysis.alternatives.medicines.map((medicine, index) => (
                      <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                        <span className="text-gray-300">{medicine.name}</span>
                        <span className="text-green-400 font-semibold">NPR {medicine.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Natural Alternatives */}
                <div>
                  <h5 className="font-semibold mb-3 text-green-400">Natural Foods</h5>
                  <div className="space-y-2">
                    {analysis.alternatives.naturalFoods.map((food, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 glass rounded-lg">
                        <Leaf className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{food}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Routine */}
            <div className="glass p-6 rounded-xl">
              <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Daily Routine & Tips</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.dailyRoutine.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 glass rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{tip}</span>
                    <span className="text-gray-300">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ImageAnalyzer
