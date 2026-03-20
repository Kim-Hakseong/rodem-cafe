'use client'

import { useState, useEffect, useMemo } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { getAllChosungs, formatPrice } from '@/lib/utils'
import { CHOSUNG_LIST } from '@/lib/constants'

type MemberBalance = {
  id: string
  name: string
  prepaid_balance: number | null
}

export default function PrepaidManager() {
  const [members, setMembers] = useState<MemberBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [enteredChosungs, setEnteredChosungs] = useState<string[]>([])
  const [selected, setSelected] = useState<MemberBalance | null>(null)
  const [amount, setAmount] = useState('')
  const [isDeduct, setIsDeduct] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchMembers = async () => {
    const supabase = createSupabaseBrowser()
    const { data } = await supabase
      .from('member_balances')
      .select('id, name, prepaid_balance')
      .order('name')
    if (data) setMembers(data as MemberBalance[])
    setLoading(false)
  }

  useEffect(() => { fetchMembers() }, [])

  const filtered = useMemo(() => {
    const input = enteredChosungs.join('')
    const list = input
      ? members.filter((m) => getAllChosungs(m.name).startsWith(input))
      : members
    return list.sort((a, b) => (b.prepaid_balance ?? 0) - (a.prepaid_balance ?? 0))
  }, [members, enteredChosungs])

  const handleSubmit = async () => {
    if (!selected || !amount) return
    const num = parseInt(amount)
    if (isNaN(num) || num <= 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/prepaid/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selected.id,
          amount: isDeduct ? -num : num,
          reason: reason || (isDeduct ? '관리자 차감' : '관리자 충전'),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessage({ type: 'success', text: `${selected.name}: ${formatPrice(data.newBalance)}` })
        setMembers((prev) =>
          prev.map((m) => m.id === selected.id ? { ...m, prepaid_balance: data.newBalance } : m)
        )
        setSelected(null)
        setAmount('')
        setReason('')
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.error || '처리 실패' })
      }
    } catch {
      setMessage({ type: 'error', text: '서버 오류' })
    }
    setSubmitting(false)
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) return <div className="text-center py-8 text-rodem-text-sub">불러오는 중...</div>

  // Adjust form for selected member
  if (selected) {
    return (
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="text-center">
          <div className="text-xl font-bold text-rodem-text">{selected.name}</div>
          <div className="text-lg text-rodem-purple font-semibold mt-1">
            현재 잔액: {formatPrice(selected.prepaid_balance ?? 0)}
          </div>
        </div>

        <div className="flex rounded-rodem-sm overflow-hidden border border-rodem-border-light">
          <button
            onClick={() => setIsDeduct(false)}
            className={`flex-1 py-2.5 text-base font-bold cursor-pointer border-none ${!isDeduct ? 'bg-rodem-green text-white' : 'bg-white text-rodem-text-sub'}`}
          >
            + 충전
          </button>
          <button
            onClick={() => setIsDeduct(true)}
            className={`flex-1 py-2.5 text-base font-bold cursor-pointer border-none ${isDeduct ? 'bg-rodem-red text-white' : 'bg-white text-rodem-text-sub'}`}
          >
            - 차감
          </button>
        </div>

        <input
          type="number"
          placeholder="금액"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 rounded-rodem-sm border border-rodem-border-light text-lg text-center font-bold"
        />

        <div className="grid grid-cols-4 gap-2">
          {[5000, 10000, 20000, 50000].map((v) => (
            <button key={v} onClick={() => setAmount(String(v))} className="py-2 rounded-lg border border-rodem-border-light bg-white text-sm font-semibold cursor-pointer hover:bg-rodem-gold-light">
              {formatPrice(v)}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="사유 (선택)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-2.5 rounded-rodem-sm border border-rodem-border-light text-base"
        />

        {message && (
          <div className={`text-center py-2 rounded-lg text-sm font-semibold ${message.type === 'success' ? 'bg-rodem-green-light text-rodem-green' : 'bg-red-50 text-rodem-red'}`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setSelected(null)} className="flex-1 py-3 rounded-rodem-sm border border-rodem-border-light bg-white text-base font-bold text-rodem-text-sub cursor-pointer">
            ← 뒤로
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !amount}
            className={`flex-1 py-3 rounded-rodem-sm border-none text-white text-base font-bold cursor-pointer disabled:opacity-50 ${isDeduct ? 'bg-rodem-red' : 'bg-rodem-green'}`}
          >
            {submitting ? '처리중...' : '확인'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Chosung search */}
      <div className="flex items-center gap-1.5 bg-white rounded-rodem-sm border border-rodem-border-light p-2 min-h-[40px]">
        {enteredChosungs.length > 0 ? (
          <>
            {enteredChosungs.map((ch, i) => (
              <span key={i} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rodem-gold-light text-rodem-gold text-base font-bold shrink-0">
                {ch}
              </span>
            ))}
            <button onClick={() => setEnteredChosungs((p) => p.slice(0, -1))} className="ml-auto text-sm text-rodem-text-sub bg-transparent border-none cursor-pointer">
              ← 지우기
            </button>
          </>
        ) : (
          <span className="text-sm text-rodem-text-sub">초성으로 검색</span>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {CHOSUNG_LIST.map((ch) => (
          <button
            key={ch}
            onClick={() => setEnteredChosungs((p) => [...p, ch])}
            className="py-1.5 rounded-lg border border-rodem-border-light bg-white text-sm font-bold text-rodem-text cursor-pointer hover:bg-rodem-gold-light active:scale-95"
          >
            {ch}
          </button>
        ))}
      </div>

      {message && (
        <div className={`text-center py-2 rounded-lg text-sm font-semibold ${message.type === 'success' ? 'bg-rodem-green-light text-rodem-green' : 'bg-red-50 text-rodem-red'}`}>
          {message.text}
        </div>
      )}

      {/* Member list */}
      <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
        {filtered.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m)}
            className="w-full p-3 rounded-rodem-sm border border-rodem-border-light bg-white flex justify-between items-center cursor-pointer hover:bg-rodem-gold-light transition-colors text-left"
          >
            <span className="font-bold text-base text-rodem-text">{m.name}</span>
            <span className="text-base text-rodem-purple font-semibold">
              {formatPrice(m.prepaid_balance ?? 0)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
