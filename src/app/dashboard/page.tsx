'use client'

import { useAuth } from '@/context/AuthContext'

export default function Dashboard() {
  const { currentUser, userData, logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Medicare Nepal Dashboard</h1>
        
        {currentUser && userData ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{userData.name}</h2>
                <p className="text-gray-600">{userData.email}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">Account Information</h3>
              <div className="mt-2 space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Account Created:</span>
                  <span className="font-medium">
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium capitalize">{userData.role}</span>
                </p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading user data...</p>
          </div>
        )}
      </div>
    </div>
  )
}