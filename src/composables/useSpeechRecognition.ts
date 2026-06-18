import { ref, computed, onUnmounted } from 'vue'
import type { RecognitionResult, ErrorInfo, SpeechRecognitionOptions } from '@/types'
import { getSpeechRecognition, isSpeechRecognitionSupported } from '@/utils'

interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onend: (() => void) | null
  onresult: ((event: { resultIndex: number; results: unknown[] }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  start(): void
  stop(): void
  abort(): void
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  const {
    lang = 'zh-CN',
    continuous = true,
    interimResults = true,
    maxAlternatives = 1,
  } = options

  const isSupported = ref(isSpeechRecognitionSupported())
  const isListening = ref(false)
  const finalTranscript = ref('')
  const interimTranscript = ref('')
  const results = ref<RecognitionResult[]>([])
  const error = ref<ErrorInfo | null>(null)

  let recognition: SpeechRecognitionInstance | null = null
  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let dataArray: Uint8Array | null = null
  let animationId: number | null = null

  const fullTranscript = computed(() => {
    if (interimTranscript.value) {
      return finalTranscript.value + interimTranscript.value
    }
    return finalTranscript.value
  })

  const audioLevels = ref<number[]>(new Array(60).fill(0))

  function initRecognition() {
    if (!isSupported.value) {
      error.value = {
        code: 'NOT_SUPPORTED',
        message: '您的浏览器不支持语音识别功能',
        suggestion: '请使用 Chrome、Edge 或 Safari 浏览器',
      }
      return false
    }

    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) return false

    recognition = new SpeechRecognition() as SpeechRecognitionInstance
    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.maxAlternatives = maxAlternatives

    recognition.onstart = () => {
      isListening.value = true
      error.value = null
      startAudioAnalysis()
    }

    recognition.onend = () => {
      isListening.value = false
      stopAudioAnalysis()
      if (recognition && isListening.value) {
        try {
          recognition.start()
        } catch {
          // ignore
        }
      }
    }

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''

      const resultsArray = event.results as Array<{ isFinal: boolean; [index: number]: { transcript: string } }>

      for (let i = event.resultIndex; i < resultsArray.length; i++) {
        const transcript = resultsArray[i][0].transcript
        if (resultsArray[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }

      if (final) {
        finalTranscript.value += final
        results.value.push({
          final: true,
          transcript: final,
          timestamp: Date.now(),
        })
      }
      interimTranscript.value = interim
    }

    recognition.onerror = (event) => {
      const errorMap: Record<string, ErrorInfo> = {
        'not-allowed': {
          code: 'PERMISSION_DENIED',
          message: '麦克风权限被拒绝',
          suggestion: '请在浏览器设置中允许麦克风权限',
        },
        'no-speech': {
          code: 'NO_SPEECH',
          message: '未检测到语音输入',
          suggestion: '请靠近麦克风并清晰说话',
        },
        'aborted': {
          code: 'ABORTED',
          message: '语音识别被中断',
          suggestion: '请重新点击开始按钮',
        },
        'network': {
          code: 'NETWORK_ERROR',
          message: '网络错误',
          suggestion: '请检查网络连接，部分语音识别服务需要联网',
        },
        'not-supported': {
          code: 'NOT_SUPPORTED',
          message: '浏览器不支持语音识别',
          suggestion: '请使用最新版本的 Chrome 或 Edge 浏览器',
        },
      }

      error.value = errorMap[event.error] || {
        code: 'UNKNOWN',
        message: `识别错误: ${event.error}`,
        suggestion: '请重试',
      }

      isListening.value = false
      stopAudioAnalysis()
    }

    return true
  }

  function startAudioAnalysis() {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 128
      const bufferLength = analyser.frequencyBinCount
      dataArray = new Uint8Array(bufferLength)

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const source = audioContext?.createMediaStreamSource(stream)
        if (source && analyser) {
          source.connect(analyser)
          updateAudioLevels()
        }
      }).catch(() => {
        // ignore - permission already handled
      })
    } catch {
      // ignore
    }
  }

  function updateAudioLevels() {
    if (!analyser || !dataArray || !isListening.value) return

    analyser.getByteFrequencyData(dataArray as unknown as Uint8Array<ArrayBuffer>)

    const levels: number[] = []
    const step = Math.floor(dataArray.length / 60)

    for (let i = 0; i < 60; i++) {
      let sum = 0
      const start = i * step
      const end = Math.min(start + step, dataArray.length)
      for (let j = start; j < end; j++) {
        sum += dataArray[j]
      }
      levels.push(sum / (end - start))
    }

    audioLevels.value = levels
    animationId = requestAnimationFrame(updateAudioLevels)
  }

  function stopAudioAnalysis() {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
    analyser = null
    dataArray = null
    audioLevels.value = new Array(60).fill(0)
  }

  async function start() {
    error.value = null

    if (!recognition && !initRecognition()) {
      return false
    }

    try {
      if (recognition) {
        await recognition.start()
        return true
      }
    } catch {
      error.value = {
        code: 'START_FAILED',
        message: '无法启动语音识别',
        suggestion: '请检查麦克风是否被其他应用占用',
      }
    }

    return false
  }

  function stop() {
    if (recognition) {
      recognition.stop()
    }
    isListening.value = false
    stopAudioAnalysis()
  }

  function reset() {
    stop()
    finalTranscript.value = ''
    interimTranscript.value = ''
    results.value = []
    error.value = null
  }

  onUnmounted(() => {
    stop()
    if (recognition) {
      recognition.abort()
      recognition = null
    }
  })

  return {
    isSupported,
    isListening,
    finalTranscript,
    interimTranscript,
    fullTranscript,
    results,
    error,
    audioLevels,
    start,
    stop,
    reset,
  }
}
