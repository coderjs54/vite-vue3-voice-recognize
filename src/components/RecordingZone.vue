<script setup lang="ts">
import { computed } from 'vue'
import type { RecordingState, StatusColor, ErrorInfo } from '@/types'
import { formatDuration } from '@/utils'

const props = defineProps<{
  state: RecordingState
  duration: number
  error: ErrorInfo | null
  audioLevels: number[]
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const statusText = computed(() => {
  switch (props.state) {
    case 'idle':
      return '点击麦克风开始录音'
    case 'recording':
      return '正在录音...'
    case 'processing':
      return '正在识别...'
    case 'completed':
      return '录音完成'
    case 'error':
      return props.error?.message || '发生错误'
    default:
      return '点击麦克风开始录音'
  }
})

const statusColor = computed<StatusColor>(() => {
  switch (props.state) {
    case 'idle':
      return 'blue'
    case 'recording':
      return 'red'
    case 'processing':
      return 'orange'
    case 'completed':
      return 'green'
    case 'error':
      return 'orange'
    default:
      return 'blue'
  }
})

const statusDotClass = computed(() => {
  const base = 'recording-zone__status-dot'
  switch (statusColor.value) {
    case 'blue':
      return `${base} ${base}--blue`
    case 'red':
      return `${base} ${base}--red`
    case 'green':
      return `${base} ${base}--green`
    case 'orange':
      return `${base} ${base}--orange`
    default:
      return `${base} ${base}--blue`
  }
})

const isRecording = computed(() => props.state === 'recording')

const formattedDuration = computed(() => formatDuration(props.duration))

function getBarHeight(level: number): string {
  const normalized = Math.min(level / 255, 1)
  return `${10 + normalized * 90}%`
}
</script>

<template>
  <div class="recording-zone">
    <div class="recording-zone__mic-container">
      <div
        v-if="isRecording"
        class="recording-zone__wave-ring recording-zone__wave-ring--1"
      />
      <div
        v-if="isRecording"
        class="recording-zone__wave-ring recording-zone__wave-ring--2"
      />
      <div
        v-if="isRecording"
        class="recording-zone__wave-ring recording-zone__wave-ring--3"
      />
      
      <div
        v-if="isRecording"
        class="recording-zone__mic-outer-shadow"
      />
      
      <button
        @click="emit('toggle')"
        :class="[
          'recording-zone__mic-button',
          isRecording ? 'recording-zone__mic-button--recording' : ''
        ]"
        :aria-label="isRecording ? '停止录音' : '开始录音'"
      >
        <svg
          v-if="!isRecording"
          viewBox="0 0 48 48"
          fill="none"
        >
          <rect x="19" y="6" width="10" height="22" rx="5" stroke="white" stroke-width="3"/>
          <path d="M14 24C14 29.5228 18.4772 34 24 34C29.5228 34 34 29.5228 34 24" stroke="white" stroke-width="3" stroke-linecap="round"/>
          <line x1="24" y1="34" x2="24" y2="42" stroke="white" stroke-width="3" stroke-linecap="round"/>
          <line x1="18" y1="42" x2="30" y2="42" stroke="white" stroke-width="3" stroke-linecap="round"/>
        </svg>
        
        <svg
          v-else
          viewBox="0 0 48 48"
          fill="none"
        >
          <rect x="16" y="14" width="8" height="20" rx="2" fill="white"/>
          <rect x="24" y="14" width="8" height="20" rx="2" fill="white"/>
        </svg>
      </button>
      
      <div
        v-if="isRecording"
        class="recording-zone__audio-levels"
      >
        <div
          v-for="(level, index) in audioLevels"
          :key="index"
          class="recording-zone__audio-bar"
          :style="{ height: getBarHeight(level) }"
        />
      </div>
    </div>
    
    <p class="recording-zone__status-text">{{ statusText }}</p>
    
    <div class="recording-zone__duration-container">
      <span class="recording-zone__duration">{{ formattedDuration }}</span>
      <span :class="statusDotClass" />
    </div>
    
    <p class="recording-zone__description">支持中文普通话识别 · 离线可用 · 实时转换</p>
  </div>
</template>
