"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, ChevronDown } from "lucide-react"
import { useTranslation } from "react-i18next"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ne", name: "नेपाली", flag: "🇳🇵" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
]

const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { i18n } = useTranslation()

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg glass hover:bg-white/10 transition-all duration-300"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:block">{currentLanguage.flag}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-lg border border-white/10 overflow-hidden"
          >
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 transition-all duration-300 ${
                  currentLanguage.code === language.code ? "bg-blue-400/20 text-blue-400" : "text-gray-300"
                }`}
              >
                <span className="text-xl">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
                {currentLanguage.code === language.code && (
                  <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LanguageSelector
