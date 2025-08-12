// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"

import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1gujlwa4WRlstCed_lNumRjVhz8Jx3ds",
  authDomain: "medicare-nepal-f7ae8.firebaseapp.com",
  projectId: "medicare-nepal-f7ae8",
  storageBucket: "medicare-nepal-f7ae8.firebasestorage.app",
  messagingSenderId: "838253820868",
  appId: "1:838253820868:web:841107c781299728bc8291",
  measurementId: "G-WBFRS9J5L4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app)

// Initialize providers
export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()

// Configure providers
googleProvider.setCustomParameters({
  prompt: "select_account",
})

githubProvider.setCustomParameters({
  allow_signup: "true",
})

export default app




// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "YOUR_KEY_HERE",
//   authDomain: "medicare-nepal-f7ae8.firebaseapp.com",
//   projectId: "medicare-nepal-f7ae8",
//   storageBucket: "medicare-nepal-f7ae8.appspot.com",
//   messagingSenderId: "xxxxxxx",
//   appId: "1:xxxxxxx:web:xxxxxxx"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// export { auth };
