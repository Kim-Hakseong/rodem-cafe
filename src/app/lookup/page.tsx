'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { CHOSUNG_LIST } from '@/lib/constants'
import { getFirstChosung, cn, formatPrice } from '@/lib/utils'
import Header from '@/components/ui/Header'

type MemberBalance = {
  id: string
  name: string
  credit_balance: number
  prepaid_balance: number
}

type OrderHistory = {
  id: string
  total_price: number
  created_at: string
  order_payments: { method: string; amount: number }[]
  order_items: { quantity: number; unit_price: number; menu_items: { name: string } | null }[]
}

export default function LookupPage() {
  const router = useRouter()
  const [members, setMembers] = useState<MemberBalance[]>([])
  const [search, setSearch] = useState('')
  const [activeChosung, setActiveChosung] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<MemberBalance | null>(null)
  const [orders, setOrders] = useState<OrderHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      const supabase = createSupabaseBrowser()
      const { data } = await supabase
        .from('member_balances')
        .select('id, name, credit_balance, prepaid_balance')
        .order('name')
      if (data) setMembers(data as MemberBalance[])
      setLoading(false)
    }
    fetchMembers()
  }, [])

  const fetchOrders = async (memberId: string) => {
    const supabase = createSupabaseBrowser()
    const { data } = await supabase
      .from('orders')
      .select('id, total_price, created_at, order_payments(method, amount), order_items(quantity, unit_price, menu_items(name))')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setOrders(data as unknown as OrderHistory[])
  }

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (search) return m.name!.includes(search)
      if (activeChosung) return getFirstChosung(m.name!) === activeChosung
      return true
    })
  }, [members, search, activeChosung])

  const handleSelectMember = (member: MemberBalance) => {
    setSelectedMember(member)
    fetchOrders(member.id!)
  }

  const methodLabel: Record<string, string> = {
    cash: '현금', transfer: '이체', credit: '외상', prepaid: '선불',
  }

  // Detail view
  if (selectedMember) {
    return (
      <div className="min-h-screen bg-rodem-bg font-sans">
        <Header title={`${selectedMember.name} 님`} onBack={() => setSelectedMember(null)} />
        <div className="p-4">
          {/* Balance cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-rodem-sm bg-rodem-orange-light border border-rodem-orange/20">
              <div className="text-xs text-rodem-orange mb-1">📋 외상 잔액</div>
              <div className="text-xl font-bold text-rodem-orange">
                {formatPrice(selectedMember.credit_balance ?? 0)}
              </div>
            </div>
            <div className="p-4 rounded-rodem-sm bg-rodem-purple-light border border-rodem-purple/20">
              <div className="text-xs text-rodem-purple mb-1">💰 선불 잔액</div>
              <div className="text-xl font-bold text-rodem-purple">
                {formatPrice(selectedMember.prepaid_balance ?? 0)}
              </div>
            </div>
          </div>

          {/* Order history */}
          <h3 className="font-bold text-base text-rodem-text mb-3">주문 이력</h3>
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-rodem-text-sub">
                    {new Date(order.created_at).toLocaleDateString('ko-KR')} {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-sm font-bold text-rodem-text">{formatPrice(order.total_price)}</span>
                </div>
                <div className="text-xs text-rodem-text-sub">
                  {order.order_items?.map((item, i) => (
                    <span key={i}>
                      {(item.menu_items as unknown as { name: string })?.name} ×{item.quantity}
                      {i < order.order_items.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-rodem-text-light mt-1">
                  {order.order_payments?.map((p) => methodLabel[p.method] || p.method).join(' + ')}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-8 text-rodem-text-sub text-sm">주문 이력이 없습니다</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Member list
  return (
    <div className="min-h-screen bg-rodem-bg font-sans">
      <Header title="👀 외상 조회" onBack={() => router.push('/')} />
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12 text-rodem-text-sub">불러오는 중...</div>
        ) : (
          <>
            <input
              type="text"
              placeholder="이름 검색..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveChosung(null) }}
              className="w-full p-3.5 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-card text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold mb-3"
            />

            <div className="flex flex-wrap gap-1 mb-4">
              <button
                onClick={() => { setActiveChosung(null); setSearch('') }}
                className={cn(
                  'px-3 py-1.5 rounded-[10px] text-xs font-semibold cursor-pointer border',
                  !activeChosung ? 'bg-rodem-gold text-white border-rodem-gold' : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light'
                )}
              >
                전체
              </button>
              {CHOSUNG_LIST.map((ch) => (
                <button
                  key={ch}
                  onClick={() => { setActiveChosung(ch); setSearch('') }}
                  className={cn(
                    'px-3 py-1.5 rounded-[10px] text-xs font-semibold cursor-pointer border',
                    activeChosung === ch ? 'bg-rodem-gold text-white border-rodem-gold' : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light'
                  )}
                >
                  {ch}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {filtered.map((member) => {
                const hasCredit = (member.credit_balance ?? 0) > 0
                return (
                  <button
                    key={member.id}
                    onClick={() => handleSelectMember(member)}
                    className={cn(
                      'p-3 rounded-rodem-sm border text-left cursor-pointer transition-all',
                      'bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec]',
                      hasCredit ? 'border-rodem-orange' : 'border-rodem-border-light',
                      'hover:-translate-y-[2px] hover:shadow-md'
                    )}
                  >
                    <div className="font-bold text-sm text-rodem-text">{member.name}</div>
                    {hasCredit && (
                      <div className="text-[11px] text-rodem-orange font-semibold mt-1">
                        외상 {formatPrice(member.credit_balance!)}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
