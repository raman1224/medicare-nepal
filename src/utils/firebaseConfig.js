import { auth } from '../firebase'
import { signInAnonymously } from 'firebase/auth'

export const checkFirebaseConfig = async () => {
  try {
    // Try to sign in anonymously to test if Firebase is properly configured
    const result = await signInAnonymously(auth)
    console.log('Firebase configuration is working:', result.user.uid)
    
    // Sign out immediately
    await auth.signOut()
    return { success: true, message: 'Firebase is properly configured' }
  } catch (error) {
    console.error('Firebase configuration error:', error)
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    }
  }
}

export const getFirebaseAuthMethods = () => {
  const config = {
    emailPassword: true,
    google: true,
    github: true,
    anonymous: true
  }
  
  return config
} 