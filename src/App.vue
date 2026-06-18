<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TopBar from '@/components/TopBar.vue'
import RecordingZone from '@/components/RecordingZone.vue'
import TranscriptionCard from '@/components/TranscriptionCard.vue'
import { useSpeechRecognition } from '@/composables/useSpeechRecognition'
import { useAudioRecorder } from '@/composables/useAudioRecorder'
import { useTheme } from '@/composables/useTheme'
import type { RecordingState } from '@/types'

const { currentTheme, toggleTheme } = useTheme()

const {
  isSupported: isRecognitionSupported,
  fullTranscript,
  error,
  audioLevels,
  start: startRecognition,
  stop: stopRecognition,
  reset: resetRecognition,
} = useSpeechRecognition({
  lang: 'zh-CN',
  continuous: true,
  interimResults: true,
})

const {
  isRecording,
  duration,
  start: startRecording,
  stop: stopRecording,
  reset: resetRecording,
} = useAudioRecorder()

const recordingState = ref<RecordingState>('idle')

const isProcessing = computed(() => recordingState.value === 'processing')

watch(isRecording, (recording) => {
  if (recording) {
    recordingState.value = 'recording'
  } else {
    if (recordingState.value === 'recording') {
      recordingState.value = 'completed'
    }
  }
})

watch(error, (err) => {
  if (err) {
    recordingState.value = 'error'
    stopRecording()
  }
})

async function handleToggle() {
  if (recordingState.value === 'recording') {
    stopRecording()
    stopRecognition()
    recordingState.value = 'completed'
  } else {
    resetRecording()
    resetRecognition()
    recordingState.value = 'idle'
    
    const recorderStarted = await startRecording()
    if (recorderStarted) {
      const recognitionStarted = await startRecognition()
      if (!recognitionStarted && isRecognitionSupported.value) {
        recordingState.value = 'error'
        stopRecording()
      }
    } else {
      recordingState.value = 'error'
    }
  }
}

function handleClear() {
  resetRecognition()
  resetRecording()
  recordingState.value = 'idle'
}
</script>

<template>
  <div class="app-container">
    <TopBar 
      :current-theme="currentTheme" 
      @toggle-theme="toggleTheme" 
    />
    
    <main class="app-main">
      <RecordingZone
        :state="recordingState"
        :duration="duration"
        :error="error"
        :audio-levels="audioLevels"
        @toggle="handleToggle"
      />
      
      <TranscriptionCard
        :transcript="fullTranscript"
        :is-processing="isProcessing"
        @clear="handleClear"
      />
      
      <div
        v-if="error"
        class="error-toast"
        role="alert"
        aria-live="polite"
      >
        <p>{{ error.message }}</p>
        <p>{{ error.suggestion }}</p>
      </div>
    </main>
  </div>
</template>
