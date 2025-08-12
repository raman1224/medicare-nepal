import Tesseract from 'tesseract.js'
import axios from 'axios'
import { logger } from '../utils/logger.js'

// Extract text from image using Tesseract OCR
export const extractTextFromImage = async (imageBuffer) => {
  try {
    logger.info('Starting OCR text extraction...')
    
    const result = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: m => logger.info(`OCR Progress: ${m.status} - ${m.progress * 100}%`)
      }
    )
    
    const extractedText = result.data.text.trim()
    const confidence = result.data.confidence / 100
    
    logger.info(`OCR completed. Extracted text length: ${extractedText.length}, Confidence: ${confidence}`)
    
    return {
      text: extractedText,
      confidence: confidence,
      words: result.data.words || []
    }
  } catch (error) {
    logger.error(`OCR extraction error: ${error.message}`)
    throw new Error(`Failed to extract text from image: ${error.message}`)
  }
}

// Enhanced medicine name identification with better pattern matching
export const identifyMedicineNames = (text) => {
  // Comprehensive list of medicine names and patterns
  const medicineKeywords = [
    // Common pain relievers
    'paracetamol', 'acetaminophen', 'ibuprofen', 'aspirin', 'naproxen', 'diclofenac',
    'celecoxib', 'meloxicam', 'ketorolac', 'indomethacin', 'piroxicam',
    
    // Antibiotics
    'amoxicillin', 'azithromycin', 'ciprofloxacin', 'doxycycline', 'clindamycin',
    'metronidazole', 'ceftriaxone', 'cefuroxime', 'cefazolin', 'gentamicin',
    'vancomycin', 'clindamycin', 'erythromycin', 'tetracycline', 'penicillin',
    
    // Gastrointestinal
    'omeprazole', 'pantoprazole', 'esomeprazole', 'lansoprazole', 'rabeprazole',
    'ranitidine', 'famotidine', 'cimetidine', 'metoclopramide', 'domperidone',
    'loperamide', 'bismuth', 'sucralfate', 'misoprostol',
    
    // Cardiovascular
    'amlodipine', 'losartan', 'valsartan', 'candesartan', 'irbesartan',
    'metoprolol', 'atenolol', 'propranolol', 'carvedilol', 'bisoprolol',
    'furosemide', 'hydrochlorothiazide', 'spironolactone', 'eplerenone',
    'nitroglycerin', 'isosorbide', 'diltiazem', 'verapamil', 'nifedipine',
    
    // Diabetes
    'metformin', 'glimepiride', 'glipizide', 'pioglitazone', 'sitagliptin',
    'linagliptin', 'saxagliptin', 'dapagliflozin', 'empagliflozin',
    
    // Respiratory
    'salbutamol', 'formoterol', 'tiotropium', 'ipratropium', 'budesonide',
    'fluticasone', 'beclomethasone', 'montelukast', 'theophylline',
    
    // Mental health
    'sertraline', 'fluoxetine', 'venlafaxine', 'bupropion', 'escitalopram',
    'citalopram', 'paroxetine', 'duloxetine', 'mirtazapine',
    
    // Sleep and anxiety
    'alprazolam', 'diazepam', 'lorazepam', 'clonazepam', 'zolpidem',
    'zopiclone', 'eszopiclone', 'ramelteon', 'melatonin',
    
    // Pain management
    'tramadol', 'codeine', 'morphine', 'oxycodone', 'hydrocodone',
    'tapentadol', 'buprenorphine', 'fentanyl', 'methadone',
    
    // Anticonvulsants
    'gabapentin', 'pregabalin', 'carbamazepine', 'phenytoin', 'lamotrigine',
    'levetiracetam', 'topiramate', 'valproate', 'levetiracetam',
    
    // Antipsychotics
    'quetiapine', 'risperidone', 'olanzapine', 'aripiprazole', 'haloperidol',
    'chlorpromazine', 'fluphenazine', 'thioridazine', 'ziprasidone',
    
    // Thyroid
    'levothyroxine', 'propylthiouracil', 'methimazole', 'liothyronine',
    
    // Blood thinners
    'warfarin', 'heparin', 'enoxaparin', 'clopidogrel', 'aspirin',
    'dabigatran', 'rivaroxaban', 'apixaban', 'edoxaban',
    
    // Statins
    'atorvastatin', 'rosuvastatin', 'simvastatin', 'pravastatin', 'fluvastatin',
    'lovastatin', 'pitavastatin', 'ezetimibe', 'fenofibrate',
    
    // Common brand names
    'crocin', 'dolo', 'combiflam', 'voveran', 'voltaren', 'augmentin',
    'zithromax', 'cipro', 'flagyl', 'citramon', 'sinarest', 'calpol',
    'panadol', 'tylenol', 'advil', 'motrin', 'aleve', 'voltaren'
  ]
  
  const textLower = text.toLowerCase()
  const foundMedicines = []
  
  // Check for exact medicine names
  for (const medicine of medicineKeywords) {
    if (textLower.includes(medicine)) {
      foundMedicines.push({
        name: medicine,
        confidence: 0.95,
        source: 'exact_match'
      })
    }
  }
  
  // Check for medicine patterns with dosage
  const medicinePatterns = [
    /\b\d+\s*mg\b/gi,
    /\b\d+\s*mcg\b/gi,
    /\b\d+\s*ml\b/gi,
    /\b\d+\s*grams?\b/gi,
    /\b\d+\s*g\b/gi,
    /\btablet\b/gi,
    /\bcapsule\b/gi,
    /\bsyrup\b/gi,
    /\binjection\b/gi,
    /\bcream\b/gi,
    /\bgel\b/gi,
    /\bpowder\b/gi,
    /\bsuspension\b/gi,
    /\bdrops\b/gi,
    /\bspray\b/gi,
    /\binhaler\b/gi,
    /\bsuppository\b/gi,
    /\bpatch\b/gi,
    /\bpill\b/gi,
    /\bmedication\b/gi,
    /\bmedicine\b/gi,
    /\bdrug\b/gi
  ]
  
  for (const pattern of medicinePatterns) {
    const matches = text.match(pattern)
    if (matches) {
      foundMedicines.push({
        name: matches[0],
        confidence: 0.8,
        source: 'pattern_match'
      })
    }
  }
  
  // Extract potential medicine names (words that look like medicine names)
  const words = text.split(/\s+/)
  const potentialMedicines = words.filter(word => {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase()
    return cleanWord.length > 3 && 
           /^[a-zA-Z]+$/.test(cleanWord) &&
           !['take', 'with', 'food', 'water', 'daily', 'twice', 'three', 'times', 
             'before', 'after', 'meal', 'tablet', 'capsule', 'syrup', 'injection',
             'cream', 'gel', 'powder', 'suspension', 'drops', 'spray', 'inhaler',
             'suppository', 'patch', 'pill', 'medication', 'medicine', 'drug',
             'mg', 'mcg', 'ml', 'gram', 'grams', 'g'].includes(cleanWord)
  })
  
  for (const word of potentialMedicines) {
    if (!foundMedicines.some(m => m.name.toLowerCase() === word)) {
      foundMedicines.push({
        name: word,
        confidence: 0.6,
        source: 'potential_match'
      })
    }
  }
  
  // Sort by confidence
  foundMedicines.sort((a, b) => b.confidence - a.confidence)
  
  return foundMedicines
}

// Enhanced drug information from OpenFDA API
export const getDrugInfoFromOpenFDA = async (medicineName) => {
  try {
    const response = await axios.get(`https://api.fda.gov/drug/label.json?search=generic_name:${encodeURIComponent(medicineName)}&limit=1`, {
      timeout: 10000
    })
    
    if (response.data.results && response.data.results.length > 0) {
      const drug = response.data.results[0]
      return {
        name: drug.openfda.generic_name?.[0] || medicineName,
        genericName: drug.openfda.generic_name?.[0] || medicineName,
        manufacturer: drug.openfda.manufacturer_name?.[0] || 'Various manufacturers',
        purpose: drug.purpose?.[0] || drug.indications_and_usage?.[0] || 'Not specified',
        dosageForm: drug.openfda.dosage_and_administration?.[0] || 'Not specified',
        sideEffects: drug.warnings?.[0] || drug.adverse_reactions?.[0] || 'Consult your doctor for side effects',
        precautions: drug.precautions?.[0] || 'Consult your doctor for precautions',
        storage: drug.storage_and_handling?.[0] || 'Store in a cool, dry place',
        whenToTake: drug.dosage_and_administration?.[0] || 'As prescribed by your doctor',
        foodInteractions: drug.drug_interactions?.[0] || 'Consult your doctor about food interactions',
        alternatives: [],
        price: { min: 5, max: 50, currency: 'USD' },
        source: 'OpenFDA'
      }
    }
    return null
  } catch (error) {
    logger.error(`OpenFDA API error for ${medicineName}: ${error.message}`)
    return null
  }
}

// Enhanced drug information from RxNav API
export const getDrugInfoFromRxNav = async (medicineName) => {
  try {
    const searchResponse = await axios.get(`https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(medicineName)}`, {
      timeout: 10000
    })
    
    if (searchResponse.data.suggestionGroup && searchResponse.data.suggestionGroup.suggestionList) {
      const suggestions = searchResponse.data.suggestionGroup.suggestionList.suggestion
      if (suggestions && suggestions.length > 0) {
        const rxcui = suggestions[0].rxcui
        
        const detailResponse = await axios.get(`https://rxnav.nlm.nih.gov/REST/allrelated.json?rxcui=${rxcui}`, {
          timeout: 10000
        })
        
        if (detailResponse.data.allRelatedGroup && detailResponse.data.allRelatedGroup.conceptGroup) {
          const conceptGroup = detailResponse.data.allRelatedGroup.conceptGroup[0]
          if (conceptGroup.concept) {
            const concept = conceptGroup.concept[0]
            return {
              name: concept.name || medicineName,
              genericName: concept.name || medicineName,
              manufacturer: 'Various manufacturers',
              purpose: 'Consult your doctor for specific information',
              dosageForm: concept.drugClasses?.[0]?.drugClass?.[0]?.name || 'Not specified',
              sideEffects: 'Consult your doctor for side effects',
              precautions: 'Consult your doctor for precautions',
              storage: 'Store in a cool, dry place',
              whenToTake: 'As prescribed by your doctor',
              foodInteractions: 'Consult your doctor about food interactions',
              alternatives: [],
              price: { min: 10, max: 100, currency: 'USD' },
              source: 'RxNav'
            }
          }
        }
      }
    }
    return null
  } catch (error) {
    logger.error(`RxNav API error for ${medicineName}: ${error.message}`)
    return null
  }
}

// Enhanced mock drug database
const mockDrugDatabase = {
  'paracetamol': {
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    manufacturer: 'Various manufacturers',
    purpose: 'Pain relief and fever reduction',
    dosageForm: 'Tablet, Syrup, Suppository',
    sideEffects: 'Rare: skin rash, allergic reactions. Overdose can cause liver damage.',
    precautions: 'Do not exceed recommended dose. Avoid alcohol. Consult doctor if pregnant.',
    storage: 'Store below 30°C in a dry place',
    whenToTake: 'Every 4-6 hours as needed, with or without food',
    foodInteractions: 'No significant food interactions',
    alternatives: ['Ibuprofen', 'Aspirin', 'Naproxen'],
    price: { min: 2, max: 15, currency: 'USD' },
    source: 'Mock Database'
  },
  'ibuprofen': {
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    manufacturer: 'Various manufacturers',
    purpose: 'Pain relief, inflammation reduction, fever reduction',
    dosageForm: 'Tablet, Syrup, Gel',
    sideEffects: 'Stomach upset, heartburn, dizziness. Long-term use may affect kidneys.',
    precautions: 'Take with food. Avoid if you have stomach ulcers or kidney problems.',
    storage: 'Store below 25°C in a dry place',
    whenToTake: 'Every 6-8 hours with food',
    foodInteractions: 'Take with food to reduce stomach irritation',
    alternatives: ['Paracetamol', 'Naproxen', 'Diclofenac'],
    price: { min: 3, max: 20, currency: 'USD' },
    source: 'Mock Database'
  },
  'amoxicillin': {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    manufacturer: 'Various manufacturers',
    purpose: 'Antibiotic to treat bacterial infections',
    dosageForm: 'Capsule, Tablet, Syrup',
    sideEffects: 'Diarrhea, nausea, skin rash. Severe allergic reactions possible.',
    precautions: 'Complete full course. Avoid if allergic to penicillin.',
    storage: 'Store in refrigerator, keep dry',
    whenToTake: 'As prescribed, usually 2-3 times daily',
    foodInteractions: 'Can be taken with or without food',
    alternatives: ['Azithromycin', 'Clarithromycin', 'Doxycycline'],
    price: { min: 5, max: 30, currency: 'USD' },
    source: 'Mock Database'
  },
  'omeprazole': {
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    manufacturer: 'Various manufacturers',
    purpose: 'Reduces stomach acid production, treats acid reflux and ulcers',
    dosageForm: 'Capsule, Tablet',
    sideEffects: 'Headache, diarrhea, stomach pain. Long-term use may affect bone health.',
    precautions: 'Take on empty stomach. Avoid if pregnant or breastfeeding.',
    storage: 'Store at room temperature',
    whenToTake: 'Once daily, 30 minutes before breakfast',
    foodInteractions: 'Take on empty stomach for best absorption',
    alternatives: ['Pantoprazole', 'Esomeprazole', 'Lansoprazole'],
    price: { min: 8, max: 25, currency: 'USD' },
    source: 'Mock Database'
  },
  'metformin': {
    name: 'Metformin',
    genericName: 'Metformin',
    manufacturer: 'Various manufacturers',
    purpose: 'Diabetes medication to control blood sugar levels',
    dosageForm: 'Tablet, Extended-release tablet',
    sideEffects: 'Nausea, diarrhea, stomach upset. Rare: lactic acidosis.',
    precautions: 'Take with food. Monitor blood sugar regularly.',
    storage: 'Store at room temperature',
    whenToTake: 'With meals, as prescribed by doctor',
    foodInteractions: 'Take with food to reduce stomach upset',
    alternatives: ['Glimepiride', 'Glipizide', 'Pioglitazone'],
    price: { min: 5, max: 20, currency: 'USD' },
    source: 'Mock Database'
  }
}

// Enhanced mock drug information
export const getMockDrugInfo = (medicineName) => {
  const normalizedName = medicineName.toLowerCase().trim()
  
  // Check exact matches
  if (mockDrugDatabase[normalizedName]) {
    return mockDrugDatabase[normalizedName]
  }
  
  // Check partial matches
  for (const [key, value] of Object.entries(mockDrugDatabase)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value
    }
  }
  
  // Return generic information for unknown medicines
  return {
    name: medicineName,
    genericName: medicineName,
    manufacturer: 'Various manufacturers',
    purpose: 'Consult your doctor for specific information',
    dosageForm: 'Not specified',
    sideEffects: 'Consult your doctor for side effects',
    precautions: 'Consult your doctor for precautions',
    storage: 'Store in a cool, dry place',
    whenToTake: 'As prescribed by your doctor',
    foodInteractions: 'Consult your doctor about food interactions',
    alternatives: [],
    price: { min: 5, max: 50, currency: 'USD' },
    source: 'Generic Information'
  }
}

// Enhanced main function to analyze medicine image
export const analyzeMedicineImage = async (imageBuffer) => {
  try {
    logger.info('Starting enhanced medicine image analysis...')
    
    // Step 1: Extract text using OCR
    const ocrResult = await extractTextFromImage(imageBuffer)
    
    // Step 2: Identify medicine names with enhanced detection
    const medicines = identifyMedicineNames(ocrResult.text)
    
    if (medicines.length === 0) {
      return {
        success: false,
        message: 'No medicine names detected in the image. Please try uploading a clearer image showing the medicine label or packaging.',
        data: {
          detectedText: ocrResult.text,
          confidence: ocrResult.confidence,
          medicines: []
        }
      }
    }
    
    // Step 3: Get detailed information for each medicine
    const detailedMedicines = []
    
    for (const medicine of medicines.slice(0, 3)) { // Limit to top 3 matches
      let drugInfo = null
      
      // Try OpenFDA first
      try {
        drugInfo = await getDrugInfoFromOpenFDA(medicine.name)
      } catch (error) {
        logger.warn(`OpenFDA failed for ${medicine.name}: ${error.message}`)
      }
      
      // Try RxNav if OpenFDA failed
      if (!drugInfo) {
        try {
          drugInfo = await getDrugInfoFromRxNav(medicine.name)
        } catch (error) {
          logger.warn(`RxNav failed for ${medicine.name}: ${error.message}`)
        }
      }
      
      // Use mock database as fallback
      if (!drugInfo) {
        drugInfo = getMockDrugInfo(medicine.name)
      }
      
      detailedMedicines.push({
        ...drugInfo,
        detectedConfidence: medicine.confidence,
        detectionSource: medicine.source
      })
    }
    
    // Step 4: Return results
    const primaryMedicine = detailedMedicines[0] // Most confident match
    
    return {
      success: true,
      message: `Successfully analyzed ${detailedMedicines.length} medicine(s)`,
      data: {
        medicines: detailedMedicines,
        primaryMedicine: primaryMedicine,
        detectedText: ocrResult.text,
        confidence: ocrResult.confidence,
        totalMedicines: detailedMedicines.length
      }
    }
    
  } catch (error) {
    logger.error(`Medicine analysis error: ${error.message}`)
    throw new Error(`Failed to analyze medicine image: ${error.message}`)
  }
}

// Import the enhanced food analysis service
import { analyzeFoodImage as enhancedFoodAnalysis, getFoodInfo } from './foodAnalysisService.js'

// Enhanced food image analysis
export const analyzeFoodImage = async (imageBuffer) => {
  try {
    logger.info('Starting enhanced food image analysis...')
    
    // Extract text from food image
    const ocrResult = await extractTextFromImage(imageBuffer)
    
    // Enhanced food keywords
    const foodKeywords = [
      'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry',
      'carrot', 'broccoli', 'spinach', 'lettuce', 'tomato', 'potato', 'onion',
      'rice', 'bread', 'pasta', 'noodle', 'chicken', 'fish', 'beef', 'pork',
      'milk', 'cheese', 'yogurt', 'egg', 'nut', 'almond', 'walnut', 'peanut',
      'tea', 'coffee', 'juice', 'water', 'soda', 'beer', 'wine', 'ginger',
      'honey', 'lemon', 'turmeric', 'garlic', 'cucumber', 'bell pepper',
      'cauliflower', 'cabbage', 'mushroom', 'corn', 'peas', 'beans', 'lentil'
    ]
    
    const textLower = ocrResult.text.toLowerCase()
    const foundFoods = []
    
    for (const food of foodKeywords) {
      if (textLower.includes(food)) {
        const foodInfo = getFoodInfo(food)
        foundFoods.push(foodInfo)
      }
    }
    
    // If no foods found in OCR, return enhanced mock data
    if (foundFoods.length === 0) {
      return await enhancedFoodAnalysis(imageBuffer)
    }
    
    return {
      success: true,
      message: `Analyzed food image successfully`,
      data: {
        foods: foundFoods,
        detectedText: ocrResult.text,
        confidence: ocrResult.confidence
      }
    }
    
  } catch (error) {
    logger.error(`Food analysis error: ${error.message}`)
    throw new Error(`Failed to analyze food image: ${error.message}`)
  }
} 