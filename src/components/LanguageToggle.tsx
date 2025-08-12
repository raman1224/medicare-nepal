"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaGlobe, FaChevronDown } from 'react-icons/fa'
import translations from '../data/translations.json'

interface LanguageToggleProps {
  currentLanguage: string
  onLanguageChange: (language: string) => void
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  currentLanguage, 
  onLanguageChange 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
  ]

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaGlobe className="text-lg" />
        <span className="text-lg">{currentLang.flag}</span>
        <span className="font-medium">{currentLang.name}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown className="text-sm" />
        </motion.div>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
        transition={{ duration: 0.3 }}
        className={`absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {languages.map((language) => (
          <motion.button
            key={language.code}
            onClick={() => {
              onLanguageChange(language.code)
              setIsOpen(false)
            }}
            className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-200 ${
              currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-xl">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>

    
  )
}

export default LanguageToggle

