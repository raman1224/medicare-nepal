import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaStop, 
  FaPlay,
  FaTrash,
  FaVolumeUp,
  FaVolumeMute
} from 'react-icons/fa'

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  language?: string
  placeholder?: string
  className?: string
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscript,
  language = 'en-US',
  placeholder = 'Click to start recording...',
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = language

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        const fullTranscript = finalTranscript + interimTranscript
        setTranscript(fullTranscript.trim())
        onTranscript(fullTranscript.trim())
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        toast.error('Speech recognition error. Please try again.')
        stopRecording()
      }

      recognitionRef.current.onend = () => {
        if (isRecording && !isPaused) {
          // Restart recognition if it was stopped unexpectedly
          recognitionRef.current?.start()
        }
      }
    } else {
      toast.error('Speech recognition is not supported in this browser')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [language, isRecording, isPaused, onTranscript])

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Start media recorder for audio recording
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }

      mediaRecorderRef.current.start()
      recognitionRef.current?.start()
      
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      toast.success('Recording started. Speak now...')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }

    recognitionRef.current?.stop()
    
    setIsRecording(false)
    setIsPaused(false)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    toast.success('Recording stopped')
  }

  const pauseRecording = () => {
    if (isRecording) {
      if (isPaused) {
        // Resume recording
        recognitionRef.current?.start()
        mediaRecorderRef.current?.resume()
        setIsPaused(false)
        toast.success('Recording resumed')
      } else {
        // Pause recording
        recognitionRef.current?.stop()
        mediaRecorderRef.current?.pause()
        setIsPaused(true)
        toast.info('Recording paused')
      }
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    onTranscript('')
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-4 rounded-full text-white font-semibold transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isRecording ? <FaStop className="w-6 h-6" /> : <FaMicrophone className="w-6 h-6" />}
        </motion.button>

        {isRecording && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={pauseRecording}
            className={`p-3 rounded-full text-white transition-all duration-300 ${
              isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {isPaused ? <FaPlay className="w-5 h-5" /> : <FaMicrophoneSlash className="w-5 h-5" />}
          </motion.button>
        )}

        {(transcript || audioUrl) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearTranscript}
            className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-all duration-300"
          >
            <FaTrash className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Recording Status */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-2 text-red-400">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            <span className="font-semibold">
              {isPaused ? 'PAUSED' : 'RECORDING'} - {formatTime(recordingTime)}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {isPaused ? 'Click play to resume' : 'Click pause to pause recording'}
          </p>
        </motion.div>
      )}

      {/* Audio Player */}
      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={playRecording}
            disabled={isPlaying}
            className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all duration-300 disabled:opacity-50"
          >
            {isPlaying ? <FaVolumeMute className="w-4 h-4" /> : <FaVolumeUp className="w-4 h-4" />}
          </motion.button>
          <span className="text-sm text-gray-400">Play recording</span>
        </motion.div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Transcript:</h4>
          <p className="text-gray-200 text-sm leading-relaxed">{transcript}</p>
        </motion.div>
      )}

      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Instructions */}
      {!isRecording && !transcript && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 text-sm"
        >
          <p>{placeholder}</p>
          <p className="mt-1 text-xs">Minimum 15 seconds recommended</p>
        </motion.div>
      )}
    </div>
  )
}

export default VoiceRecorder
