import { useRef, useState } from 'react'
import MicIcon from './icons/mic_icon'
import SoundWavesIcon from './icons/soundwave_icon'

export default function AudioInput () {
  const [recording, setRecording] = useState<boolean>(false)
  const [playing, setPlaying] = useState<boolean>(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      // Connect to WebSocket server
      //
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const port = 3001
      const host = window.location.host
      // The port has to be different from the standard one...
      const url = `${protocol}//${host.split(':')[0]}:${port}/api/audio`
      socketRef.current = new WebSocket(url)

      // Wait for WebSocket to open
      socketRef.current.onopen = () => {
        console.log('WebSocket connected')
      }

      // Get user's audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      mediaRecorderRef.current = mediaRecorder

      // Send audio chunks to server as soon as they're available
      mediaRecorder.ondataavailable = event => {
        if (
          event.data.size > 0 &&
          socketRef.current?.readyState === WebSocket.OPEN
        ) {
          socketRef.current.send(event.data)
        }
      }
      // Start recording
      mediaRecorder.start(100) // Send chunks every 100ms
      setRecording(true)
    } catch (err) {
      console.error('Error accessing microphone:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
    if (audioStream) {
      const tracks = audioStream.getTracks()
      tracks.forEach(track => track.stop())
      setAudioStream(null)
    }
    setRecording(false)
  }

  return (
    <button
      className={`text-xl ${recording ? 'text-red-700' : ''}`}
      onClick={recording ? stopRecording : startRecording}
    >
      {!playing && <MicIcon />}
      {playing && <SoundWavesIcon />}
    </button>
  )
}
