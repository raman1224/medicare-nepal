import { initializeApp } from "firebase/app"
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInAnonymously
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize providers
export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()

// Configure providers
googleProvider.setCustomParameters({ prompt: "select_account" })
githubProvider.setCustomParameters({ allow_signup: "true" })

// Utility function to check Firebase config
export const checkFirebaseConfig = async () => {
  try {
    const result = await signInAnonymously(auth)
    console.log('Firebase configuration is working:', result.user.uid)
    await auth.signOut()
    return { success: true, message: 'Firebase is properly configured' }
  } catch (error: any) {
    console.error('Firebase configuration error:', error)
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    }
  }
}