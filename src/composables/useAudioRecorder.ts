import { ref, onUnmounted } from 'vue'
import type { AudioChunk, ErrorInfo, AudioRecorderOptions } from '@/types'
import { isMediaRecorderSupported } from '@/utils'

export function useAudioRecorder(options: AudioRecorderOptions = {}) {
  const { mimeType = 'audio/webm' } = options

  const isSupported = ref(isMediaRecorderSupported())
  const isRecording = ref(false)
  const duration = ref(0)
  const chunks = ref<AudioChunk[]>([])
  const error = ref<ErrorInfo | null>(null)
  const audioUrl = ref<string | null>(null)

  let mediaRecorder: MediaRecorder | null = null
  let stream: MediaStream | null = null
  let timer: ReturnType<typeof setInterval> | null = null

  function getSupportedMimeType(): string | null {
    const types = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav']
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return null
  }

  async function start() {
    error.value = null

    if (!isSupported.value) {
      error.value = {
        code: 'NOT_SUPPORTED',
        message: '您的浏览器不支持录音功能',
        suggestion: '请使用现代浏览器',
      }
      return false
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      const supportedMimeType = getSupportedMimeType()
      if (!supportedMimeType) {
        error.value = {
          code: 'NO_MIME_TYPE',
          message: '无法找到支持的音频格式',
          suggestion: '请使用 Chrome 或 Firefox 浏览器',
        }
        stream.getTracks().forEach(track => track.stop())
        return false
      }

      mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMimeType })

      chunks.value = []
      duration.value = 0

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.value.push({
            data: event.data,
            timestamp: Date.now(),
          })
        }
      }

      mediaRecorder.onstop = () => {
        isRecording.value = false
        if (timer) {
          clearInterval(timer)
          timer = null
        }
        if (chunks.value.length > 0) {
          const blob = new Blob(chunks.value.map(c => c.data), { type: supportedMimeType })
          audioUrl.value = URL.createObjectURL(blob)
        }
      }

      mediaRecorder.onerror = (event) => {
        error.value = {
          code: 'RECORDING_ERROR',
          message: `录音错误: ${event.error?.name || '未知错误'}`,
          suggestion: '请检查麦克风设备',
        }
        isRecording.value = false
        if (timer) {
          clearInterval(timer)
          timer = null
        }
      }

      mediaRecorder.start(100)
      isRecording.value = true

      timer = setInterval(() => {
        duration.value += 0.1
      }, 100)

      return true
    } catch (e) {
      const err = e as { name?: string; message?: string }
      
      if (err.name === 'NotAllowedError') {
        error.value = {
          code: 'PERMISSION_DENIED',
          message: '麦克风权限被拒绝',
          suggestion: '请在浏览器设置中允许麦克风权限',
        }
      } else if (err.name === 'NotFoundError') {
        error.value = {
          code: 'DEVICE_NOT_FOUND',
          message: '未找到麦克风设备',
          suggestion: '请连接麦克风设备',
        }
      } else if (err.name === 'NotReadableError') {
        error.value = {
          code: 'DEVICE_BUSY',
          message: '麦克风设备被占用',
          suggestion: '请关闭其他使用麦克风的应用',
        }
      } else {
        error.value = {
          code: 'INIT_FAILED',
          message: err.message || '录音初始化失败',
          suggestion: '请重试',
        }
      }

      return false
    }
  }

  function stop() {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
    }
    isRecording.value = false
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function reset() {
    stop()
    chunks.value = []
    duration.value = 0
    error.value = null
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
      audioUrl.value = null
    }
  }

  function getBlob(): Blob | null {
    if (chunks.value.length === 0) return null
    const supportedMimeType = getSupportedMimeType() || mimeType
    return new Blob(chunks.value.map(c => c.data), { type: supportedMimeType })
  }

  onUnmounted(() => {
    stop()
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      stream = null
    }
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
    }
  })

  return {
    isSupported,
    isRecording,
    duration,
    chunks,
    error,
    audioUrl,
    start,
    stop,
    reset,
    getBlob,
  }
}
