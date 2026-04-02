'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import PinInput from '@/components/ui/PinInput'

const MENU_ITEMS = [
  { href: '/dashboard', icon: '📊', label: '정산 대시보드', desc: '매출 통계 · 엑셀 내보내기' },
  { href: '/members', icon: '👥', label: '성도 관리', desc: '성도 등록 · 잔액 관리' },
  { href: '/menu', icon: '🍽️', label: '메뉴 관리', desc: '메뉴 추가 · 가격 수정' },
  { href: '/settings', icon: '🔐', label: 'PIN 설정', desc: '봉사자 · 관리자 PIN 변경' },
]

export default function ManagePage() {
  const router = useRouter()
  const { adminAuthed, authenticateAdmin } = useAuth()
  const [pinError, setPinError] = useState(false)

  const handlePinComplete = async (pin: string) => {
    const success = await authenticateAdmin(pin)
    if (!success) setPinError(true)
  }

  if (!adminAuthed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] relative overflow-hidden font-sans">
        <div className="absolute top-[10%] left-[5%] w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.05)_0%,transparent_70%)]" />
        <div className="absolute bottom-[12%] right-[8%] w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(90,154,110,0.04)_0%,transparent_70%)]" />

        <button
          onClick={() => router.push('/')}
          className="absolute top-4 left-4 bg-gradient-to-br from-[#f0ece4] to-[#e8e3da] border-none text-base text-rodem-text-sub cursor-pointer py-2 px-3.5 rounded-[10px] z-10"
        >
          ← 뒤로
        </button>

        <div className="text-[42px] mb-4 relative z-10">🔐</div>
        <h2 className="text-[24px] font-bold mb-2 text-rodem-text relative z-10">관리자 인증</h2>
        <p className="text-base text-rodem-text-sub mb-8 relative z-10">관리자 PIN을 입력하세요</p>

        {pinError && (
          <p className="text-rodem-red text-base font-semibold mb-3 relative z-10">PIN이 틀렸습니다</p>
        )}

        <div className="relative z-10">
          <PinInput onComplete={handlePinComplete} error={pinError} onReset={() => setPinError(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] font-sans p-6">
      <button
        onClick={() => router.push('/')}
        className="bg-gradient-to-br from-[#f0ece4] to-[#e8e3da] border-none text-base text-rodem-text-sub cursor-pointer py-2 px-3.5 rounded-[10px] mb-6"
      >
        ← 홈으로
      </button>

      <div className="text-center mb-8">
        <h1 className="text-[28px] font-bold text-rodem-text mb-1">⚙️ 관리</h1>
        <p className="text-base text-rodem-text-sub">로뎀나무 카페 관리 메뉴</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-[500px] mx-auto">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="p-6 rounded-rodem border border-rodem-border-light bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec] text-rodem-text cursor-pointer flex flex-col items-center gap-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-[3px] transition-transform duration-300"
          >
            <span className="text-[36px]">{item.icon}</span>
            <span className="text-lg font-bold">{item.label}</span>
            <span className="text-sm text-rodem-text-sub text-center">{item.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
