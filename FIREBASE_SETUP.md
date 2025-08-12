# Firebase Setup Guide for Medicare Nepal

## 🔧 Firebase Project Configuration

### 1. Enable Authentication Methods

Go to your Firebase Console (https://console.firebase.google.com) and:

1. **Select your project**: `medicare-nepal-f7ae8`
2. **Go to Authentication** → **Sign-in method**
3. **Enable these providers**:
   - ✅ **Email/Password**
   - ✅ **Google**
   - ✅ **GitHub**

### 2. Configure Google Sign-In

1. In **Authentication** → **Sign-in method** → **Google**
2. Click **Enable**
3. Add your **Project support email**
4. Save

### 3. Configure GitHub Sign-In

1. In **Authentication** → **Sign-in method** → **GitHub**
2. Click **Enable**
3. You'll need to create a GitHub OAuth app:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth app
   - Authorization callback URL: `https://medicare-nepal-f7ae8.firebaseapp.com/__/auth/handler`
4. Copy the Client ID and Client Secret to Firebase

### 4. Add Authorized Domains

In **Authentication** → **Settings** → **Authorized domains**, add:
- `localhost` (for development)
- `medicare-nepal-f7ae8.firebaseapp.com`
- Your custom domain (if any)

### 5. Check Your Current Configuration

Your current Firebase config in `src/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD1gujlwa4WRlstCed_lNumRjVhz8Jx3ds",
  authDomain: "medicare-nepal-f7ae8.firebaseapp.com",
  projectId: "medicare-nepal-f7ae8",
  storageBucket: "medicare-nepal-f7ae8.firebasestorage.app",
  messagingSenderId: "838253820868",
  appId: "1:838253820868:web:841107c781299728bc8291",
  measurementId: "G-WBFRS9J5L4"
};
```

## 🚨 Common Issues & Solutions

### Issue: "auth/invalid-credential"
**Solution**: 
1. Check if Email/Password authentication is enabled
2. Verify the user exists in Firebase Auth
3. Check if the password is correct

### Issue: "auth/operation-not-allowed"
**Solution**:
1. Enable the specific authentication method in Firebase Console
2. For Google: Enable Google Sign-in provider
3. For GitHub: Enable GitHub Sign-in provider

### Issue: "auth/popup-blocked"
**Solution**:
1. Allow popups for your domain
2. Check browser settings
3. Try using redirect method instead

## 🔍 Debug Steps

1. **Check Browser Console** for detailed error messages
2. **Verify Firebase Config** matches your project
3. **Test Authentication Methods** one by one
4. **Check Network Tab** for failed requests

## 📝 Quick Test

Add this to your browser console to test Firebase:
```javascript
import { auth } from './src/firebase'
import { signInAnonymously } from 'firebase/auth'

// Test anonymous sign-in
signInAnonymously(auth)
  .then(result => console.log('Firebase working:', result.user.uid))
  .catch(error => console.error('Firebase error:', error))
```

## 🆘 Still Having Issues?

1. **Check Firebase Console** for any error messages
2. **Verify API Key** is correct
3. **Test with a simple email/password** first
4. **Check if your Firebase project is on the correct plan** (Spark plan should work for basic auth)

## 📞 Support

If issues persist:
1. Check Firebase Console logs
2. Verify all authentication methods are enabled
3. Test with a fresh Firebase project
4. Contact Firebase support if needed 