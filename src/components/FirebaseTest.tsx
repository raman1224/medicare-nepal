import React, { useState } from 'react'
import { auth } from '../firebase'
import { signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth'
import { toast } from 'react-toastify'

const FirebaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('')
  const [isTesting, setIsTesting] = useState(false)

  const testFirebaseConfig = async () => {
    setIsTesting(true)
    setTestResult('Testing Firebase configuration...')

    try {
      // Test anonymous sign-in
      const result = await signInAnonymously(auth)
      setTestResult(`✅ Firebase is working! User ID: ${result.user.uid}`)
      toast.success('Firebase configuration is working!')
      
      // Sign out immediately
      await auth.signOut()
    } catch (error: any) {
      setTestResult(`❌ Firebase Error: ${error.code} - ${error.message}`)
      toast.error(`Firebase Error: ${error.message}`)
    } finally {
      setIsTesting(false)
    }
  }

  const testEmailPassword = async () => {
    setIsTesting(true)
    setTestResult('Testing email/password authentication...')

    try {
      // Test with a dummy email/password
      await signInWithEmailAndPassword(auth, 'test@example.com', 'password123')
      setTestResult('✅ Email/Password auth is enabled')
      toast.success('Email/Password authentication is enabled!')
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setTestResult('✅ Email/Password auth is enabled (expected error for non-existent user)')
        toast.success('Email/Password authentication is enabled!')
      } else if (error.code === 'auth/operation-not-allowed') {
        setTestResult('❌ Email/Password auth is NOT enabled')
        toast.error('Email/Password authentication is not enabled!')
      } else {
        setTestResult(`❌ Email/Password Error: ${error.code} - ${error.message}`)
        toast.error(`Email/Password Error: ${error.message}`)
      }
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Firebase Authentication Test</h3>
      
      <div className="space-y-4">
        <button
          onClick={testFirebaseConfig}
          disabled={isTesting}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test Firebase Config'}
        </button>
        
        <button
          onClick={testEmailPassword}
          disabled={isTesting}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test Email/Password Auth'}
        </button>
        
        {testResult && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm">{testResult}</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Current Firebase Config:</p>
        <p>Project ID: medicare-nepal-f7ae8</p>
        <p>Auth Domain: medicare-nepal-f7ae8.firebaseapp.com</p>
      </div>
    </div>
  )
}

export default FirebaseTest 