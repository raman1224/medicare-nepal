"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Mic, MicOff, Play } from "lucide-react"
import { toast } from "react-toastify"

interface VoiceRecognitionProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  isTextArea?: boolean
  language?: string
}

const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
  value,
  onChange,
  placeholder = "Type or speak...",
  label = "Input",
  isTextArea = false,
  language = "en-US",
}) => {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if speech recognition is supported
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setIsSupported(true)
    }
  }, [])

  const startListening = () => {
    if (!isSupported) {
      toast.error("Speech recognition not supported in this browser")
      return
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = language

      recognition.onstart = () => {
        setIsListening(true)
        toast.success("🎤 Listening... Speak now")
      }

      // recognition.onresult = (event: any) => {
      //   const transcript = event.results[0][0].transcript
      //   onChange(value + (value ? ", " : "") + transcript)
      //   toast.success("Voice input captured!")
      // }
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        onChange(value + (value ? ", " : "") + transcript)
        toast.success("Voice input captured!")
      }

recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
        toast.error("Voice recognition error. Please try again.")
      }
      // recognition.onerror = (event: any) => {
      //   console.error("Speech recognition error:", event.error)
      //   setIsListening(false)
      //   toast.error("Voice recognition error. Please try again.")
      // }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (error) {
      console.error("Speech recognition error:", error)
      toast.error("Voice recognition not available")
    }
  }

  const speakText = () => {
    if ("speechSynthesis" in window && value) {
      const utterance = new SpeechSynthesisUtterance(value)
      utterance.lang = language
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
      toast.success("🔊 Playing text")
    } else {
      toast.error("Text-to-speech not available")
    }
  }

  const InputComponent = isTextArea ? "textarea" : "input"

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-300">{label}</label>
      <div className="relative">
        <InputComponent
          type={isTextArea ? undefined : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`glow-input w-full pr-20 ${isTextArea ? "h-32 resize-none" : ""}`}
          rows={isTextArea ? 4 : undefined}
        />

        <div className="absolute right-2 top-2 flex space-x-1">
          {isSupported && (
            <button
              type="button"
              onClick={startListening}
              disabled={isListening}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isListening
                  ? "bg-red-400/20 text-red-400 animate-pulse"
                  : "bg-blue-400/20 text-blue-400 hover:bg-blue-400/30"
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {value && (
            <button
              type="button"
              onClick={speakText}
              className="p-2 rounded-lg bg-green-400/20 text-green-400 hover:bg-green-400/30 transition-all duration-300"
              title="Play Text"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VoiceRecognition
