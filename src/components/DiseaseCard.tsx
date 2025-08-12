import React from 'react'
import { motion } from 'framer-motion'
import { Info, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PDFExporter from './PDFExporter'

interface Disease {
  id: string
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

interface DiseaseCardProps {
  disease: Disease
  language: string
  onSelect: () => void
}

const DiseaseCard: React.FC<DiseaseCardProps> = ({ disease, language, onSelect }) => {
  const navigate = useNavigate()
  
  const getDiseaseName = () => {
    return disease.name[language as keyof typeof disease.name] || disease.name.en
  }

  const getSymptomPreview = () => {
    const symptoms = disease.symptoms[language as keyof typeof disease.symptoms] || disease.symptoms.en
    return symptoms.slice(0, 2).join(', ') + (symptoms.length > 2 ? '...' : '')
  }

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05, 
        y: -8,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass p-6 rounded-xl shadow-3d cursor-pointer group hover:shadow-2xl hover:shadow-blue-500/20 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
            {getDiseaseName()}
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            {getSymptomPreview()}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <PDFExporter
            data={disease}
            type="disease"
            language={language}
          />
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/disease-info/${disease.id}`)
            }}
            whileHover={{ 
              scale: 1.1, 
              boxShadow: "0 8px 16px rgba(59, 130, 246, 0.4)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg"
            title="View Details"
          >
            <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            whileHover={{ 
              scale: 1.1, 
              boxShadow: "0 8px 16px rgba(34, 197, 94, 0.4)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg"
            title="Quick View"
          >
            <Info className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
          </motion.button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Symptoms Count */}
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-sm text-gray-300">
            {disease.symptoms[language as keyof typeof disease.symptoms]?.length || disease.symptoms.en.length} 
            {language === 'en' ? ' symptoms' : language === 'ne' ? ' लक्षणहरू' : ' लक्षण'}
          </span>
        </div>

        {/* Prevention Count */}
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-sm text-gray-300">
            {disease.prevention[language as keyof typeof disease.prevention]?.length || disease.prevention.en.length} 
            {language === 'en' ? ' prevention tips' : language === 'ne' ? ' रोकथाम सुझावहरू' : ' रोकथाम सुझाव'}
          </span>
        </div>

        {/* Treatment Count */}
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span className="text-sm text-gray-300">
            {disease.treatment[language as keyof typeof disease.treatment]?.length || disease.treatment.en.length} 
            {language === 'en' ? ' treatment options' : language === 'ne' ? ' उपचार विकल्पहरू' : ' उपचार विकल्प'}
          </span>
        </div>

        {/* Food Recommendations */}
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
          <span className="text-sm text-gray-300">
            {disease.food.recommended[language as keyof typeof disease.food.recommended]?.length || disease.food.recommended.en.length} 
            {language === 'en' ? ' food recommendations' : language === 'ne' ? ' खाना सिफारिसहरू' : ' खाना सिफारिशें'}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/disease-info/${disease.id}`)
          }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 12px 24px rgba(147, 51, 234, 0.3)",
            backgroundImage: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)",
            transition: { duration: 0.3 }
          }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-500 transform"
        >
          <span className="group-hover:text-white transition-colors duration-300">
            {language === 'en' ? 'View Full Details' : language === 'ne' ? 'पूर्ण विवरण हेर्नुहोस्' : 'पूर्ण विवरण देखें'}
          </span>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default DiseaseCard

