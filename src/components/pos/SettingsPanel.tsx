'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function SettingsPanel() {
  const [qrEnabled, setQrEnabled] = useState(true)
  const [savingQr, setSavingQr] = useState(false)
  const [openTime, setOpenTime] = useState('10:35')
  const [closeTime, setCloseTime] = useState('12:30')
  const [savingHours, setSavingHours] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setQrEnabled(data.qr_enabled !== false)
        setOpenTime(data.open_time || '10:35')
        setCloseTime(data.close_time || '12:30')
      }
    }
    fetchSettings()
  }, [])

  const saveOperatingHours = async () => {
    setSavingHours(true)
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ open_time: openTime, close_time: closeTime }),
    })
    setSavingHours(false)
  }

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

  return (
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

      {/* 마감시간 설정 */}
      <div className="p-4 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
        <div className="font-bold text-base text-rodem-text mb-1">🕐 마감시간 설정</div>
        <div className="text-sm text-rodem-text-sub mb-3">
          설정 시간 동안 고객 주문 페이지가 마감됩니다
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <label className="text-sm text-rodem-text-sub block mb-1">시작</label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="w-full p-2 rounded-lg border border-rodem-border-light text-base text-rodem-text"
            />
          </div>
          <span className="text-lg text-rodem-text-sub mt-5">~</span>
          <div className="flex-1">
            <label className="text-sm text-rodem-text-sub block mb-1">종료</label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="w-full p-2 rounded-lg border border-rodem-border-light text-base text-rodem-text"
            />
          </div>
        </div>
        <button
          onClick={saveOperatingHours}
          disabled={savingHours}
          className="px-4 py-2 rounded-[10px] bg-rodem-gold text-white font-bold text-sm cursor-pointer border-none disabled:opacity-50"
        >
          {savingHours ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
