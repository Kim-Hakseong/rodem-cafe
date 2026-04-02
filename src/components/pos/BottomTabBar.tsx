'use client'

import { cn } from '@/lib/utils'

export type PosTab = 'order' | 'summary' | 'credit' | 'admin'

const TABS: { key: PosTab; label: string; icon: string }[] = [
  { key: 'order', label: '주문', icon: '📋' },
  { key: 'summary', label: '정산', icon: '📊' },
  { key: 'credit', label: '미결제', icon: '💰' },
  { key: 'admin', label: '관리', icon: '⚙️' },
]

interface BottomTabBarProps {
  activeTab: PosTab
  onTabChange: (tab: PosTab) => void
  creditCount?: number
}

export default function BottomTabBar({ activeTab, onTabChange, creditCount }: BottomTabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-rodem-border-light safe-area-bottom">
      <div className="flex">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'flex-1 flex flex-col items-center py-2.5 border-none cursor-pointer transition-colors relative',
              activeTab === tab.key
                ? 'bg-rodem-gold-light text-rodem-gold'
                : 'bg-white text-rodem-text-sub'
            )}
          >
            <span className="text-[22px] leading-none">{tab.icon}</span>
            <span className={cn(
              'text-sm font-bold mt-0.5',
              activeTab === tab.key ? 'text-rodem-gold' : 'text-rodem-text-sub'
            )}>
              {tab.label}
            </span>
            {tab.key === 'credit' && creditCount && creditCount > 0 ? (
              <span className="absolute top-1 right-[calc(50%-18px)] bg-rodem-orange text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {creditCount > 99 ? '99+' : creditCount}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}
