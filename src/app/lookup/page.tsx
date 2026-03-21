'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { CHOSUNG_LIST } from '@/lib/constants'
import { getFirstChosung, cn, formatPrice } from '@/lib/utils'
import Header from '@/components/ui/Header'

type MemberBalance = {
  id: string
  name: string
  credit_balance: number
  prepaid_balance: number
  qr_token: string | null
}

type OrderHistory = {
  id: string
  total_price: number
  created_at: string
  order_payments: { method: string; amount: number }[]
  order_items: { quantity: number; unit_price: number; menu_items: { name: string } | null }[]
}

export default function LookupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-rodem-bg font-sans text-rodem-text-sub">불러오는 중...</div>}>
      <LookupPageInner />
    </Suspense>
  )
}

function LookupPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromStaff = searchParams.get('from') === 'staff'

  const [members, setMembers] = useState<MemberBalance[]>([])
  const [search, setSearch] = useState('')
  const [activeChosung, setActiveChosung] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<MemberBalance | null>(null)
  const [orders, setOrders] = useState<OrderHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      const supabase = createSupabaseBrowser()
      // member_balances view + qr_token from members
      const { data: balances } = await supabase
        .from('member_balances')
        .select('id, name, credit_balance, prepaid_balance')
        .order('name')

      if (balances) {
        // QR token은 메인에서 접근할 때만 필요
        if (!fromStaff) {
          const { data: membersData } = await supabase
            .from('members')
            .select('id, qr_token')
          const tokenMap = new Map(membersData?.map((m) => [m.id, m.qr_token]) || [])
          setMembers(balances.map((b) => ({ ...b, qr_token: tokenMap.get(b.id!) || null })) as MemberBalance[])
        } else {
          setMembers(balances.map((b) => ({ ...b, qr_token: null })) as MemberBalance[])
        }
      }
      setLoading(false)
    }
    fetchMembers()
  }, [fromStaff])

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
    if (fromStaff) {
      fetchOrders(member.id!)
    }
  }

  const methodLabel: Record<string, string> = {
    cash: '현금', transfer: '이체', credit: '외상', prepaid: '선불',
  }

  const backPath = fromStaff ? '/pos' : '/'

  // Detail view — from=staff: 잔액 + 주문이력
  if (selectedMember && fromStaff) {
    return (
      <div className="min-h-screen bg-rodem-bg font-sans">
        <Header title={`${selectedMember.name} 님`} onBack={() => setSelectedMember(null)} />
        <div className="p-4">
          {/* Balance cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-rodem-sm bg-rodem-orange-light border border-rodem-orange/20">
              <div className="text-sm text-rodem-orange mb-1">외상 잔액</div>
              <div className="text-[22px] font-bold text-rodem-orange">
                {formatPrice(selectedMember.credit_balance ?? 0)}
              </div>
            </div>
            <div className="p-4 rounded-rodem-sm bg-rodem-purple-light border border-rodem-purple/20">
              <div className="text-sm text-rodem-purple mb-1">선불 잔액</div>
              <div className="text-[22px] font-bold text-rodem-purple">
                {formatPrice(selectedMember.prepaid_balance ?? 0)}
              </div>
            </div>
          </div>

          {/* Order history */}
          <h3 className="font-bold text-lg text-rodem-text mb-3">주문 이력</h3>
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-rodem-text-sub">
                    {new Date(order.created_at).toLocaleDateString('ko-KR')} {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-base font-bold text-rodem-text">{formatPrice(order.total_price)}</span>
                </div>
                <div className="text-sm text-rodem-text-sub">
                  {order.order_items?.map((item, i) => (
                    <span key={i}>
                      {(item.menu_items as unknown as { name: string })?.name} x{item.quantity}
                      {i < order.order_items.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
                <div className="text-[13px] text-rodem-text-light mt-1">
                  {order.order_payments?.map((p) => methodLabel[p.method] || p.method).join(' + ')}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-8 text-rodem-text-sub text-base">주문 이력이 없습니다</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Detail view — from main: QR 코드 표시
  if (selectedMember && !fromStaff) {
    return (
      <div className="min-h-screen bg-rodem-bg font-sans">
        <Header title={`${selectedMember.name} 님`} onBack={() => setSelectedMember(null)} />
        <div className="p-4 flex flex-col items-center">
          <div className="text-center mt-8">
            <div className="text-[48px] mb-4">🌿</div>
            <h2 className="text-[24px] font-bold text-rodem-text mb-2">{selectedMember.name}</h2>
            <p className="text-base text-rodem-text-sub mb-6">개인 QR 코드</p>
          </div>
          {selectedMember.qr_token ? (
            <div className="bg-white p-6 rounded-rodem-sm shadow-md border border-rodem-border-light">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qr/generate?memberId=${selectedMember.id}`}
                alt={`${selectedMember.name} QR`}
                className="w-48 h-48"
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🔗</div>
              <p className="text-rodem-text-sub text-base">QR 코드가 생성되지 않았습니다</p>
            </div>
          )}
          <p className="text-sm text-rodem-text-sub mt-4 text-center">
            이 QR을 스캔하면 개인 페이지에서<br />잔액과 주문이력을 확인할 수 있습니다
          </p>
        </div>
      </div>
    )
  }

  // Member list
  return (
    <div className="min-h-screen bg-rodem-bg font-sans">
      <Header title="👀 고객 내역확인" onBack={() => router.push(backPath)} />
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
              className="w-full p-3.5 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-card text-rodem-text text-lg font-sans focus:outline-none focus:border-rodem-gold mb-3"
            />

            <div className="flex flex-wrap gap-1 mb-4">
              <button
                onClick={() => { setActiveChosung(null); setSearch('') }}
                className={cn(
                  'px-3 py-1.5 rounded-[10px] text-sm font-semibold cursor-pointer border',
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
                    'px-3 py-1.5 rounded-[10px] text-sm font-semibold cursor-pointer border',
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
                    <div className="font-bold text-base text-rodem-text">{member.name}</div>
                    {hasCredit && (
                      <div className="text-[13px] text-rodem-orange font-semibold mt-1">
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
