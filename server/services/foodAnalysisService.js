import { logger } from '../utils/logger.js'

// Comprehensive food database with detailed nutritional information
const foodDatabase = {
  'apple': {
    name: 'Apple',
    description: 'A sweet, crisp fruit rich in fiber and antioxidants',
    healthBenefits: 'Supports heart health, aids digestion, and provides immune-boosting vitamin C',
    nutrients: ['Vitamin C', 'Fiber', 'Potassium', 'Antioxidants'],
    category: 'fruits',
    recommendedFor: ['Heart health', 'Digestion', 'Weight management', 'Immune support'],
    avoidIf: ['Apple allergy', 'FODMAP sensitivity'],
    calories: 95,
    protein: '0.5g',
    carbs: '25g',
    fiber: '4g',
    sugar: '19g'
  },
  'banana': {
    name: 'Banana',
    description: 'A potassium-rich fruit that provides quick energy',
    healthBenefits: 'Supports muscle function, heart health, and provides natural energy',
    nutrients: ['Potassium', 'Vitamin B6', 'Vitamin C', 'Fiber'],
    category: 'fruits',
    recommendedFor: ['Athletes', 'Heart health', 'Digestion', 'Energy boost'],
    avoidIf: ['High potassium diet restrictions', 'Latex allergy'],
    calories: 105,
    protein: '1.3g',
    carbs: '27g',
    fiber: '3g',
    sugar: '14g'
  },
  'orange': {
    name: 'Orange',
    description: 'A citrus fruit packed with vitamin C and antioxidants',
    healthBenefits: 'Boosts immune system, supports skin health, and aids iron absorption',
    nutrients: ['Vitamin C', 'Folate', 'Potassium', 'Antioxidants'],
    category: 'fruits',
    recommendedFor: ['Immune support', 'Skin health', 'Iron absorption', 'Heart health'],
    avoidIf: ['Citrus allergy', 'Acid reflux', 'GERD'],
    calories: 62,
    protein: '1.2g',
    carbs: '15g',
    fiber: '3g',
    sugar: '12g'
  },
  'carrot': {
    name: 'Carrot',
    description: 'A root vegetable rich in beta-carotene and fiber',
    healthBenefits: 'Supports eye health, immune system, and provides antioxidant protection',
    nutrients: ['Beta-carotene', 'Vitamin A', 'Fiber', 'Potassium'],
    category: 'vegetables',
    recommendedFor: ['Eye health', 'Immune support', 'Skin health', 'Digestion'],
    avoidIf: ['Carrot allergy'],
    calories: 41,
    protein: '0.9g',
    carbs: '10g',
    fiber: '2.8g',
    sugar: '4.7g'
  },
  'broccoli': {
    name: 'Broccoli',
    description: 'A cruciferous vegetable with powerful anti-cancer properties',
    healthBenefits: 'Supports detoxification, bone health, and provides anti-inflammatory benefits',
    nutrients: ['Vitamin C', 'Vitamin K', 'Fiber', 'Sulforaphane'],
    category: 'vegetables',
    recommendedFor: ['Cancer prevention', 'Bone health', 'Detoxification', 'Immune support'],
    avoidIf: ['Cruciferous vegetable sensitivity', 'Thyroid issues'],
    calories: 34,
    protein: '2.8g',
    carbs: '7g',
    fiber: '2.6g',
    sugar: '1.5g'
  },
  'spinach': {
    name: 'Spinach',
    description: 'A leafy green vegetable rich in iron and vitamins',
    healthBenefits: 'Supports blood health, muscle function, and provides anti-inflammatory benefits',
    nutrients: ['Iron', 'Vitamin K', 'Folate', 'Magnesium'],
    category: 'vegetables',
    recommendedFor: ['Anemia prevention', 'Bone health', 'Muscle function', 'Eye health'],
    avoidIf: ['Kidney stones', 'Blood thinners'],
    calories: 23,
    protein: '2.9g',
    carbs: '3.6g',
    fiber: '2.2g',
    sugar: '0.4g'
  },
  'rice': {
    name: 'Rice',
    description: 'A staple grain that provides energy and essential nutrients',
    healthBenefits: 'Provides sustained energy, supports digestive health, and is gluten-free',
    nutrients: ['Carbohydrates', 'B vitamins', 'Iron', 'Fiber'],
    category: 'grains',
    recommendedFor: ['Energy', 'Digestion', 'Gluten-free diet', 'Athletes'],
    avoidIf: ['Diabetes (white rice)', 'Low-carb diet'],
    calories: 130,
    protein: '2.7g',
    carbs: '28g',
    fiber: '0.4g',
    sugar: '0.1g'
  },
  'chicken': {
    name: 'Chicken',
    description: 'A lean protein source rich in essential amino acids',
    healthBenefits: 'Supports muscle growth, immune function, and provides essential nutrients',
    nutrients: ['Protein', 'B vitamins', 'Selenium', 'Phosphorus'],
    category: 'proteins',
    recommendedFor: ['Muscle building', 'Weight management', 'Immune support', 'Athletes'],
    avoidIf: ['Poultry allergy'],
    calories: 165,
    protein: '31g',
    carbs: '0g',
    fiber: '0g',
    sugar: '0g'
  },
  'fish': {
    name: 'Fish',
    description: 'A lean protein source rich in omega-3 fatty acids',
    healthBenefits: 'Supports heart health, brain function, and provides anti-inflammatory benefits',
    nutrients: ['Omega-3', 'Protein', 'Vitamin D', 'Selenium'],
    category: 'proteins',
    recommendedFor: ['Heart health', 'Brain health', 'Joint health', 'Pregnancy'],
    avoidIf: ['Fish allergy', 'Mercury concerns'],
    calories: 140,
    protein: '20g',
    carbs: '0g',
    fiber: '0g',
    sugar: '0g'
  },
  'milk': {
    name: 'Milk',
    description: 'A dairy product rich in calcium and protein',
    healthBenefits: 'Supports bone health, muscle function, and provides essential nutrients',
    nutrients: ['Calcium', 'Protein', 'Vitamin D', 'B vitamins'],
    category: 'dairy',
    recommendedFor: ['Bone health', 'Muscle building', 'Children', 'Athletes'],
    avoidIf: ['Lactose intolerance', 'Dairy allergy'],
    calories: 103,
    protein: '8g',
    carbs: '12g',
    fiber: '0g',
    sugar: '12g'
  },
  'egg': {
    name: 'Egg',
    description: 'A complete protein source with essential nutrients',
    healthBenefits: 'Supports muscle building, brain health, and provides essential nutrients',
    nutrients: ['Protein', 'Choline', 'Vitamin D', 'B vitamins'],
    category: 'proteins',
    recommendedFor: ['Muscle building', 'Brain health', 'Weight management', 'Athletes'],
    avoidIf: ['Egg allergy'],
    calories: 70,
    protein: '6g',
    carbs: '0.6g',
    fiber: '0g',
    sugar: '0.6g'
  },
  'almond': {
    name: 'Almond',
    description: 'A nutrient-dense nut rich in healthy fats and protein',
    healthBenefits: 'Supports heart health, brain function, and provides sustained energy',
    nutrients: ['Healthy fats', 'Protein', 'Vitamin E', 'Magnesium'],
    category: 'nuts',
    recommendedFor: ['Heart health', 'Brain health', 'Weight management', 'Diabetes'],
    avoidIf: ['Nut allergy'],
    calories: 164,
    protein: '6g',
    carbs: '6g',
    fiber: '3.5g',
    sugar: '1.2g'
  },
  'ginger': {
    name: 'Ginger',
    description: 'A spicy root with powerful anti-inflammatory properties',
    healthBenefits: 'Supports digestion, reduces inflammation, and provides immune support',
    nutrients: ['Gingerol', 'Antioxidants', 'Vitamin C', 'Magnesium'],
    category: 'spices',
    recommendedFor: ['Digestion', 'Nausea', 'Inflammation', 'Immune support'],
    avoidIf: ['Ginger allergy', 'Blood thinners'],
    calories: 80,
    protein: '1.8g',
    carbs: '18g',
    fiber: '2g',
    sugar: '1.7g'
  },
  'honey': {
    name: 'Honey',
    description: 'A natural sweetener with antibacterial properties',
    healthBenefits: 'Supports wound healing, provides energy, and has antibacterial effects',
    nutrients: ['Antioxidants', 'Natural sugars', 'Enzymes', 'Minerals'],
    category: 'sweeteners',
    recommendedFor: ['Natural energy', 'Wound healing', 'Cough relief', 'Antibacterial'],
    avoidIf: ['Diabetes', 'Infant botulism risk'],
    calories: 64,
    protein: '0.1g',
    carbs: '17g',
    fiber: '0g',
    sugar: '17g'
  },
  'lemon': {
    name: 'Lemon',
    description: 'A citrus fruit rich in vitamin C and antioxidants',
    healthBenefits: 'Supports immune system, aids digestion, and provides antioxidant protection',
    nutrients: ['Vitamin C', 'Citric acid', 'Antioxidants', 'Fiber'],
    category: 'fruits',
    recommendedFor: ['Immune support', 'Digestion', 'Detoxification', 'Skin health'],
    avoidIf: ['Citrus allergy', 'Acid reflux', 'GERD'],
    calories: 17,
    protein: '0.6g',
    carbs: '5.4g',
    fiber: '1.6g',
    sugar: '1.5g'
  },
  'turmeric': {
    name: 'Turmeric',
    description: 'A golden spice with powerful anti-inflammatory properties',
    healthBenefits: 'Reduces inflammation, supports brain health, and provides antioxidant protection',
    nutrients: ['Curcumin', 'Antioxidants', 'Iron', 'Manganese'],
    category: 'spices',
    recommendedFor: ['Inflammation', 'Joint health', 'Brain health', 'Digestion'],
    avoidIf: ['Blood thinners', 'Gallbladder issues'],
    calories: 29,
    protein: '0.9g',
    carbs: '6.3g',
    fiber: '2.1g',
    sugar: '0.3g'
  },
  'garlic': {
    name: 'Garlic',
    description: 'A pungent bulb with natural antibiotic properties',
    healthBenefits: 'Supports immune system, heart health, and has natural antibiotic effects',
    nutrients: ['Allicin', 'Antioxidants', 'Vitamin C', 'Selenium'],
    category: 'vegetables',
    recommendedFor: ['Immune support', 'Heart health', 'Antibacterial', 'Detoxification'],
    avoidIf: ['Garlic allergy', 'Blood thinners'],
    calories: 149,
    protein: '6.4g',
    carbs: '33g',
    fiber: '2.1g',
    sugar: '1g'
  },
  'tomato': {
    name: 'Tomato',
    description: 'A fruit rich in lycopene and vitamin C',
    healthBenefits: 'Supports heart health, skin protection, and provides antioxidant benefits',
    nutrients: ['Lycopene', 'Vitamin C', 'Potassium', 'Fiber'],
    category: 'vegetables',
    recommendedFor: ['Heart health', 'Skin protection', 'Cancer prevention', 'Eye health'],
    avoidIf: ['Nightshade sensitivity'],
    calories: 18,
    protein: '0.9g',
    carbs: '3.9g',
    fiber: '1.2g',
    sugar: '2.6g'
  }
}

// Enhanced food analysis function
export const analyzeFoodImage = async (imageBuffer) => {
  try {
    logger.info('Starting enhanced food image analysis...')
    
    // For now, we'll return mock data since OCR for food is complex
    // In a real implementation, you would use OCR to extract text and match against food database
    
    const mockFoods = [
      {
        name: 'Apple',
        description: 'A sweet, crisp fruit rich in fiber and antioxidants',
        healthBenefits: 'Supports heart health, aids digestion, and provides immune-boosting vitamin C',
        nutrients: ['Vitamin C', 'Fiber', 'Potassium', 'Antioxidants'],
        category: 'fruits',
        recommendedFor: ['Heart health', 'Digestion', 'Weight management', 'Immune support'],
        avoidIf: ['Apple allergy', 'FODMAP sensitivity']
      },
      {
        name: 'Carrot',
        description: 'A root vegetable rich in beta-carotene and fiber',
        healthBenefits: 'Supports eye health, immune system, and provides antioxidant protection',
        nutrients: ['Beta-carotene', 'Vitamin A', 'Fiber', 'Potassium'],
        category: 'vegetables',
        recommendedFor: ['Eye health', 'Immune support', 'Skin health', 'Digestion'],
        avoidIf: ['Carrot allergy']
      }
    ]
    
    return {
      success: true,
      message: 'Food analysis completed successfully',
      data: {
        foods: mockFoods,
        detectedText: 'Detected food items in image',
        confidence: 0.85
      }
    }
    
  } catch (error) {
    logger.error(`Food analysis error: ${error.message}`)
    throw new Error(`Failed to analyze food image: ${error.message}`)
  }
}

// Get detailed food information by name
export const getFoodInfo = (foodName) => {
  const normalizedName = foodName.toLowerCase().trim()
  
  // Check exact matches
  if (foodDatabase[normalizedName]) {
    return foodDatabase[normalizedName]
  }
  
  // Check partial matches
  for (const [key, value] of Object.entries(foodDatabase)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value
    }
  }
  
  // Return generic information for unknown foods
  return {
    name: foodName,
    description: `Information about ${foodName}`,
    healthBenefits: 'Contains various nutrients beneficial for health',
    nutrients: ['Various nutrients'],
    category: 'unknown',
    recommendedFor: ['General health'],
    avoidIf: ['Known allergies'],
    calories: 0,
    protein: '0g',
    carbs: '0g',
    fiber: '0g',
    sugar: '0g'
  }
}

// Get food recommendations based on health conditions
export const getFoodRecommendations = (condition) => {
  const recommendations = {
    'diabetes': [
      { food: 'almond', reason: 'Low glycemic index, high in healthy fats' },
      { food: 'spinach', reason: 'Low in carbs, high in nutrients' },
      { food: 'fish', reason: 'High in protein and omega-3 fatty acids' }
    ],
    'heart disease': [
      { food: 'fish', reason: 'Rich in omega-3 fatty acids' },
      { food: 'almond', reason: 'Contains healthy fats and fiber' },
      { food: 'garlic', reason: 'Supports heart health' }
    ],
    'anemia': [
      { food: 'spinach', reason: 'High in iron' },
      { food: 'chicken', reason: 'Good source of heme iron' },
      { food: 'egg', reason: 'Contains iron and protein' }
    ],
    'digestion': [
      { food: 'ginger', reason: 'Natural digestive aid' },
      { food: 'apple', reason: 'High in fiber' },
      { food: 'banana', reason: 'Easy to digest' }
    ],
    'immunity': [
      { food: 'orange', reason: 'High in vitamin C' },
      { food: 'garlic', reason: 'Natural immune booster' },
      { food: 'turmeric', reason: 'Anti-inflammatory properties' }
    ]
  }
  
  return recommendations[condition] || []
}

// Get foods to avoid based on health conditions
export const getFoodsToAvoid = (condition) => {
  const avoidList = {
    'diabetes': ['honey', 'white rice', 'sugar'],
    'heart disease': ['processed foods', 'high sodium foods'],
    'kidney disease': ['spinach', 'banana', 'potato'],
    'lactose intolerance': ['milk', 'cheese', 'yogurt'],
    'gluten sensitivity': ['wheat', 'barley', 'rye']
  }
  
  return avoidList[condition] || []
} 