'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { CHOSUNG_LIST } from '@/lib/constants'
import { getFirstChosung, cn, formatPrice } from '@/lib/utils'
import Header from '@/components/ui/Header'
import PinInput from '@/components/ui/PinInput'
import Toast from '@/components/ui/Toast'

type MemberRow = { id: string; name: string; prepaid_balance: number }
type TopupRecord = { id: string; amount: number; method: string; created_at: string; members: { name: string } | null }

const QUICK_AMOUNTS = [10000, 20000, 30000, 50000]

export default function PrepaidPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [view, setView] = useState<'home' | 'charge' | 'history'>('home')
  const [members, setMembers] = useState<MemberRow[]>([])
  const [search, setSearch] = useState('')
  const [activeChosung, setActiveChosung] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null)
  const [amount, setAmount] = useState(0)
  const [method, setMethod] = useState<'cash' | 'transfer'>('cash')
  const [topups, setTopups] = useState<TopupRecord[]>([])
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchMembers = useCallback(async () => {
    const supabase = createSupabaseBrowser()
    const { data } = await supabase.from('members').select('id, name, prepaid_balance').order('name')
    if (data) setMembers(data as MemberRow[])
    setLoading(false)
  }, [])

  const fetchTopups = useCallback(async () => {
    const supabase = createSupabaseBrowser()
    const { data } = await supabase
      .from('prepaid_topups')
      .select('id, amount, method, created_at, members(name)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setTopups(data as unknown as TopupRecord[])
  }, [])

  useEffect(() => {
    if (authenticated) { fetchMembers(); fetchTopups() }
  }, [authenticated, fetchMembers, fetchTopups])

  const handlePinComplete = useCallback(async (pin: string) => {
    const res = await fetch('/api/pin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, type: 'staff' }),
    })
    if (res.ok) { setAuthenticated(true); setPinError(false) }
    else setPinError(true)
  }, [])

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (search) return m.name.includes(search)
      if (activeChosung) return getFirstChosung(m.name) === activeChosung
      return true
    })
  }, [members, search, activeChosung])

  const handleCharge = async () => {
    if (!selectedMember || !amount || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/prepaid/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: selectedMember.id, amount, method }),
      })
      if (res.ok) {
        setToast({ show: true, message: `${selectedMember.name}님에게 ${formatPrice(amount)} 충전 완료!`, type: 'success' })
        setSelectedMember(null)
        setAmount(0)
        setView('home')
        fetchMembers()
        fetchTopups()
      }
    } catch { setToast({ show: true, message: '충전 실패', type: 'error' }) }
    finally { setSubmitting(false) }
  }

  const totalBalance = members.reduce((sum, m) => sum + (m.prepaid_balance || 0), 0)

  // PIN screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] font-sans relative">
        <button onClick={() => router.push('/')} className="absolute top-4 left-4 bg-gradient-to-br from-[#f0ece4] to-[#e8e3da] border-none text-base text-rodem-text-sub cursor-pointer py-2 px-3.5 rounded-[10px]">← 뒤로</button>
        <div className="text-[42px] mb-4">💰</div>
        <h2 className="text-[24px] font-bold mb-2 text-rodem-text">선불 충전 관리</h2>
        <p className="text-base text-rodem-text-sub mb-8">봉사자 PIN을 입력하세요</p>
        {pinError && <p className="text-rodem-red text-base font-semibold mb-3">PIN이 틀렸습니다</p>}
        <PinInput onComplete={handlePinComplete} error={pinError} onReset={() => setPinError(false)} />
      </div>
    )
  }

  const headerRight = (
    <div className="flex gap-1.5">
      <button onClick={() => setView('home')} className={cn('py-1.5 px-3 rounded-lg text-sm font-semibold cursor-pointer border-none', view === 'home' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70')}>홈</button>
      <button onClick={() => setView('charge')} className={cn('py-1.5 px-3 rounded-lg text-sm font-semibold cursor-pointer border-none', view === 'charge' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70')}>충전</button>
      <button onClick={() => setView('history')} className={cn('py-1.5 px-3 rounded-lg text-sm font-semibold cursor-pointer border-none', view === 'history' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70')}>내역</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-rodem-bg font-sans">
      <Header title="💰 선불 충전" onBack={() => router.push('/')} right={headerRight} />

      {view === 'home' && (
        <div className="p-4">
          <div className="bg-gradient-to-br from-[#7c5fbf] to-[#6a4faf] text-white p-5 rounded-rodem mb-4">
            <div className="text-sm opacity-70 mb-1">총 선불 잔액</div>
            <div className="text-[26px] font-bold">{formatPrice(totalBalance)}</div>
            <div className="text-sm opacity-70 mt-1">{members.filter(m => (m.prepaid_balance || 0) > 0).length}명 보유</div>
          </div>
          <h3 className="font-bold text-base text-rodem-text mb-3">성도별 잔액</h3>
          <div className="grid grid-cols-3 gap-2">
            {members.filter(m => (m.prepaid_balance || 0) > 0).map((m) => (
              <div key={m.id} className="p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                <div className="font-semibold text-base text-rodem-text">{m.name}</div>
                <div className="text-sm text-rodem-purple font-bold mt-1">{formatPrice(m.prepaid_balance || 0)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'charge' && !selectedMember && (
        <div className="p-4">
          <input type="text" placeholder="이름 검색..." value={search} onChange={(e) => { setSearch(e.target.value); setActiveChosung(null) }} className="w-full p-3.5 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-card text-rodem-text text-lg font-sans focus:outline-none focus:border-rodem-gold mb-3" />
          <div className="flex flex-wrap gap-1 mb-4">
            <button onClick={() => { setActiveChosung(null); setSearch('') }} className={cn('px-3 py-1.5 rounded-[10px] text-sm font-semibold cursor-pointer border', !activeChosung ? 'bg-rodem-gold text-white border-rodem-gold' : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light')}>전체</button>
            {CHOSUNG_LIST.map((ch) => (
              <button key={ch} onClick={() => { setActiveChosung(ch); setSearch('') }} className={cn('px-3 py-1.5 rounded-[10px] text-sm font-semibold cursor-pointer border', activeChosung === ch ? 'bg-rodem-gold text-white border-rodem-gold' : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light')}>{ch}</button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((m) => (
              <button key={m.id} onClick={() => setSelectedMember(m)} className="p-3 rounded-rodem-sm border border-rodem-border-light bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec] text-left cursor-pointer hover:-translate-y-[2px] hover:shadow-md transition-all">
                <div className="font-bold text-base text-rodem-text">{m.name}</div>
                <div className="text-[13px] text-rodem-purple font-semibold mt-1">잔액 {formatPrice(m.prepaid_balance || 0)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'charge' && selectedMember && (
        <div className="p-4">
          <div className="bg-rodem-purple-light p-4 rounded-rodem-sm border border-rodem-purple/20 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-rodem-text">{selectedMember.name}</div>
                <div className="text-sm text-rodem-purple">현재 잔액 {formatPrice(selectedMember.prepaid_balance || 0)}</div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-rodem-text-sub text-base cursor-pointer bg-transparent border-none">변경</button>
            </div>
          </div>

          <h4 className="font-bold text-base text-rodem-text mb-3">충전 금액</h4>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {QUICK_AMOUNTS.map((a) => (
              <button key={a} onClick={() => setAmount(a)} className={cn('py-3 rounded-rodem-sm font-bold text-base cursor-pointer border', amount === a ? 'bg-rodem-purple text-white border-rodem-purple' : 'bg-rodem-card text-rodem-text border-rodem-border-light')}>
                {formatPrice(a)}
              </button>
            ))}
          </div>
          <input type="number" placeholder="직접 입력 (원)" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} className="w-full p-3.5 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-card text-rodem-text text-lg font-sans focus:outline-none focus:border-rodem-purple mb-4 text-center" />

          <h4 className="font-bold text-base text-rodem-text mb-3">수납 방법</h4>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setMethod('cash')} className={cn('flex-1 py-3 rounded-rodem-sm font-bold text-base cursor-pointer border', method === 'cash' ? 'bg-rodem-green text-white border-rodem-green' : 'bg-rodem-card text-rodem-text border-rodem-border-light')}>💵 현금</button>
            <button onClick={() => setMethod('transfer')} className={cn('flex-1 py-3 rounded-rodem-sm font-bold text-base cursor-pointer border', method === 'transfer' ? 'bg-rodem-blue text-white border-rodem-blue' : 'bg-rodem-card text-rodem-text border-rodem-border-light')}>🏦 계좌이체</button>
          </div>

          <button onClick={handleCharge} disabled={!amount || submitting} className="w-full py-4 rounded-rodem-sm bg-gradient-to-br from-[#7c5fbf] to-[#6a4faf] text-white font-bold text-lg cursor-pointer shadow-[0_6px_24px_rgba(124,95,191,0.2)] disabled:opacity-50">
            {submitting ? '처리 중...' : `${formatPrice(amount)} 충전하기`}
          </button>
        </div>
      )}

      {view === 'history' && (
        <div className="p-4">
          <h3 className="font-bold text-base text-rodem-text mb-3">충전 내역</h3>
          <div className="space-y-2">
            {topups.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                <div>
                  <div className="text-base font-semibold text-rodem-text">{(t.members as unknown as { name: string })?.name}</div>
                  <div className="text-sm text-rodem-text-sub">
                    {new Date(t.created_at).toLocaleDateString('ko-KR')} · {t.method === 'cash' ? '현금' : '이체'}
                  </div>
                </div>
                <div className="text-base font-bold text-rodem-purple">+{formatPrice(t.amount)}</div>
              </div>
            ))}
            {topups.length === 0 && <div className="text-center py-8 text-rodem-text-sub text-base">충전 내역이 없습니다</div>}
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} isVisible={toast.show} onClose={() => setToast(p => ({ ...p, show: false }))} />
    </div>
  )
}
