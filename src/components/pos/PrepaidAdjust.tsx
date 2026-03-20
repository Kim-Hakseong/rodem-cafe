'use client'

import { useState, useEffect, useMemo } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { getAllChosungs, formatPrice } from '@/lib/utils'
import { CHOSUNG_LIST } from '@/lib/constants'
import Modal from '@/components/ui/Modal'

interface PrepaidAdjustProps {
  onClose: () => void
}

type MemberBalance = {
  id: string
  name: string
  prepaid_balance: number | null
}

export default function PrepaidAdjust({ onClose }: PrepaidAdjustProps) {
  const [members, setMembers] = useState<MemberBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<MemberBalance | null>(null)
  const [enteredChosungs, setEnteredChosungs] = useState<string[]>([])
  const [adjustAmount, setAdjustAmount] = useState('')
  const [isDeduct, setIsDeduct] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createSupabaseBrowser()
      const { data } = await supabase
        .from('member_balances')
        .select('id, name, prepaid_balance')
        .order('name')
      if (data) setMembers(data as MemberBalance[])
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = useMemo(() => {
    const inputStr = enteredChosungs.join('')
    if (!inputStr) return members
    return members.filter((m) => getAllChosungs(m.name).startsWith(inputStr))
  }, [members, enteredChosungs])

  const handleSubmit = async () => {
    if (!selectedMember || !adjustAmount) return
    const amount = parseInt(adjustAmount)
    if (isNaN(amount) || amount <= 0) return

    const finalAmount = isDeduct ? -amount : amount

    setSubmitting(true)
    try {
      const res = await fetch('/api/prepaid/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember.id,
          amount: finalAmount,
          reason: reason || (isDeduct ? '차감' : '충전'),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setResult({
          success: true,
          message: `${selectedMember.name} 잔액: ${formatPrice(data.newBalance)}`,
        })
        // Update local state
        setMembers((prev) =>
          prev.map((m) =>
            m.id === selectedMember.id ? { ...m, prepaid_balance: data.newBalance } : m
          )
        )
        setSelectedMember(null)
        setAdjustAmount('')
        setReason('')
      } else {
        const err = await res.json()
        setResult({ success: false, message: err.error || '처리 실패' })
      }
    } catch {
      setResult({ success: false, message: '서버 오류' })
    }
    setSubmitting(false)
    setTimeout(() => setResult(null), 3000)
  }

  // Member selection view
  if (!selectedMember) {
    return (
      <Modal isOpen onClose={onClose} title="💰 선불 잔액 수정" maxWidth="max-w-md">
        {loading ? (
          <div className="text-center py-8 text-rodem-text-sub">불러오는 중...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Chosung input */}
            <div className="bg-white rounded-rodem-sm border border-rodem-border-light p-2 flex items-center gap-1.5 min-h-[44px]">
              {enteredChosungs.length > 0 ? (
                <>
                  {enteredChosungs.map((ch, i) => (
                    <span
                      key={i}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-rodem-gold-light text-rodem-gold text-base font-bold shrink-0"
                    >
                      {ch}
                    </span>
                  ))}
                  <button
                    onClick={() => setEnteredChosungs((prev) => prev.slice(0, -1))}
                    className="ml-auto text-sm text-rodem-text-sub bg-transparent border-none cursor-pointer"
                  >
                    ← 지우기
                  </button>
                </>
              ) : (
                <span className="text-sm text-rodem-text-sub">초성으로 검색</span>
              )}
            </div>

            {/* Chosung buttons */}
            <div className="grid grid-cols-7 gap-1">
              {CHOSUNG_LIST.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setEnteredChosungs((prev) => [...prev, ch])}
                  className="py-2 rounded-lg border border-rodem-border-light bg-white text-base font-bold text-rodem-text cursor-pointer hover:bg-rodem-gold-light active:scale-95 transition-all"
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Result message */}
            {result && (
              <div className={`text-center py-2 px-3 rounded-lg text-sm font-semibold ${result.success ? 'bg-rodem-green-light text-rodem-green' : 'bg-red-50 text-rodem-red'}`}>
                {result.message}
              </div>
            )}

            {/* Member list */}
            <div className="max-h-[35vh] overflow-y-auto space-y-1.5">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMember(m)}
                  className="w-full p-3 rounded-rodem-sm border border-rodem-border-light bg-white flex justify-between items-center cursor-pointer hover:bg-rodem-gold-light transition-colors text-left"
                >
                  <span className="font-bold text-base text-rodem-text">{m.name}</span>
                  <span className="text-base text-rodem-purple font-semibold">
                    {formatPrice(m.prepaid_balance ?? 0)}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-4 text-rodem-text-sub text-sm">검색 결과 없음</div>
              )}
            </div>
          </div>
        )}
      </Modal>
    )
  }

  // Adjust view
  return (
    <Modal isOpen onClose={onClose} title="💰 선불 잔액 수정" maxWidth="max-w-sm">
      <div className="flex flex-col gap-4">
        {/* Member info */}
        <div className="text-center">
          <div className="text-xl font-bold text-rodem-text">{selectedMember.name}</div>
          <div className="text-lg text-rodem-purple font-semibold mt-1">
            현재 잔액: {formatPrice(selectedMember.prepaid_balance ?? 0)}
          </div>
        </div>

        {/* Toggle charge/deduct */}
        <div className="flex rounded-rodem-sm overflow-hidden border border-rodem-border-light">
          <button
            onClick={() => setIsDeduct(false)}
            className={`flex-1 py-2.5 text-base font-bold cursor-pointer border-none transition-colors ${!isDeduct ? 'bg-rodem-green text-white' : 'bg-white text-rodem-text-sub'}`}
          >
            + 충전
          </button>
          <button
            onClick={() => setIsDeduct(true)}
            className={`flex-1 py-2.5 text-base font-bold cursor-pointer border-none transition-colors ${isDeduct ? 'bg-rodem-red text-white' : 'bg-white text-rodem-text-sub'}`}
          >
            - 차감
          </button>
        </div>

        {/* Amount input */}
        <input
          type="number"
          placeholder="금액 입력"
          value={adjustAmount}
          onChange={(e) => setAdjustAmount(e.target.value)}
          className="w-full p-3 rounded-rodem-sm border border-rodem-border-light text-lg text-center font-bold"
        />

        {/* Quick amounts */}
        <div className="grid grid-cols-4 gap-2">
          {[5000, 10000, 20000, 50000].map((amt) => (
            <button
              key={amt}
              onClick={() => setAdjustAmount(String(amt))}
              className="py-2 rounded-lg border border-rodem-border-light bg-white text-sm font-semibold text-rodem-text cursor-pointer hover:bg-rodem-gold-light"
            >
              {formatPrice(amt)}
            </button>
          ))}
        </div>

        {/* Reason */}
        <input
          type="text"
          placeholder="사유 (선택)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-2.5 rounded-rodem-sm border border-rodem-border-light text-base"
        />

        {/* Result message */}
        {result && (
          <div className={`text-center py-2 rounded-lg text-sm font-semibold ${result.success ? 'bg-rodem-green-light text-rodem-green' : 'bg-red-50 text-rodem-red'}`}>
            {result.message}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedMember(null)}
            className="flex-1 py-3 rounded-rodem-sm border border-rodem-border-light bg-white text-base font-bold text-rodem-text-sub cursor-pointer"
          >
            ← 뒤로
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !adjustAmount}
            className={`flex-1 py-3 rounded-rodem-sm border-none text-white text-base font-bold cursor-pointer disabled:opacity-50 ${isDeduct ? 'bg-rodem-red' : 'bg-rodem-green'}`}
          >
            {submitting ? '처리중...' : isDeduct ? '차감 확인' : '충전 확인'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
