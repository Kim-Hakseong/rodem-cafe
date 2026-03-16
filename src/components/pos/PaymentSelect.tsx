'use client'

import { useState } from 'react'
import { PAYMENT_METHODS, BANK_ACCOUNT } from '@/lib/constants'
import { cn, formatPrice } from '@/lib/utils'
import type { SelectedMember, PaymentInfo } from '@/app/pos/page'

interface PaymentSelectProps {
  member: SelectedMember
  cartTotal: number
  onSelect: (payments: PaymentInfo) => void
  onBack: () => void
}

export default function PaymentSelect({ member, cartTotal, onSelect, onBack }: PaymentSelectProps) {
  const [showTransferInfo, setShowTransferInfo] = useState(false)
  const [showPrepaidShortage, setShowPrepaidShortage] = useState(false)
  const shortage = cartTotal - member.prepaid_balance

  const handlePayment = (methodId: string) => {
    if (methodId === 'transfer') {
      setShowTransferInfo(true)
      return
    }

    if (methodId === 'prepaid') {
      if (member.prepaid_balance >= cartTotal) {
        onSelect([{ method: 'prepaid', amount: cartTotal }])
      } else {
        setShowPrepaidShortage(true)
      }
      return
    }

    onSelect([{ method: methodId, amount: cartTotal }])
  }

  const handlePrepaidOption = (option: 'credit' | 'cash' | 'transfer') => {
    onSelect([
      { method: 'prepaid', amount: member.prepaid_balance },
      { method: option, amount: shortage },
    ])
  }

  const handleTransferConfirm = () => {
    setShowTransferInfo(false)
    onSelect([{ method: 'transfer', amount: cartTotal }])
  }

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <div className="text-sm text-rodem-text-sub mb-1">{member.name}님의 결제</div>
        <div className="text-2xl font-bold text-rodem-text">{formatPrice(cartTotal)}</div>
      </div>

      {/* Payment buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {PAYMENT_METHODS.map((pm) => (
          <button
            key={pm.id}
            onClick={() => handlePayment(pm.id)}
            className={cn(
              'p-5 rounded-rodem-sm border-2 text-center cursor-pointer transition-all duration-200',
              'hover:-translate-y-[2px] hover:shadow-md',
              `bg-${pm.bgColor} border-${pm.bgColor}`
            )}
            style={{
              backgroundColor: pm.id === 'cash' ? '#eaf5ee' : pm.id === 'transfer' ? '#eaf0fa' : pm.id === 'credit' ? '#fcf2e4' : '#f0ebfa',
              borderColor: pm.id === 'cash' ? '#5a9a6e' : pm.id === 'transfer' ? '#4a7fd4' : pm.id === 'credit' ? '#d49a4a' : '#7c5fbf',
            }}
          >
            <div className="text-3xl mb-2">{pm.icon}</div>
            <div className="font-bold text-sm" style={{
              color: pm.id === 'cash' ? '#5a9a6e' : pm.id === 'transfer' ? '#4a7fd4' : pm.id === 'credit' ? '#d49a4a' : '#7c5fbf',
            }}>
              {pm.label}
            </div>
            {pm.id === 'prepaid' && (
              <div className="text-[11px] mt-1 text-rodem-text-sub">
                잔액 {formatPrice(member.prepaid_balance)}
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="w-full py-3 rounded-rodem-sm border border-rodem-border-light bg-white text-rodem-text-sub font-semibold cursor-pointer text-sm"
      >
        ← 메뉴 선택으로 돌아가기
      </button>

      {/* Transfer info modal */}
      {showTransferInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowTransferInfo(false)}>
          <div className="absolute inset-0 bg-[rgba(74,69,65,0.4)] backdrop-blur-[10px]" />
          <div className="relative bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec] rounded-rodem p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-rodem-text mb-4">🏦 계좌이체 안내</h3>
            <div className="bg-rodem-blue-light p-4 rounded-rodem-sm mb-4">
              <div className="text-sm text-rodem-text-sub mb-1">{BANK_ACCOUNT.bank}</div>
              <div className="text-xl font-bold text-rodem-blue">{BANK_ACCOUNT.number}</div>
              <div className="text-xs text-rodem-text-sub mt-1">{BANK_ACCOUNT.holder}</div>
            </div>
            <div className="text-center mb-4">
              <div className="text-sm text-rodem-text-sub">입금 금액</div>
              <div className="text-xl font-bold text-rodem-text">{formatPrice(cartTotal)}</div>
            </div>
            <button
              onClick={handleTransferConfirm}
              className="w-full py-3 rounded-rodem-sm bg-gradient-to-br from-[#4a7fd4] to-[#3a6fc4] text-white font-bold cursor-pointer"
            >
              이체 확인 완료
            </button>
          </div>
        </div>
      )}

      {/* Prepaid shortage modal */}
      {showPrepaidShortage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPrepaidShortage(false)}>
          <div className="absolute inset-0 bg-[rgba(74,69,65,0.4)] backdrop-blur-[10px]" />
          <div className="relative bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec] rounded-rodem p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-rodem-text mb-2">💰 선불 잔액 부족</h3>
            <div className="text-sm text-rodem-text-sub mb-4">
              잔액 {formatPrice(member.prepaid_balance)} / 필요 {formatPrice(cartTotal)}
              <br />
              부족분: <span className="font-bold text-rodem-red">{formatPrice(shortage)}</span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handlePrepaidOption('credit')}
                className="w-full py-3 rounded-rodem-sm bg-rodem-orange-light border border-rodem-orange text-rodem-orange font-bold cursor-pointer text-sm"
              >
                📋 부족분 외상 처리 ({formatPrice(shortage)})
              </button>
              <button
                onClick={() => handlePrepaidOption('cash')}
                className="w-full py-3 rounded-rodem-sm bg-rodem-green-light border border-rodem-green text-rodem-green font-bold cursor-pointer text-sm"
              >
                💵 부족분 현금 결제 ({formatPrice(shortage)})
              </button>
              <button
                onClick={() => handlePrepaidOption('transfer')}
                className="w-full py-3 rounded-rodem-sm bg-rodem-blue-light border border-rodem-blue text-rodem-blue font-bold cursor-pointer text-sm"
              >
                🏦 부족분 계좌이체 ({formatPrice(shortage)})
              </button>
              <button
                onClick={() => setShowPrepaidShortage(false)}
                className="w-full py-2 text-rodem-text-sub text-sm cursor-pointer bg-transparent border-none"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
