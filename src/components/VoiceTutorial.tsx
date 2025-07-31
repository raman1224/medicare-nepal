"use client"

import type React from "react"
import { X } from "lucide-react"

interface VoiceTutorialProps {
  isOpen: boolean
  onClose: () => void
}

const VoiceTutorial: React.FC<VoiceTutorialProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass p-8 rounded-2xl max-w-md w-full border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold neon-text">Voice Tutorial</h2>
          <button onClick={onClose} className="p-2 rounded-lg glass hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">How to Use Voice Input</h3>
            <p className="text-gray-300 text-sm">
              Click the microphone button next to any input field, then speak clearly. Your speech will be converted to
              text automatically.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Tips for Best Results</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Speak clearly and at normal pace</li>
              <li>• Minimize background noise</li>
              <li>• Use simple, clear language</li>
              <li>• You can edit the text after speaking</li>
            </ul>
          </div>
        </div>

        <button onClick={onClose} className="glow-button w-full mt-6">
          Got it!
        </button>
      </div>
    </div>
  )
}

export default VoiceTutorial
