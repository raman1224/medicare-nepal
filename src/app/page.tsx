'use client'

import { useAuth } from '@/context/AuthContext'
import { redirect } from 'next/navigation'

export default function Home() {
  const { currentUser } = useAuth()
  
  // Redirect based on auth state
  if (currentUser) {
    redirect('/dashboard')
  } else {
    redirect('/auth')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Medicare Nepal</h1>
        <p>Loading application...</p>
      </div>
    </div>
  )
}