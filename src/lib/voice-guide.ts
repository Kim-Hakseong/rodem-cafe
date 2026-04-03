import { speak } from './utils'

// ── 음성 안내 기능 ──────────────────────────────────────────
// 비활성화: 아래 값을 false로 변경
// 완전 삭제: 이 파일 삭제 + grep -r "guide(" src/components/pos/ 호출부 제거
const VOICE_ENABLED = true

export function guide(text: string) {
  if (!VOICE_ENABLED) return
  speak(text)
}
