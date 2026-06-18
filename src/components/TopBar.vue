<script setup lang="ts">
import { Sun, Moon } from '@lucide/vue'

defineProps<{
  currentTheme: 'light' | 'dark'
}>()

const emit = defineEmits<{
  (e: 'toggle-theme'): void
}>()
</script>

<template>
  <header class="top-bar">
    <div class="top-bar__logo">
      <svg class="top-bar__logo-icon" viewBox="0 0 24 24" fill="none">
        <rect x="9" y="2" width="6" height="14" rx="3" fill="#DC2626"/>
        <path d="M5 18C5 20.7614 7.23858 23 10 23H14C16.7614 23 19 20.7614 19 18" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
        <line x1="12" y1="23" x2="12" y2="27" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
        <line x1="7" y1="27" x2="17" y2="27" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span class="top-bar__logo-text">VoiceMemo</span>
    </div>
    
    <button
      id="theme-toggle"
      class="top-bar__theme-toggle"
      :aria-label="currentTheme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'"
      :aria-pressed="currentTheme === 'dark'"
      @click="emit('toggle-theme')"
    >
      <Sun v-if="currentTheme === 'dark'" />
      <Moon v-else />
    </button>
  </header>
</template>
