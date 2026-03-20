'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import PinInput from '@/components/ui/PinInput'
import Header from '@/components/ui/Header'
import OrderManager from '@/components/admin/OrderManager'
import PaymentEditor from '@/components/admin/PaymentEditor'
import PrepaidManager from '@/components/admin/PrepaidManager'
import { cn } from '@/lib/utils'

const TABS = ['주문관리', '결제수정', '선불관리'] as const

export default function AdminPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [tab, setTab] = useState<typeof TABS[number]>('주문관리')

  const handlePinComplete = useCallback(async (pin: string) => {
    try {
      const res = await fetch('/api/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, type: 'admin' }),
      })
      if (res.ok) {
        setAuthenticated(true)
        setPinError(false)
      } else {
        setPinError(true)
      }
    } catch {
      setPinError(true)
    }
  }, [])

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] font-sans relative overflow-hidden">
        <button
          onClick={() => router.push('/')}
          className="absolute top-4 left-4 bg-gradient-to-br from-[#f0ece4] to-[#e8e3da] border-none text-base text-rodem-text-sub cursor-pointer py-2 px-3.5 rounded-[10px] z-10"
        >
          ← 뒤로
        </button>
        <div className="text-[42px] mb-4">🔐</div>
        <h2 className="text-[24px] font-bold mb-2 text-rodem-text">관리자 인증</h2>
        <p className="text-base text-rodem-text-sub mb-8">관리자 PIN을 입력하세요</p>
        {pinError && <p className="text-rodem-red text-base font-semibold mb-3">PIN이 틀렸습니다</p>}
        <PinInput onComplete={handlePinComplete} error={pinError} onReset={() => setPinError(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rodem-bg font-sans">
      <Header title="🔐 관리자" onBack={() => router.push('/')} />

      {/* Tabs */}
      <div className="flex border-b border-rodem-border-light bg-white">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-3 text-base font-bold border-none cursor-pointer transition-colors',
              tab === t
                ? 'text-rodem-gold border-b-2 border-b-rodem-gold bg-rodem-gold-light'
                : 'text-rodem-text-sub bg-transparent'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {tab === '주문관리' && <OrderManager />}
        {tab === '결제수정' && <PaymentEditor />}
        {tab === '선불관리' && <PrepaidManager />}
      </div>
    </div>
  )
}
