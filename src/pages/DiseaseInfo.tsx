import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ArrowLeft, X } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import DiseaseCard from '../components/DiseaseCard'
import PDFExporter from '../components/PDFExporter'
import LanguageToggle from '../components/LanguageToggle'
import diseaseContent from '../data/diseaseContent.json'

interface Disease {
  id: string
  category?: string
  name: {
    en: string
    ne: string
    hi: string
  }
  symptoms: {
    en: string[]
    ne: string[]
    hi: string[]
  }
  prevention: {
    en: string[]
    ne: string[]
    hi: string[]
  }
  treatment: {
    en: string[]
    ne: string[]
    hi: string[]
  }
  food: {
    recommended: {
      en: string[]
      ne: string[]
      hi: string[]
    }
    avoid: {
      en: string[]
      ne: string[]
      hi: string[]
    }
  }
}

const DiseaseInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [language, setLanguage] = useState('en')

  // Flatten all diseases from all categories
  const allDiseases: Disease[] = Object.entries(diseaseContent.categories).flatMap(([categoryKey, category]) => {
    return Object.entries(category.diseases).map(([diseaseKey, disease]) => ({
      id: diseaseKey,
      category: categoryKey,
      ...disease
    }))
  })

  // Find specific disease if ID is provided in URL
  useEffect(() => {
    if (id) {
      const disease = allDiseases.find(d => d.id === id)
      if (disease) {
        setSelectedDisease(disease)
      }
    }
  }, [id, allDiseases])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedDisease) {
        setSelectedDisease(null)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [selectedDisease])

  const filteredDiseases = allDiseases.filter(disease => {
    const matchesSearch = disease.name[language as keyof typeof disease.name]
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || disease.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = [
    { key: 'all', name: { en: 'All Categories', ne: 'सबै श्रेणीहरू', hi: 'सभी श्रेणियां' } },
    ...Object.entries(diseaseContent.categories).map(([key, category]) => ({
      key,
      name: category.name
    }))
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex justify-center">
              <LanguageToggle currentLanguage={language} onLanguageChange={setLanguage} />
            </div>
            
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Disease Information Center
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Comprehensive guide to diseases, symptoms, prevention, and treatment
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-xl mb-8 shadow-3d"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search diseases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                {categories.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.name[language as keyof typeof category.name]}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center">
              <span className="text-gray-300">
                {filteredDiseases.length} {language === 'en' ? 'diseases' : language === 'ne' ? 'रोगहरू' : 'रोग'} found
              </span>
            </div>
          </div>
        </motion.div>

        {/* Disease Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredDiseases.map((disease) => (
            <DiseaseCard
              key={disease.id}
              disease={disease}
              language={language}
              onSelect={() => setSelectedDisease(disease)}
            />
          ))}
        </motion.div>

        {/* Selected Disease Details */}
        {selectedDisease && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedDisease(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass bg-gray-800/90 backdrop-blur-md rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">
                  {selectedDisease.name[language as keyof typeof selectedDisease.name]}
                </h2>
                <div className="flex items-center space-x-3">
                  <PDFExporter
                    data={selectedDisease}
                    type="disease"
                    language={language}
                  />
                  <button
                    onClick={() => setSelectedDisease(null)}
                    className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/50 group"
                    title="Close"
                  >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Symptoms */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-red-400">
                    {language === 'en' ? 'Symptoms' : language === 'ne' ? 'लक्षणहरू' : 'लक्षण'}
                  </h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    {selectedDisease.symptoms[language as keyof typeof selectedDisease.symptoms].map((symptom, index) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>

                {/* Prevention */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-green-400">
                    {language === 'en' ? 'Prevention' : language === 'ne' ? 'रोकथाम' : 'रोकथाम'}
                  </h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    {selectedDisease.prevention[language as keyof typeof selectedDisease.prevention].map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Treatment */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-blue-400">
                    {language === 'en' ? 'Treatment' : language === 'ne' ? 'उपचार' : 'उपचार'}
                  </h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    {selectedDisease.treatment[language as keyof typeof selectedDisease.treatment].map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Food Recommendations */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-yellow-400">
                    {language === 'en' ? 'Food Recommendations' : language === 'ne' ? 'खाना सिफारिसहरू' : 'खाना सिफारिशें'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-green-400 mb-2">
                        {language === 'en' ? 'Recommended' : language === 'ne' ? 'सिफारिस गरिएको' : 'सिफारिश किए गए'}
                      </h4>
                      <ul className="list-disc list-inside text-gray-300 space-y-1">
                        {selectedDisease.food.recommended[language as keyof typeof selectedDisease.food.recommended].map((food, index) => (
                          <li key={index}>{food}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-red-400 mb-2">
                        {language === 'en' ? 'Avoid' : language === 'ne' ? 'बेवास्ता गर्नुहोस्' : 'बचें'}
                      </h4>
                      <ul className="list-disc list-inside text-gray-300 space-y-1">
                        {selectedDisease.food.avoid[language as keyof typeof selectedDisease.food.avoid].map((food, index) => (
                          <li key={index}>{food}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default DiseaseInfo

