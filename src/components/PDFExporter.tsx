import React from 'react'
import { motion } from 'framer-motion'
import { FaFilePdf, FaDownload } from 'react-icons/fa'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import translations from '../data/translations.json'

interface PDFExporterProps {
  data: any
  type: 'disease' | 'analysis'
  language: string
  className?: string
}

const PDFExporter: React.FC<PDFExporterProps> = ({ 
  data, 
  type, 
  language, 
  className = '' 
}) => {
  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = translations
    for (const k of keys) {
      value = value?.[k]
    }
    return value?.[language] || value?.['en'] || key
  }

  // Helper function to safely add text to PDF with proper encoding
  const addTextToPDF = (doc: jsPDF, text: string, x: number, y: number, options?: any) => {
    try {
      // For Nepali and Hindi, we need to handle the text carefully
      if (language === 'ne' || language === 'hi') {
        // Convert any problematic characters or use fallback text
        const safeText = text.replace(/[^\u0000-\u007F]/g, (char) => {
          // Keep the original character but ensure it's handled properly
          return char
        })
        doc.text(safeText, x, y, options)
      } else {
        doc.text(text, x, y, options)
      }
    } catch (error) {
      console.warn('Text rendering error:', error)
      // Fallback to English if there's an encoding issue
      const fallbackText = language !== 'en' ? 
        (data.name?.['en'] || text.replace(/[^\u0000-\u007F]/g, '?')) : 
        text
      doc.text(fallbackText, x, y, options)
    }
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20

    // Set font encoding for Unicode support
    try {
      // Try to use a Unicode-compatible font if available
      if (language === 'ne' || language === 'hi') {
        // For Nepali and Hindi, we'll use a basic approach
        // Since jsPDF doesn't have built-in Unicode support, we'll ensure the text is properly handled
        doc.setFont('helvetica', 'normal')
      } else {
        doc.setFont('helvetica', 'normal')
      }
    } catch (error) {
      console.warn('Font loading error:', error)
      doc.setFont('helvetica', 'normal')
    }

    // Add header
    doc.setFontSize(20)
    doc.setTextColor(59, 130, 246) // Blue color
    addTextToPDF(doc, 'Medicare Nepal', pageWidth / 2, 30, { align: 'center' })
    
    doc.setFontSize(14)
    doc.setTextColor(107, 114, 128) // Gray color
    addTextToPDF(doc, t('pdf.title'), pageWidth / 2, 45, { align: 'center' })

    // Add timestamp
    doc.setFontSize(10)
    doc.setTextColor(156, 163, 175)
    const timestamp = new Date().toLocaleString()
    addTextToPDF(doc, `${t('pdf.generatedOn')}: ${timestamp}`, pageWidth / 2, 55, { align: 'center' })

    let yPosition = 80

    if (type === 'disease') {
      // Disease information
      doc.setFontSize(16)
      doc.setTextColor(17, 24, 39) // Dark gray
      addTextToPDF(doc, data.name[language] || data.name['en'], margin, yPosition)
      yPosition += 20

      // Symptoms
      if (data.symptoms) {
        doc.setFontSize(14)
        doc.setTextColor(59, 130, 246)
        addTextToPDF(doc, t('diseaseInfo.symptoms'), margin, yPosition)
        yPosition += 15

        doc.setFontSize(10)
        doc.setTextColor(75, 85, 99)
        const symptoms = data.symptoms[language] || data.symptoms['en']
        symptoms.forEach((symptom: string, _index: number) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage()
            yPosition = 30
          }
          addTextToPDF(doc, `• ${symptom}`, margin + 10, yPosition)
          yPosition += 8
        })
        yPosition += 10
      }

      // Prevention
      if (data.prevention) {
        doc.setFontSize(14)
        doc.setTextColor(59, 130, 246)
        addTextToPDF(doc, t('diseaseInfo.prevention'), margin, yPosition)
        yPosition += 15

        doc.setFontSize(10)
        doc.setTextColor(75, 85, 99)
        const prevention = data.prevention[language] || data.prevention['en']
        prevention.forEach((item: string, _index: number) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage()
            yPosition = 30
          }
          addTextToPDF(doc, `• ${item}`, margin + 10, yPosition)
          yPosition += 8
        })
        yPosition += 10
      }

      // Treatment
      if (data.treatment) {
        doc.setFontSize(14)
        doc.setTextColor(59, 130, 246)
        addTextToPDF(doc, t('diseaseInfo.treatment'), margin, yPosition)
        yPosition += 15

        doc.setFontSize(10)
        doc.setTextColor(75, 85, 99)
        const treatment = data.treatment[language] || data.treatment['en']
        treatment.forEach((item: string, _index: number) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage()
            yPosition = 30
          }
          addTextToPDF(doc, `• ${item}`, margin + 10, yPosition)
          yPosition += 8
        })
        yPosition += 10
      }

      // Food recommendations
      if (data.food) {
        doc.setFontSize(14)
        doc.setTextColor(59, 130, 246)
        addTextToPDF(doc, t('diseaseInfo.foodRecommendations'), margin, yPosition)
        yPosition += 15

        // Recommended foods
        if (data.food.recommended) {
          doc.setFontSize(12)
          doc.setTextColor(34, 197, 94) // Green color
          addTextToPDF(doc, t('diseaseInfo.whatToEat'), margin, yPosition)
          yPosition += 10

          doc.setFontSize(10)
          doc.setTextColor(75, 85, 99)
          const recommended = data.food.recommended[language] || data.food.recommended['en']
          recommended.forEach((food: string, _index: number) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage()
              yPosition = 30
            }
            addTextToPDF(doc, `• ${food}`, margin + 10, yPosition)
            yPosition += 8
          })
          yPosition += 10
        }

        // Foods to avoid
        if (data.food.avoid) {
          doc.setFontSize(12)
          doc.setTextColor(239, 68, 68) // Red color
          addTextToPDF(doc, t('diseaseInfo.whatToAvoid'), margin, yPosition)
          yPosition += 10

          doc.setFontSize(10)
          doc.setTextColor(75, 85, 99)
          const avoid = data.food.avoid[language] || data.food.avoid['en']
          avoid.forEach((food: string, _index: number) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage()
              yPosition = 30
            }
            addTextToPDF(doc, `• ${food}`, margin + 10, yPosition)
            yPosition += 8
          })
        }
      }
    } else if (type === 'analysis') {
      // Analysis results
      doc.setFontSize(16)
      doc.setTextColor(17, 24, 39)
      doc.text('AI Analysis Results', margin, yPosition)
      yPosition += 20

      if (data.analysis) {
        doc.setFontSize(12)
        doc.setTextColor(59, 130, 246)
        doc.text('Analysis:', margin, yPosition)
        yPosition += 15

        doc.setFontSize(10)
        doc.setTextColor(75, 85, 99)
        const analysisText = data.analysis.description || data.analysis
        const lines = doc.splitTextToSize(analysisText, pageWidth - 2 * margin)
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage()
            yPosition = 30
          }
          doc.text(line, margin, yPosition)
          yPosition += 8
        })
        yPosition += 10
      }

      if (data.recommendations) {
        doc.setFontSize(12)
        doc.setTextColor(59, 130, 246)
        doc.text(t('symptomAnalyzer.recommendations'), margin, yPosition)
        yPosition += 15

        doc.setFontSize(10)
        doc.setTextColor(75, 85, 99)
        data.recommendations.forEach((rec: string) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage()
            yPosition = 30
          }
          doc.text(`• ${rec}`, margin + 10, yPosition)
          yPosition += 8
        })
        yPosition += 10
      }

      if (data.precautions) {
        doc.setFontSize(12)
        doc.setTextColor(59, 130, 246)
        doc.text(t('symptomAnalyzer.precautions'), margin, yPosition)
        yPosition += 15

        doc.setFontSize(10)
        doc.setTextColor(75, 85, 99)
        data.precautions.forEach((prec: string) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage()
            yPosition = 30
          }
          doc.text(`• ${prec}`, margin + 10, yPosition)
          yPosition += 8
        })
      }
    }

    // Add disclaimer
    doc.addPage()
    doc.setFontSize(10)
    doc.setTextColor(156, 163, 175)
    const disclaimer = t('pdf.disclaimer')
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin)
    disclaimerLines.forEach((line: string, index: number) => {
      doc.text(line, margin, 30 + (index * 8))
    })

    // Save the PDF
    const filename = `medicare-nepal-${type}-report-${Date.now()}.pdf`
    doc.save(filename)
  }

  return (
    <motion.button
      onClick={generatePDF}
      className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaFilePdf className="text-lg" />
      <span className="font-medium">{t('common.export')}</span>
      <FaDownload className="text-sm" />
    </motion.button>
  )
}

export default PDFExporter

