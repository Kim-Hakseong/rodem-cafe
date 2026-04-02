'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { formatPrice, cn } from '@/lib/utils'

type CreditMember = {
  id: string
  name: string
  credit_balance: number
}

type CreditOrder = {
  id: string
  order_number: number
  total_price: number
  created_at: string
  member_id: string
  members: { name: string } | null
  order_payments: { method: string; amount: number }[]
  order_items: { quantity: number; unit_price: number; menu_items: { name: string } | null }[]
}

export default function CreditManagerInline() {
  const [members, setMembers] = useState<CreditMember[]>([])
  const [creditOrders, setCreditOrders] = useState<CreditOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [settling, setSettling] = useState<string | null>(null)
  const [settleMethod, setSettleMethod] = useState<'cash' | 'transfer'>('cash')
  const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary')

  const fetchMembers = useCallback(async () => {
    const supabase = createSupabaseBrowser()
    const { data } = await supabase
      .from('member_balances')
      .select('id, name, credit_balance')
      .gt('credit_balance', 0)
      .order('name')

    if (data) setMembers(data as CreditMember[])
  }, [])

  const fetchCreditOrders = useCallback(async () => {
    const supabase = createSupabaseBrowser()
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, total_price, created_at, member_id, members(name), order_payments(method, amount), order_items(quantity, unit_price, menu_items(name))')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(2000)

    if (data) {
      const filtered = (data as unknown as CreditOrder[]).filter(o =>
        o.order_payments?.some(p => p.method === 'credit')
      )
      setCreditOrders(filtered)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchMembers(), fetchCreditOrders()])
      setLoading(false)
    }
    load()
  }, [fetchMembers, fetchCreditOrders])

  const handleSettle = async (memberId: string, amount: number) => {
    try {
      const res = await fetch('/api/credit/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, amount, method: settleMethod }),
      })

      if (res.ok) {
        setSettling(null)
        fetchMembers()
        fetchCreditOrders()
      }
    } catch {
      alert('정산 처리에 실패했습니다.')
    }
  }

  const totalCredit = members.reduce((sum, m) => sum + m.credit_balance, 0)

  if (loading) return <div className="text-center py-12 text-rodem-text-sub text-xl">불러오는 중...</div>

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold text-rodem-text mb-4">💰 미결제 관리</h3>

      <div className="bg-rodem-orange-light p-5 rounded-rodem-sm mb-4 border border-rodem-orange/20">
        <div className="text-lg text-rodem-orange mb-1">총 미결제 잔액</div>
        <div className="text-[32px] font-bold text-rodem-orange">{formatPrice(totalCredit)}</div>
        <div className="text-lg text-rodem-text-sub mt-1">{members.length}명 · 주문 {creditOrders.length}건</div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('summary')}
          className={cn(
            'flex-1 py-2.5 rounded-rodem-sm text-lg font-bold cursor-pointer border',
            viewMode === 'summary'
              ? 'bg-rodem-orange text-white border-rodem-orange'
              : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light'
          )}
        >
          인별 잔액 ({members.length})
        </button>
        <button
          onClick={() => setViewMode('detail')}
          className={cn(
            'flex-1 py-2.5 rounded-rodem-sm text-lg font-bold cursor-pointer border',
            viewMode === 'detail'
              ? 'bg-rodem-orange text-white border-rodem-orange'
              : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light'
          )}
        >
          전체 내역 ({creditOrders.length})
        </button>
      </div>

      {viewMode === 'summary' ? (
        <div className="space-y-2 max-h-[calc(100vh-520px)] overflow-y-auto">
          {members.map((member) => (
            <div key={member.id} className="p-4 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xl text-rodem-text">{member.name}</div>
                  <div className="text-rodem-orange font-bold text-xl">{formatPrice(member.credit_balance)}</div>
                </div>
                {settling === member.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={settleMethod}
                      onChange={(e) => setSettleMethod(e.target.value as 'cash' | 'transfer')}
                      className="text-base p-2 rounded border border-rodem-border-light bg-white"
                    >
                      <option value="cash">현금</option>
                      <option value="transfer">이체</option>
                    </select>
                    <button
                      onClick={() => handleSettle(member.id, member.credit_balance)}
                      className="px-4 py-2 rounded-[10px] bg-rodem-green text-white text-base font-bold cursor-pointer"
                    >
                      확인
                    </button>
                    <button
                      onClick={() => setSettling(null)}
                      className="text-rodem-text-sub text-base cursor-pointer bg-transparent border-none"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSettling(member.id)}
                    className="px-4 py-2 rounded-[10px] bg-rodem-green-light border border-rodem-green text-rodem-green text-base font-bold cursor-pointer"
                  >
                    정산
                  </button>
                )}
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="text-center py-8 text-rodem-text-sub text-xl">미결제 내역이 없습니다</div>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-520px)] overflow-y-auto">
          {creditOrders.map((order) => {
            const creditAmount = order.order_payments?.filter(p => p.method === 'credit').reduce((s, p) => s + p.amount, 0) || 0
            const menuStr = order.order_items?.map(i =>
              `${(i.menu_items as unknown as { name: string })?.name || ''}x${i.quantity}`
            ).join(', ') || ''
            const d = new Date(order.created_at)

            return (
              <div key={order.id} className="p-4 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xl font-bold text-rodem-text">
                    {(order.members as unknown as { name: string })?.name || '알수없음'}
                  </span>
                  <span className="text-xl font-bold text-rodem-orange">
                    {formatPrice(creditAmount)}
                  </span>
                </div>
                <div className="text-lg text-rodem-text-sub">
                  {d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  {' '}
                  {d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                {menuStr && (
                  <div className="text-lg text-rodem-text-sub mt-0.5">{menuStr}</div>
                )}
              </div>
            )
          })}
          {creditOrders.length === 0 && (
            <div className="text-center py-8 text-rodem-text-sub text-xl">미결제 주문 내역이 없습니다</div>
          )}
        </div>
      )}
    </div>
  )
}
