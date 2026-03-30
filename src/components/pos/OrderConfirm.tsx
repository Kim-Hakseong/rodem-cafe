'use client'

import { useState, useMemo } from 'react'
import { formatPrice, cn } from '@/lib/utils'
import { PAYMENT_METHODS } from '@/lib/constants'
import type { SelectedMember, CartItem, PaymentInfo } from '@/app/pos/page'

interface OrderConfirmProps {
  member: SelectedMember
  cart: CartItem[]
  payments: PaymentInfo
  cartTotal: number
  onComplete: () => void
  onBack: () => void
  mode: 'staff' | 'customer'
}

function generateTimeSlots(): string[] {
  const now = new Date()
  const slots: string[] = []
  const start = new Date(now)
  start.setMinutes(Math.ceil(start.getMinutes() / 5) * 5 + 5, 0, 0)

  for (let i = 0; i < 24; i++) {
    const slot = new Date(start.getTime() + i * 5 * 60 * 1000)
    slots.push(slot.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
  }
  return slots
}

export default function OrderConfirm({ member, cart, payments, cartTotal, onComplete, onBack, mode }: OrderConfirmProps) {
  const [submitting, setSubmitting] = useState(false)
  const [isReservation, setIsReservation] = useState(false)
  const [reservationTime, setReservationTime] = useState('')

  const timeSlots = useMemo(() => generateTimeSlots(), [])

  const getPaymentLabel = (method: string) => {
    return PAYMENT_METHODS.find((p) => p.id === method)?.label || method
  }

  const getPaymentIcon = (method: string) => {
    return PAYMENT_METHODS.find((p) => p.id === method)?.icon || '💳'
  }

  const handleSubmit = async () => {
    if (submitting) return
    if (isReservation && !reservationTime) {
      alert('예약 시간을 선택해주세요.')
      return
    }
    setSubmitting(true)

    try {
      let scheduledFor: string | null = null
      if (isReservation && reservationTime) {
        const today = new Date()
        const [hourStr, minuteStr] = reservationTime.replace('오전 ', '').replace('오후 ', '').split(':')
        let hour = parseInt(hourStr)
        const minute = parseInt(minuteStr)
        if (reservationTime.includes('오후') && hour !== 12) hour += 12
        if (reservationTime.includes('오전') && hour === 12) hour = 0
        today.setHours(hour, minute, 0, 0)
        scheduledFor = today.toISOString()
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          items: cart.map((c) => ({
            menuItemId: c.id,
            quantity: c.qty,
            unitPrice: c.price,
            options: c.options || null,
          })),
          payments: payments.map((p) => ({
            method: p.method,
            amount: p.amount,
          })),
          totalPrice: cartTotal,
          createdBy: mode,
          scheduledFor,
        }),
      })

      if (res.ok) {
        onComplete()
      } else {
        alert('주문 저장에 실패했습니다. 다시 시도해주세요.')
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4">
      <div className="bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec] rounded-rodem p-5 border border-rodem-border-light mb-4">
        <h3 className="text-xl font-bold text-rodem-text mb-4">주문 확인</h3>

        {/* Member */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-rodem-border-light">
          <span className="text-[22px]">👤</span>
          <span className="font-bold text-lg text-rodem-text">{member.name}</span>
        </div>

        {/* Items */}
        <div className="mb-4 pb-4 border-b border-rodem-border-light">
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between py-1.5">
              <span className="text-base text-rodem-text">
                {item.name} × {item.qty}
              </span>
              <span className="text-base font-semibold text-rodem-text">
                {formatPrice(item.price * item.qty)}
              </span>
            </div>
          ))}
        </div>

        {/* Payments */}
        <div className="mb-4 pb-4 border-b border-rodem-border-light">
          {payments.map((p, i) => (
            <div key={i} className="flex justify-between py-1.5">
              <span className="text-base text-rodem-text-sub">
                {getPaymentIcon(p.method)} {getPaymentLabel(p.method)}
              </span>
              <span className="text-base font-semibold text-rodem-text">
                {formatPrice(p.amount)}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-rodem-text">합계</span>
          <span className="text-[22px] font-bold text-rodem-gold">{formatPrice(cartTotal)}</span>
        </div>
      </div>

      {/* Reservation toggle */}
      <div className="bg-white rounded-rodem-sm border border-rodem-border-light p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-base text-rodem-text">🕐 예약 주문</div>
            <div className="text-sm text-rodem-text-sub mt-0.5">지정 시간에 대기열에 표시됩니다</div>
          </div>
          <button
            onClick={() => { setIsReservation(!isReservation); setReservationTime('') }}
            className={cn(
              'w-14 h-7 rounded-full relative cursor-pointer border-none flex-shrink-0 transition-colors',
              isReservation ? 'bg-rodem-gold' : 'bg-rodem-border'
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200',
              isReservation ? 'left-[30px]' : 'left-0.5'
            )} />
          </button>
        </div>

        {isReservation && (
          <div className="mt-3">
            <div className="text-sm text-rodem-text-sub mb-2">시간 선택</div>
            <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setReservationTime(slot)}
                  className={cn(
                    'py-2 rounded-lg text-sm font-semibold cursor-pointer border transition-all',
                    reservationTime === slot
                      ? 'bg-rodem-gold text-white border-rodem-gold'
                      : 'bg-rodem-card text-rodem-text border-rodem-border-light'
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-rodem-sm border border-rodem-border-light bg-white text-rodem-text-sub font-semibold cursor-pointer text-base"
        >
          ← 이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-[2] py-3.5 rounded-rodem-sm bg-gradient-to-br from-[#f2d76a] via-[#dbb44a] to-[#c9a020] text-white font-bold text-base cursor-pointer shadow-[0_6px_24px_rgba(201,162,39,0.2)] disabled:opacity-50"
        >
          {submitting ? '처리 중...' : isReservation ? `🕐 ${reservationTime || '시간 선택'} 예약` : '✅ 주문 완료'}
        </button>
      </div>
    </div>
  )
}
