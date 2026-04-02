'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import InlinePinInput from '@/components/ui/InlinePinInput'
import OrderManager from '@/components/admin/OrderManager'
import PaymentEditor from '@/components/admin/PaymentEditor'
import PrepaidManager from '@/components/admin/PrepaidManager'
import SettingsPanel from './SettingsPanel'
import { cn } from '@/lib/utils'

const SUB_TABS = ['주문관리', '결제수정', '선불관리', '설정'] as const

export default function AdminPanel() {
  const { adminAuthed, authenticateAdmin } = useAuth()
  const [subTab, setSubTab] = useState<typeof SUB_TABS[number]>('주문관리')

  if (!adminAuthed) {
    return (
      <InlinePinInput
        title="관리자 인증"
        subtitle="관리자 PIN을 입력하세요"
        onComplete={authenticateAdmin}
      />
    )
  }

  return (
    <div>
      {/* 서브탭 */}
      <div className="flex gap-1 p-4 pb-0">
        {SUB_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={cn(
              'flex-1 py-2.5 text-sm font-bold rounded-rodem-sm border-none cursor-pointer transition-colors',
              subTab === t
                ? 'bg-rodem-gold text-white'
                : 'bg-rodem-card text-rodem-text-sub'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 서브탭 콘텐츠 */}
      <div className="p-4">
        {subTab === '주문관리' && <OrderManager />}
        {subTab === '결제수정' && <PaymentEditor />}
        {subTab === '선불관리' && <PrepaidManager />}
        {subTab === '설정' && <SettingsPanel />}
      </div>
    </div>
  )
}
