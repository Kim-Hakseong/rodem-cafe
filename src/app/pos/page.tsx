'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import PinInput from '@/components/ui/PinInput'
import Header from '@/components/ui/Header'
import StepIndicator from '@/components/ui/StepIndicator'
import Toast from '@/components/ui/Toast'
import MemberSelect from '@/components/pos/MemberSelect'
import MenuSelect from '@/components/pos/MenuSelect'
import PaymentSelect from '@/components/pos/PaymentSelect'
import OrderConfirm from '@/components/pos/OrderConfirm'
import OrderQueue from '@/components/pos/OrderQueue'
import BottomTabBar, { type PosTab } from '@/components/pos/BottomTabBar'
import TodaySummaryInline from '@/components/pos/TodaySummaryInline'
import CreditManagerInline from '@/components/pos/CreditManagerInline'
import AdminPanel from '@/components/pos/AdminPanel'
import { useAuth } from '@/lib/auth-context'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  temp_type?: string | null
  options?: { shot?: string }
}

export type SelectedMember = {
  id: string
  name: string
  credit_balance: number
  prepaid_balance: number
}

export type PaymentInfo = {
  method: string
  amount: number
}[]

const STEPS = ['메뉴 선택', '성도 선택', '결제', '확인']

export default function POSPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-rodem-bg font-sans text-rodem-text-sub">로딩 중...</div>}>
      <POSPageInner />
    </Suspense>
  )
}

function POSPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') === 'customer' ? 'customer' : 'staff' as 'staff' | 'customer'
  const isCustomer = mode === 'customer'

  const { staffAuthed, authenticateStaff, logout } = useAuth()
  const authenticated = isCustomer || staffAuthed

  const [isClosed, setIsClosed] = useState(false)
  const [operatingHours, setOperatingHours] = useState({ open: '10:35', close: '12:30' })
  const [activeTab, setActiveTab] = useState<PosTab>('order')
  const [step, setStep] = useState(0)
  const [selectedMember, setSelectedMember] = useState<SelectedMember | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [payments, setPayments] = useState<PaymentInfo>([])
  const [queueOpen, setQueueOpen] = useState(false)
  const [orderRefresh, setOrderRefresh] = useState(0)

  // PIN lock states (local — security feature)
  const [pinError, setPinError] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type })
  }, [])

  // Operating hours check (customer mode only)
  useEffect(() => {
    if (!isCustomer) return
    const checkHours = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        if (!res.ok) return
        const data = await res.json()
        const open = data.open_time || '10:35'
        const close = data.close_time || '12:30'
        setOperatingHours({ open, close })

        const now = new Date()
        const [oh, om] = open.split(':').map(Number)
        const [ch, cm] = close.split(':').map(Number)
        const nowMin = now.getHours() * 60 + now.getMinutes()
        const openMin = oh * 60 + om
        const closeMin = ch * 60 + cm
        setIsClosed(nowMin >= openMin && nowMin < closeMin)
      } catch { /* silent */ }
    }
    checkHours()
    const interval = setInterval(checkHours, 30000)
    return () => clearInterval(interval)
  }, [isCustomer])

  // PIN verification (staff only, with lock protection)
  const handlePinComplete = useCallback(async (pin: string) => {
    if (locked) return

    const success = await authenticateStaff(pin)
    if (success) {
      setPinError(false)
      setAttempts(0)
    } else {
      setPinError(true)
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= 5) {
        setLocked(true)
        setLockTimer(30)
        const interval = setInterval(() => {
          setLockTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              setLocked(false)
              setAttempts(0)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    }
  }, [locked, attempts, authenticateStaff])

  const resetOrder = useCallback(() => {
    setStep(0)
    setSelectedMember(null)
    setCart([])
    setPayments([])
  }, [])

  const handleOrderComplete = useCallback(() => {
    setOrderRefresh((p) => p + 1)
    showToast('주문이 접수되었습니다!', 'success')
    resetOrder()
  }, [resetOrder, showToast])

  const handleBack = useCallback(() => {
    if (activeTab !== 'order') {
      setActiveTab('order')
      return
    }
    if (step > 0) {
      setStep(step - 1)
    } else if (isCustomer) {
      router.push('/')
    } else {
      logout()
      resetOrder()
      router.push('/')
    }
  }, [activeTab, step, isCustomer, router, logout, resetOrder])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  // Closed screen (customer mode only)
  if (isCustomer && isClosed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] relative overflow-hidden font-sans">
        <div className="absolute top-[10%] left-[5%] w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.05)_0%,transparent_70%)]" />
        <div className="absolute bottom-[12%] right-[8%] w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(90,154,110,0.04)_0%,transparent_70%)]" />
        <div className="text-[64px] mb-4 relative z-10">☕</div>
        <h2 className="text-[28px] font-bold mb-2 text-rodem-text relative z-10">주문 마감</h2>
        <p className="text-lg text-rodem-text-sub mb-2 relative z-10">현재 주문 시간이 아닙니다</p>
        <div className="bg-rodem-gold-light px-6 py-3 rounded-rodem-sm mb-8 relative z-10">
          <span className="text-lg font-bold text-rodem-gold">마감시간: {operatingHours.open} ~ {operatingHours.close}</span>
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 rounded-rodem-sm border border-rodem-border-light bg-white text-rodem-text-sub font-semibold cursor-pointer text-base relative z-10"
        >
          ← 홈으로 돌아가기
        </button>
      </div>
    )
  }

  // PIN screen (staff only — session-based, shown only once)
  if (!authenticated) {
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

        <div className="text-[42px] mb-4 relative z-10">🔒</div>
        <h2 className="text-[24px] font-bold mb-2 text-rodem-text relative z-10">봉사자 인증</h2>
        <p className="text-base text-rodem-text-sub mb-8 relative z-10">PIN 6자리를 입력하세요</p>

        {pinError && !locked && (
          <p className="text-rodem-red text-base font-semibold mb-3 relative z-10">
            PIN이 틀렸습니다 ({attempts}/5)
          </p>
        )}
        {locked && (
          <div className="py-2.5 px-6 rounded-[10px] bg-rodem-red/10 mb-4 text-center relative z-10">
            <p className="text-rodem-red text-base font-bold">🔒 5회 실패 — {lockTimer}초 후 재시도</p>
          </div>
        )}

        <div className="relative z-10">
          <PinInput
            onComplete={handlePinComplete}
            error={pinError}
            disabled={locked}
            onReset={() => setPinError(false)}
          />
        </div>
      </div>
    )
  }

  // Tab titles for staff mode header
  const TAB_TITLES: Record<PosTab, string> = {
    order: '📋 주문',
    summary: '📊 오늘 정산',
    credit: '💰 미결제',
    admin: '⚙️ 관리',
  }

  // Header right: queue toggle (staff) or nothing (customer)
  const headerRight = isCustomer ? undefined : (
    <div className="flex gap-1.5">
      <button
        onClick={() => setQueueOpen(!queueOpen)}
        className="bg-white/10 border-none text-white py-1.5 px-3 rounded-lg text-base font-semibold cursor-pointer"
      >
        {queueOpen ? '✕ 닫기' : '📜 대기열'}
      </button>
    </div>
  )

  // Customer mode: original layout without tab bar
  if (isCustomer) {
    return (
      <div className="flex h-screen bg-rodem-bg font-sans">
        <OrderQueue
          isOpen={queueOpen}
          onToggle={() => setQueueOpen(!queueOpen)}
          refreshTrigger={orderRefresh}
          mode={mode}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="🛒 주문 하기"
            onBack={() => {
              if (step > 0) setStep(step - 1)
              else router.push('/')
            }}
          />
          <StepIndicator steps={STEPS} current={step} />

          <div className="flex-1 overflow-y-auto">
            {step === 0 && (
              <MenuSelect
                cart={cart}
                setCart={setCart}
                onNext={() => setStep(1)}
                onBack={() => router.push('/')}
                cartTotal={cartTotal}
              />
            )}
            {step === 1 && (
              <MemberSelect
                onSelect={(member) => {
                  setSelectedMember(member)
                  setStep(2)
                }}
              />
            )}
            {step === 2 && selectedMember && (
              <PaymentSelect
                member={selectedMember}
                cartTotal={cartTotal}
                onSelect={(paymentInfo) => {
                  setPayments(paymentInfo)
                  setStep(3)
                }}
                onBack={() => setStep(1)}
                mode={mode}
              />
            )}
            {step === 3 && selectedMember && (
              <OrderConfirm
                member={selectedMember}
                cart={cart}
                payments={payments}
                cartTotal={cartTotal}
                onComplete={handleOrderComplete}
                onBack={() => setStep(2)}
                mode={mode}
              />
            )}
          </div>
        </div>

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.show}
          onClose={() => setToast((p) => ({ ...p, show: false }))}
        />
      </div>
    )
  }

  // Staff mode: tab-based layout
  return (
    <div className="flex h-screen bg-rodem-bg font-sans">
      <OrderQueue
        isOpen={queueOpen}
        onToggle={() => setQueueOpen(!queueOpen)}
        refreshTrigger={orderRefresh}
        mode={mode}
        onPrepaidAdjust={() => setActiveTab('admin')}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={TAB_TITLES[activeTab]}
          onBack={handleBack}
          right={headerRight}
        />

        {/* Order tab: show step indicator */}
        {activeTab === 'order' && <StepIndicator steps={STEPS} current={step} />}

        {/* Tab content area — pb for bottom tab bar */}
        <div className="flex-1 overflow-y-auto pb-16">
          {/* Order tab — 4-step flow (state preserved on tab switch) */}
          {activeTab === 'order' && (
            <>
              {step === 0 && (
                <MenuSelect
                  cart={cart}
                  setCart={setCart}
                  onNext={() => setStep(1)}
                  onBack={() => { logout(); resetOrder(); router.push('/') }}
                  cartTotal={cartTotal}
                />
              )}
              {step === 1 && (
                <MemberSelect
                  onSelect={(member) => {
                    setSelectedMember(member)
                    setStep(2)
                  }}
                />
              )}
              {step === 2 && selectedMember && (
                <PaymentSelect
                  member={selectedMember}
                  cartTotal={cartTotal}
                  onSelect={(paymentInfo) => {
                    setPayments(paymentInfo)
                    setStep(3)
                  }}
                  onBack={() => setStep(1)}
                  mode={mode}
                />
              )}
              {step === 3 && selectedMember && (
                <OrderConfirm
                  member={selectedMember}
                  cart={cart}
                  payments={payments}
                  cartTotal={cartTotal}
                  onComplete={handleOrderComplete}
                  onBack={() => setStep(2)}
                  mode={mode}
                />
              )}
            </>
          )}

          {/* Summary tab — inline (no modal) */}
          {activeTab === 'summary' && <TodaySummaryInline />}

          {/* Credit tab — inline (no modal) */}
          {activeTab === 'credit' && <CreditManagerInline />}

          {/* Admin tab — inline PIN + sub-tabs */}
          {activeTab === 'admin' && <AdminPanel />}
        </div>

        {/* Bottom tab bar */}
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast((p) => ({ ...p, show: false }))}
      />
    </div>
  )
}
