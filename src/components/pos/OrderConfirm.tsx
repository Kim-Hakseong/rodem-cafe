'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
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

export default function OrderConfirm({ member, cart, payments, cartTotal, onComplete, onBack, mode }: OrderConfirmProps) {
  const [submitting, setSubmitting] = useState(false)

  const getPaymentLabel = (method: string) => {
    return PAYMENT_METHODS.find((p) => p.id === method)?.label || method
  }

  const getPaymentIcon = (method: string) => {
    return PAYMENT_METHODS.find((p) => p.id === method)?.icon || '💳'
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          items: cart.map((c) => ({
            menuItemId: c.id,
            quantity: c.qty,
            unitPrice: c.price,
          })),
          payments: payments.map((p) => ({
            method: p.method,
            amount: p.amount,
          })),
          totalPrice: cartTotal,
          createdBy: mode,
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
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between py-1.5">
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
          {submitting ? '처리 중...' : '✅ 주문 완료'}
        </button>
      </div>
    </div>
  )
}
