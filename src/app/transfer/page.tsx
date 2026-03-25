'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { BANK_ACCOUNT } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'

function TransferContent() {
  const searchParams = useSearchParams()
  const amount = searchParams.get('amount')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${BANK_ACCOUNT.bank} ${BANK_ACCOUNT.number}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: 구형 브라우저
      const textarea = document.createElement('textarea')
      textarea.value = `${BANK_ACCOUNT.bank} ${BANK_ACCOUNT.number}`
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] font-sans">
      <div className="max-w-sm w-full bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec] rounded-[22px] p-6 shadow-2xl border border-rodem-border-light">
        <h1 className="text-2xl font-bold text-rodem-text text-center mb-5">
          🏦 계좌이체 안내
        </h1>

        {/* 계좌 정보 */}
        <div className="bg-rodem-blue-light p-5 rounded-[14px] mb-4">
          <div className="text-base text-rodem-text-sub mb-1">{BANK_ACCOUNT.bank}</div>
          <div className="text-[24px] font-bold text-rodem-blue">{`${BANK_ACCOUNT.bank} ${BANK_ACCOUNT.number}`}</div>
          <div className="text-sm text-rodem-text-sub mt-1">{BANK_ACCOUNT.holder}</div>
        </div>

        {/* 입금 금액 */}
        {amount && (
          <div className="text-center mb-5 py-3 bg-white rounded-[14px] border border-rodem-border-light">
            <div className="text-base text-rodem-text-sub">입금 금액</div>
            <div className="text-[24px] font-bold text-rodem-text">{formatPrice(Number(amount))}</div>
          </div>
        )}

        {/* 복사 버튼 */}
        <button
          onClick={handleCopy}
          className={`w-full py-4 rounded-[14px] font-bold text-lg cursor-pointer border-none transition-all duration-200 ${
            copied
              ? 'bg-rodem-green text-white'
              : 'bg-gradient-to-br from-[#4a7fd4] to-[#3a6fc4] text-white active:scale-[0.98]'
          }`}
        >
          {copied ? '✅ 계좌번호 복사됨!' : '📋 계좌번호 복사하기'}
        </button>

        <p className="text-center text-sm text-rodem-text-sub mt-4">
          복사 후 뱅킹 앱에서 이체해 주세요
        </p>
      </div>
    </div>
  )
}

export default function TransferPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] font-sans text-rodem-text-sub">
        로딩 중...
      </div>
    }>
      <TransferContent />
    </Suspense>
  )
}
