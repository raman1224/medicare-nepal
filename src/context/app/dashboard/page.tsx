// app/dashboard/page.tsx
"use client"

import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { currentUser, userData, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {currentUser && userData && (
          <div className="mb-6">
            <div className="flex items-center mb-4">
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full mr-4"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              )}
              <div>
                <h2 className="text-xl font-semibold">{userData.name}</h2>
                <p className="text-gray-600">{userData.email}</p>
              </div>
            </div>
            
            <p className="mb-2">
              <span className="font-medium">Account Created:</span> 
              {new Date(userData.createdAt).toLocaleDateString()}
            </p>
            
            <button
              onClick={logout}
              className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 mt-4"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}