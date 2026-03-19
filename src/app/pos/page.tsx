'use client'

import { useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PinInput from '@/components/ui/PinInput'
import Header from '@/components/ui/Header'
import StepIndicator from '@/components/ui/StepIndicator'
import Toast from '@/components/ui/Toast'
import MemberSelect from '@/components/pos/MemberSelect'
import MenuSelect from '@/components/pos/MenuSelect'
import PaymentSelect from '@/components/pos/PaymentSelect'
import OrderConfirm from '@/components/pos/OrderConfirm'
import TodaySummary from '@/components/pos/TodaySummary'
import CreditManager from '@/components/pos/CreditManager'
import OrderQueue from '@/components/pos/OrderQueue'
import { useRouter } from 'next/navigation'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
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

  const [authenticated, setAuthenticated] = useState(isCustomer)
  const [step, setStep] = useState(0)
  const [selectedMember, setSelectedMember] = useState<SelectedMember | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [payments, setPayments] = useState<PaymentInfo>([])
  const [showSummary, setShowSummary] = useState(false)
  const [showCredit, setShowCredit] = useState(false)
  const [queueOpen, setQueueOpen] = useState(false)
  const [orderRefresh, setOrderRefresh] = useState(0)

  // PIN states
  const [pinError, setPinError] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type })
  }, [])

  // PIN verification (staff only)
  const handlePinComplete = useCallback(async (pin: string) => {
    if (locked) return

    try {
      const res = await fetch('/api/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, type: 'staff' }),
      })

      if (res.ok) {
        setAuthenticated(true)
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
    } catch {
      setPinError(true)
    }
  }, [locked, attempts])

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

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  // PIN screen (staff only)
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

  // Header right buttons — staff only (정산, 외상)
  const headerRight = isCustomer ? undefined : (
    <div className="flex gap-1.5">
      <button
        onClick={() => setShowSummary(true)}
        className="bg-white/10 border-none text-white py-1.5 px-3 rounded-lg text-base font-semibold cursor-pointer"
      >
        📊 정산
      </button>
      <button
        onClick={() => setShowCredit(true)}
        className="bg-white/10 border-none text-white py-1.5 px-3 rounded-lg text-base font-semibold cursor-pointer"
      >
        💰 외상
      </button>
    </div>
  )

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
          title={isCustomer ? '🛒 주문 하기' : '📋 봉사자 페이지'}
          onBack={() => {
            if (isCustomer) {
              router.push('/')
            } else {
              setAuthenticated(false)
              resetOrder()
            }
          }}
          right={headerRight}
        />
        <StepIndicator steps={STEPS} current={step} />

        <div className="flex-1 overflow-y-auto">
          {step === 0 && (
            <MenuSelect
              cart={cart}
              setCart={setCart}
              onNext={() => setStep(1)}
              onBack={() => {
                if (isCustomer) router.push('/')
                else { setAuthenticated(false); resetOrder() }
              }}
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

      {!isCustomer && showSummary && (
        <TodaySummary onClose={() => setShowSummary(false)} />
      )}
      {!isCustomer && showCredit && (
        <CreditManager onClose={() => setShowCredit(false)} />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast((p) => ({ ...p, show: false }))}
      />
    </div>
  )
}
