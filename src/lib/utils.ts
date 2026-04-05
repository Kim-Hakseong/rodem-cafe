// Format price with Korean won
export const formatPrice = (n: number) => n.toLocaleString() + '원'

// Korean chosung (initial consonant) extraction
const CHOSUNG_MAP = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ',
  'ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
]

export function getChosung(char: string): string {
  const code = char.charCodeAt(0) - 0xAC00
  if (code < 0 || code > 11171) return char
  return CHOSUNG_MAP[Math.floor(code / 588)] || char
}

// Get chosung of first character
export function getFirstChosung(name: string): string {
  if (!name) return ''
  return getChosung(name[0])
}

// Get all chosungs from a name (e.g. "김학성" → "ㄱㅎㅅ")
export function getAllChosungs(name: string): string {
  if (!name) return ''
  return name.split('').map(getChosung).join('')
}

// Get current time string
export function getNowTime(): string {
  const d = new Date()
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Get today's date start (KST)
export function getTodayStart(): string {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const dateStr = kst.toISOString().split('T')[0]
  return `${dateStr}T00:00:00+09:00`
}

// CN utility for conditional classnames
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ── TTS 음성 안내 ─────────────────────────────────────────
// Samsung Browser 29 + Android 10 대응:
//   1) 음성 목록 지연 로딩 → getVoices + voiceschanged 처리
//   2) cancel() 직후 speak() 무음 → setTimeout 우회
//   3) 한국어 음성 명시 선택 → 영어 fallback 방지

let _koVoice: SpeechSynthesisVoice | null = null
let _voicesLoaded = false

function loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) {
    _koVoice = voices.find((v) => v.lang.startsWith('ko')) || null
    _voicesLoaded = true
  }
}

// 음성 목록 로딩 이벤트 (Samsung Browser는 비동기 로딩)
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices()
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
}

export function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const synth = window.speechSynthesis
  synth.cancel()
  setTimeout(() => {
    // 음성 목록이 아직 없으면 한 번 더 시도
    if (!_voicesLoaded) loadVoices()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ko-KR'
    u.rate = 0.95
    u.pitch = 1
    if (_koVoice) u.voice = _koVoice
    synth.speak(u)
  }, 50)
}

// 브라우저 음성 합성 잠금 해제 (첫 사용자 제스처에서 호출)
export function primeSpeech() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  // 음성 목록 로딩 트리거
  loadVoices()
  const u = new SpeechSynthesisUtterance('')
  u.volume = 0
  window.speechSynthesis.speak(u)
}
