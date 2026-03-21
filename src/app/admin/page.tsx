'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PinInput from '@/components/ui/PinInput'
import Header from '@/components/ui/Header'
import OrderManager from '@/components/admin/OrderManager'
import PaymentEditor from '@/components/admin/PaymentEditor'
import PrepaidManager from '@/components/admin/PrepaidManager'
import { cn } from '@/lib/utils'

const TABS = ['주문관리', '결제수정', '선불관리', '설정'] as const

export default function AdminPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [tab, setTab] = useState<typeof TABS[number]>('주문관리')
  const [qrEnabled, setQrEnabled] = useState(true)
  const [savingQr, setSavingQr] = useState(false)

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

  // QR 설정 불러오기
  useEffect(() => {
    if (!authenticated) return
    const fetchSettings = async () => {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setQrEnabled(data.qr_enabled !== false)
      }
    }
    fetchSettings()
  }, [authenticated])

  const toggleQr = async () => {
    setSavingQr(true)
    const newVal = !qrEnabled
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qr_enabled: newVal }),
    })
    if (res.ok) setQrEnabled(newVal)
    setSavingQr(false)
  }

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
        {tab === '설정' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-rodem-text">시스템 설정</h3>

            {/* QR 기능 토글 */}
            <div className="p-4 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-base text-rodem-text">QR 코드 기능</div>
                  <div className="text-sm text-rodem-text-sub mt-1">
                    비활성화 시 /my/ 개인 페이지 접근이 차단됩니다
                  </div>
                </div>
                <button
                  onClick={toggleQr}
                  disabled={savingQr}
                  className={cn(
                    'w-14 h-7 rounded-full relative cursor-pointer border-none flex-shrink-0 transition-colors',
                    qrEnabled ? 'bg-rodem-gold' : 'bg-rodem-border'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200',
                    qrEnabled ? 'left-[30px]' : 'left-0.5'
                  )} />
                </button>
              </div>
              <div className={cn(
                'mt-3 text-sm font-semibold px-3 py-1.5 rounded-lg inline-block',
                qrEnabled ? 'bg-rodem-green/10 text-rodem-green' : 'bg-rodem-red/10 text-rodem-red'
              )}>
                {qrEnabled ? '활성화됨' : '비활성화됨'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
