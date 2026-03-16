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
