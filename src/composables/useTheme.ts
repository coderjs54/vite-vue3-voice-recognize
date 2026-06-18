import { ref, onMounted } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'voice-memo-theme'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

function getStoredTheme(): Theme | null {
  if (typeof localStorage === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return null
}

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark')
    html.classList.add('dark')
  } else {
    html.removeAttribute('data-theme')
    html.classList.remove('dark')
  }
}

function saveTheme(theme: Theme): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, theme)
  }
}

export function useTheme() {
  const currentTheme = ref<Theme>('light')

  function initTheme(): void {
    const stored = getStoredTheme()
    const system = getSystemTheme()
    const theme = stored ?? system
    currentTheme.value = theme
    applyTheme(theme)
  }

  function toggleTheme(): void {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
    applyTheme(currentTheme.value)
    saveTheme(currentTheme.value)
  }

  function setTheme(theme: Theme): void {
    currentTheme.value = theme
    applyTheme(theme)
    saveTheme(theme)
  }

  onMounted(() => {
    initTheme()
  })

  return {
    currentTheme,
    toggleTheme,
    setTheme,
    isDark: () => currentTheme.value === 'dark',
    isLight: () => currentTheme.value === 'light',
  }
}
