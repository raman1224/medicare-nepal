import { logger } from '../utils/logger.js'

// Comprehensive medicine database
const medicineDatabase = {
  'paracetamol': {
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    manufacturer: 'Various manufacturers',
    purpose: 'Pain relief and fever reduction',
    dosageForm: 'Tablet, Syrup, Suppository',
    sideEffects: 'Nausea, liver problems in high doses, allergic reactions',
    precautions: 'Do not exceed recommended dose, avoid with alcohol, consult doctor if pregnant',
    storage: 'Store in a cool, dry place below 25°C',
    whenToTake: 'Every 4-6 hours as needed',
    foodInteractions: 'Can be taken with or without food',
    alternatives: ['Ibuprofen', 'Aspirin', 'Naproxen'],
    price: { min: 50, max: 200, currency: 'NPR' },
    usage: 'Pain relief and fever reduction',
    dosage: '500-1000mg every 4-6 hours'
  },
  'ibuprofen': {
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    manufacturer: 'Various manufacturers',
    purpose: 'Pain relief, inflammation reduction, fever reduction',
    dosageForm: 'Tablet, Syrup, Gel',
    sideEffects: 'Stomach upset, kidney problems, increased bleeding risk',
    precautions: 'Take with food, avoid if stomach ulcers, consult doctor if pregnant',
    storage: 'Store in a cool, dry place',
    whenToTake: 'Every 6-8 hours as needed',
    foodInteractions: 'Take with food to reduce stomach upset',
    alternatives: ['Paracetamol', 'Aspirin', 'Naproxen'],
    price: { min: 100, max: 300, currency: 'NPR' },
    usage: 'Pain relief and inflammation reduction',
    dosage: '200-400mg every 6-8 hours'
  },
  'amoxicillin': {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    manufacturer: 'Various manufacturers',
    purpose: 'Antibiotic for bacterial infections',
    dosageForm: 'Capsule, Tablet, Syrup',
    sideEffects: 'Diarrhea, nausea, allergic reactions, yeast infection',
    precautions: 'Complete full course, avoid if allergic to penicillin',
    storage: 'Store in a cool, dry place',
    whenToTake: 'As prescribed by doctor, usually 2-3 times daily',
    foodInteractions: 'Can be taken with or without food',
    alternatives: ['Azithromycin', 'Clarithromycin', 'Doxycycline'],
    price: { min: 200, max: 500, currency: 'NPR' },
    usage: 'Treatment of bacterial infections',
    dosage: 'As prescribed by doctor'
  },
  'omeprazole': {
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    manufacturer: 'Various manufacturers',
    purpose: 'Reduces stomach acid production',
    dosageForm: 'Capsule, Tablet',
    sideEffects: 'Headache, diarrhea, stomach pain, vitamin B12 deficiency',
    precautions: 'Take on empty stomach, avoid long-term use without doctor supervision',
    storage: 'Store in a cool, dry place',
    whenToTake: 'Once daily, usually in the morning',
    foodInteractions: 'Take on empty stomach 30 minutes before breakfast',
    alternatives: ['Pantoprazole', 'Lansoprazole', 'Esomeprazole'],
    price: { min: 150, max: 400, currency: 'NPR' },
    usage: 'Treatment of acid reflux and stomach ulcers',
    dosage: '20-40mg once daily'
  },
  'metformin': {
    name: 'Metformin',
    genericName: 'Metformin',
    manufacturer: 'Various manufacturers',
    purpose: 'Diabetes medication to control blood sugar',
    dosageForm: 'Tablet, Extended-release tablet',
    sideEffects: 'Nausea, diarrhea, stomach upset, lactic acidosis (rare)',
    precautions: 'Take with food, monitor blood sugar, avoid alcohol',
    storage: 'Store in a cool, dry place',
    whenToTake: 'With meals as prescribed',
    foodInteractions: 'Take with food to reduce stomach upset',
    alternatives: ['Sulfonylureas', 'DPP-4 inhibitors', 'SGLT2 inhibitors'],
    price: { min: 100, max: 300, currency: 'NPR' },
    usage: 'Treatment of type 2 diabetes',
    dosage: 'As prescribed by doctor'
  },
  'aspirin': {
    name: 'Aspirin',
    genericName: 'Acetylsalicylic acid',
    manufacturer: 'Various manufacturers',
    purpose: 'Pain relief, blood thinning, fever reduction',
    dosageForm: 'Tablet, Chewable tablet',
    sideEffects: 'Stomach irritation, increased bleeding risk, ringing in ears',
    precautions: 'Avoid if bleeding disorders, consult doctor before surgery',
    storage: 'Store in a cool, dry place',
    whenToTake: 'Every 4-6 hours as needed',
    foodInteractions: 'Take with food to reduce stomach irritation',
    alternatives: ['Paracetamol', 'Ibuprofen', 'Naproxen'],
    price: { min: 30, max: 100, currency: 'NPR' },
    usage: 'Pain relief and blood thinning',
    dosage: '325-650mg every 4-6 hours'
  },
  'vitamin c': {
    name: 'Vitamin C',
    genericName: 'Ascorbic acid',
    manufacturer: 'Various manufacturers',
    purpose: 'Immune system support, antioxidant',
    dosageForm: 'Tablet, Chewable tablet, Syrup',
    sideEffects: 'Diarrhea, stomach upset (in high doses)',
    precautions: 'Do not exceed recommended dose',
    storage: 'Store in a cool, dry place',
    whenToTake: 'Once daily with food',
    foodInteractions: 'Take with food for better absorption',
    alternatives: ['Natural sources (oranges, lemons, vegetables)'],
    price: { min: 50, max: 150, currency: 'NPR' },
    usage: 'Immune system support and antioxidant',
    dosage: '500-1000mg daily'
  },
  'calcium': {
    name: 'Calcium',
    genericName: 'Calcium carbonate/calcium citrate',
    manufacturer: 'Various manufacturers',
    purpose: 'Bone health, muscle function',
    dosageForm: 'Tablet, Chewable tablet, Syrup',
    sideEffects: 'Constipation, gas, bloating',
    precautions: 'Take with vitamin D for better absorption',
    storage: 'Store in a cool, dry place',
    whenToTake: 'With meals',
    foodInteractions: 'Take with food for better absorption',
    alternatives: ['Natural sources (dairy, leafy greens)'],
    price: { min: 100, max: 300, currency: 'NPR' },
    usage: 'Bone health and muscle function',
    dosage: '500-1000mg daily'
  }
}

// Enhanced medicine analysis function
export const analyzeMedicineName = async (medicineName, language = 'en') => {
  try {
    logger.info(`Analyzing medicine: ${medicineName}`)
    
    const normalizedName = medicineName.toLowerCase().trim()
    
    // Check for exact matches first
    if (medicineDatabase[normalizedName]) {
      const medicine = medicineDatabase[normalizedName]
      return {
        success: true,
        message: 'Medicine analysis completed successfully',
        data: {
          medicineName: medicine.name,
          genericName: medicine.genericName,
          manufacturer: medicine.manufacturer,
          usage: medicine.usage,
          dosage: medicine.dosage,
          sideEffects: medicine.sideEffects.split(', '),
          precautions: medicine.precautions.split(', '),
          price: medicine.price,
          alternatives: medicine.alternatives
        }
      }
    }
    
    // Check for partial matches
    const partialMatches = Object.keys(medicineDatabase).filter(key => 
      key.includes(normalizedName) || normalizedName.includes(key)
    )
    
    if (partialMatches.length > 0) {
      const bestMatch = partialMatches[0]
      const medicine = medicineDatabase[bestMatch]
      return {
        success: true,
        message: 'Medicine analysis completed successfully',
        data: {
          medicineName: medicine.name,
          genericName: medicine.genericName,
          manufacturer: medicine.manufacturer,
          usage: medicine.usage,
          dosage: medicine.dosage,
          sideEffects: medicine.sideEffects.split(', '),
          precautions: medicine.precautions.split(', '),
          price: medicine.price,
          alternatives: medicine.alternatives
        }
      }
    }
    
    // Return generic information for unknown medicines
    return {
      success: true,
      message: 'Generic medicine information provided',
      data: {
        medicineName: medicineName,
        genericName: 'Unknown',
        manufacturer: 'Various manufacturers',
        usage: 'Consult your doctor for proper usage information',
        dosage: 'As prescribed by your doctor',
        sideEffects: ['Consult your doctor for side effects'],
        precautions: ['Consult your doctor before use'],
        price: { min: 50, max: 200, currency: 'NPR' },
        alternatives: ['Consult your doctor for alternatives']
      }
    }
    
  } catch (error) {
    logger.error(`Medicine analysis error: ${error.message}`)
    throw new Error(`Failed to analyze medicine: ${error.message}`)
  }
}

// Get medicine recommendations
export const getMedicineRecommendations = (condition) => {
  const normalizedCondition = condition.toLowerCase().trim()
  
  const recommendations = {
    'fever': ['Paracetamol', 'Ibuprofen'],
    'headache': ['Paracetamol', 'Ibuprofen', 'Aspirin'],
    'pain': ['Paracetamol', 'Ibuprofen', 'Aspirin'],
    'infection': ['Amoxicillin', 'Consult doctor for proper antibiotic'],
    'acid reflux': ['Omeprazole', 'Pantoprazole'],
    'diabetes': ['Metformin', 'Consult doctor for proper medication'],
    'vitamin deficiency': ['Vitamin C', 'Calcium', 'Multivitamin'],
    'immune support': ['Vitamin C', 'Zinc', 'Vitamin D']
  }
  
  for (const [key, medicines] of Object.entries(recommendations)) {
    if (normalizedCondition.includes(key)) {
      return medicines
    }
  }
  
  return ['Consult your doctor for proper medication']
}
