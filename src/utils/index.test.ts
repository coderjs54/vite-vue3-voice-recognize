import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDuration, generateId, debounce, copyToClipboard, isSpeechRecognitionSupported } from './index'

describe('formatDuration', () => {
  it('should format 0 seconds correctly', () => {
    expect(formatDuration(0)).toBe('00:00')
  })

  it('should format 59 seconds correctly', () => {
    expect(formatDuration(59)).toBe('00:59')
  })

  it('should format 60 seconds correctly', () => {
    expect(formatDuration(60)).toBe('01:00')
  })

  it('should format 125 seconds correctly', () => {
    expect(formatDuration(125)).toBe('02:05')
  })

  it('should format 3600 seconds correctly', () => {
    expect(formatDuration(3600)).toBe('60:00')
  })
})

describe('generateId', () => {
  it('should generate a non-empty string', () => {
    const id = generateId()
    expect(id).toBeDefined()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('should generate unique IDs', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(100)
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should delay function execution', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should reset timer on multiple calls', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('copyToClipboard', () => {
  it('should return true when clipboard API is available', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    const originalClipboard = navigator.clipboard
    ;(navigator as unknown as { clipboard: { writeText: typeof mockWriteText } }).clipboard = { writeText: mockWriteText }

    const result = await copyToClipboard('test')
    expect(result).toBe(true)

    ;(navigator as unknown as { clipboard: typeof originalClipboard }).clipboard = originalClipboard
  })
})

describe('isSpeechRecognitionSupported', () => {
  it('should return true when SpeechRecognition is available', () => {
    const original = (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition
    ;(window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = class {}

    expect(isSpeechRecognitionSupported()).toBe(true)

    ;(window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = original
  })

  it('should return true when webkitSpeechRecognition is available', () => {
    const original = (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    ;(window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition = class {}

    expect(isSpeechRecognitionSupported()).toBe(true)

    ;(window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition = original
  })

  it('should return false when neither API is available', () => {
    const originalSpeech = (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition
    const originalWebkit = (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition

    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition

    expect(isSpeechRecognitionSupported()).toBe(false)

    ;(window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = originalSpeech
    ;(window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition = originalWebkit
  })
})
