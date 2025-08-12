import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { logger } from './logger.js'

let firebaseApp

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  try {
    // For development, we'll use a service account if available
    // In production, you should use environment variables for the service account
    firebaseApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'medicare-nepal',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
    logger.info('Firebase Admin initialized successfully')
  } catch (error) {
    logger.warn('Firebase Admin initialization failed, using default app')
    firebaseApp = initializeApp()
  }
} else {
  firebaseApp = getApps()[0]
}

export const auth = getAuth(firebaseApp)
export default firebaseApp 