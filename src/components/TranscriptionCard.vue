<script setup lang="ts">
import { ref } from 'vue'
import { Copy, Trash2, Check } from '@lucide/vue'
import { copyToClipboard } from '@/utils'

const props = defineProps<{
  transcript: string
  isProcessing: boolean
}>()

const emit = defineEmits<{
  (e: 'clear'): void
}>()

const copied = ref(false)

async function handleCopy() {
  if (!props.transcript) return
  
  const success = await copyToClipboard(props.transcript)
  if (success) {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

function handleClear() {
  if (props.transcript && !props.isProcessing) {
    emit('clear')
  }
}
</script>

<template>
  <div class="transcription-card">
    <h2 class="transcription-card__header">识别结果</h2>
    
    <div class="transcription-card__content">
      <div
        v-if="isProcessing && !transcript"
        class="transcription-card__loading"
      >
        <div class="transcription-card__loading-dots">
          <div class="transcription-card__loading-dot" />
          <div class="transcription-card__loading-dot" />
          <div class="transcription-card__loading-dot" />
        </div>
        <span class="transcription-card__loading-text">正在识别...</span>
      </div>
      
      <p
        v-else-if="!transcript"
        class="transcription-card__placeholder"
      >
        点击麦克风开始录音后，识别结果将在此处实时显示...
      </p>
      
      <p
        v-else
        class="transcription-card__text"
      >
        {{ transcript }}
      </p>
    </div>
    
    <div class="transcription-card__actions">
      <button
        @click="handleCopy"
        :disabled="!transcript || isProcessing"
        class="transcription-card__button transcription-card__button--copy"
        :aria-label="copied ? '已复制' : '复制文本'"
      >
        <Check v-if="copied" :size="16" />
        <Copy v-else :size="16" />
        <span>{{ copied ? '已复制' : '复制' }}</span>
      </button>
      
      <button
        @click="handleClear"
        :disabled="!transcript || isProcessing"
        class="transcription-card__button transcription-card__button--clear"
        aria-label="清空文本"
      >
        <Trash2 :size="16" />
        <span>清空</span>
      </button>
    </div>
  </div>
</template>
