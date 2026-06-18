export type RecordingState = 'idle' | 'recording' | 'processing' | 'completed' | 'error'

export type StatusColor = 'blue' | 'red' | 'green' | 'orange'

export interface RecognitionResult {
  final: boolean
  transcript: string
  timestamp: number
}

export interface AudioChunk {
  data: Blob
  timestamp: number
}

export interface ErrorInfo {
  code: string
  message: string
  suggestion: string
}

export interface SpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
}

export interface AudioRecorderOptions {
  mimeType?: string
  sampleRate?: number
  bitRate?: number
}
