'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { formatPrice, cn } from '@/lib/utils'

type OrderRow = {
  id: string
  order_number: number
  total_price: number
  status: string
  created_at: string
  members: { name: string } | null
  order_payments: { method: string; amount: number }[]
  order_items: { quantity: number; unit_price: number; menu_items: { name: string } | null }[]
}

type DateMode = 'single' | 'range' | 'all'

const METHOD_TAG: Record<string, { label: string; bg: string; text: string }> = {
  cash: { label: '현금', bg: 'bg-rodem-green-light', text: 'text-rodem-green' },
  transfer: { label: '이체', bg: 'bg-rodem-blue-light', text: 'text-rodem-blue' },
  credit: { label: '미결제', bg: 'bg-rodem-orange-light', text: 'text-rodem-orange' },
  prepaid: { label: '선불', bg: 'bg-[#f0ebfa]', text: 'text-rodem-purple' },
}

const METHOD_LABELS: Record<string, { label: string; color: string }> = {
  cash: { label: '💵 현금', color: 'text-rodem-green' },
  transfer: { label: '🏦 이체', color: 'text-rodem-blue' },
  credit: { label: '📋 미결제', color: 'text-rodem-orange' },
  prepaid: { label: '💰 선불', color: 'text-rodem-purple' },
}

function getDateKey(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' })
}

export default function TodaySummaryInline() {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dateMode, setDateMode] = useState<DateMode>('single')
  const [date, setDate] = useState(today)
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const supabase = createSupabaseBrowser()

    let startISO: string
    let endISO: string | null = null

    if (dateMode === 'single') {
      const d = new Date(date)
      startISO = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
      endISO = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString()
    } else if (dateMode === 'range') {
      const df = new Date(dateFrom)
      const dt = new Date(dateTo)
      startISO = new Date(df.getFullYear(), df.getMonth(), df.getDate()).toISOString()
      endISO = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1).toISOString()
    } else {
      startISO = new Date(2024, 0, 1).toISOString()
    }

    let query = supabase
      .from('orders')
      .select('id, order_number, total_price, status, created_at, members(name), order_payments(method, amount), order_items(quantity, unit_price, menu_items(name))')
      .gte('created_at', startISO)
      .order('created_at', { ascending: false })

    if (endISO) query = query.lt('created_at', endISO)

    const { data } = await query
    if (data) setOrders(data as unknown as OrderRow[])
    setLoading(false)
  }, [dateMode, date, dateFrom, dateTo])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const totals = orders.reduce(
    (acc, o) => {
      if (o.status === 'cancelled') return acc
      o.order_payments?.forEach((p) => {
        acc[p.method] = (acc[p.method] || 0) + p.amount
        acc.total += p.amount
      })
      return acc
    },
    { cash: 0, transfer: 0, credit: 0, prepaid: 0, total: 0 } as Record<string, number>
  )

  const activeOrders = orders.filter(o => o.status !== 'cancelled')

  // Date grouping for range/all mode
  const groupedOrders = useMemo(() => {
    if (dateMode === 'single') return null
    const groups: Record<string, OrderRow[]> = {}
    orders.forEach((o) => {
      const key = o.created_at.slice(0, 10)
      if (!groups[key]) groups[key] = []
      groups[key].push(o)
    })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [orders, dateMode])

  const titleLabel = dateMode === 'single'
    ? (date === today ? '오늘' : new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }))
    : dateMode === 'range' ? '기간' : '전체'

  if (loading) return <div className="text-center py-12 text-rodem-text-sub text-xl">불러오는 중...</div>

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold text-rodem-text mb-4">📊 {titleLabel} 정산</h3>

      {/* Date mode tabs */}
      <div className="flex rounded-rodem-sm overflow-hidden border border-rodem-border-light mb-3">
        {(['single', 'range', 'all'] as DateMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setDateMode(m)}
            className={cn(
              'flex-1 py-2 text-sm font-bold cursor-pointer border-none transition-colors',
              dateMode === m ? 'bg-rodem-gold text-white' : 'bg-white text-rodem-text-sub'
            )}
          >
            {m === 'single' ? '일별' : m === 'range' ? '기간' : '전체'}
          </button>
        ))}
      </div>

      {/* Date inputs */}
      <div className="flex gap-2 items-end flex-wrap mb-4">
        {dateMode === 'single' && (
          <div>
            <label className="text-sm text-rodem-text-sub block mb-1">날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="p-2 rounded-lg border border-rodem-border-light text-base" />
          </div>
        )}
        {dateMode === 'range' && (
          <>
            <div>
              <label className="text-sm text-rodem-text-sub block mb-1">시작일</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="p-2 rounded-lg border border-rodem-border-light text-base" />
            </div>
            <div>
              <label className="text-sm text-rodem-text-sub block mb-1">종료일</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="p-2 rounded-lg border border-rodem-border-light text-base" />
            </div>
          </>
        )}
        {dateMode !== 'all' && (
          <button onClick={fetchOrders}
            className="py-2 px-4 rounded-lg bg-rodem-gold text-white font-bold border-none cursor-pointer text-base">
            조회
          </button>
        )}
      </div>

      {/* Payment summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {['cash', 'transfer', 'credit', 'prepaid'].map((method) => (
          <div key={method} className="p-4 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
            <div className="text-lg text-rodem-text-sub mb-1">{METHOD_LABELS[method].label}</div>
            <div className={`text-2xl font-bold ${METHOD_LABELS[method].color}`}>
              {formatPrice(totals[method] || 0)}
            </div>
          </div>
        ))}
      </div>

      {/* Total banner */}
      <div className="bg-gradient-to-br from-[#4a4541] to-[#3a3632] text-white p-5 rounded-rodem-sm mb-4">
        <div className="text-lg opacity-70 mb-1">실 매출 (선불 제외)</div>
        <div className="text-[32px] font-bold">{formatPrice(totals.total - (totals.prepaid || 0))}</div>
        <div className="text-lg opacity-70 mt-1">
          {activeOrders.length}건 · 총 주문 {formatPrice(totals.total)}
        </div>
      </div>

      <button
        onClick={() => router.push('/dashboard')}
        className="w-full py-3 mb-6 rounded-rodem-sm border border-rodem-gold bg-rodem-gold-light text-rodem-gold font-bold text-lg cursor-pointer"
      >
        📊 상세 대시보드 보기 →
      </button>

      {/* Order list */}
      <h4 className="font-bold text-2xl text-rodem-text mb-4">주문 내역 ({orders.length}건)</h4>
      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pb-20">
        {groupedOrders ? (
          // Date-grouped view (range/all mode)
          groupedOrders.map(([dateKey, dayOrders]) => {
            const dayLabel = getDateKey(dateKey + 'T00:00:00')
            const dayTotal = dayOrders.filter(o => o.status !== 'cancelled')
              .reduce((s, o) => s + o.total_price, 0)
            return (
              <div key={dateKey}>
                <div className="flex items-center justify-between py-2 px-1 border-b border-rodem-border-light mb-2">
                  <span className="text-lg font-bold text-rodem-text">{dayLabel}</span>
                  <span className="text-lg font-bold text-rodem-gold">{formatPrice(dayTotal)} · {dayOrders.length}건</span>
                </div>
                <div className="space-y-2 mb-4">
                  {dayOrders.map((order) => <OrderCard key={order.id} order={order} />)}
                </div>
              </div>
            )
          })
        ) : (
          // Single day view
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
        {orders.length === 0 && (
          <div className="text-center py-8 text-rodem-text-sub text-xl">주문이 없습니다</div>
        )}
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: OrderRow }) {
  const isCancelled = order.status === 'cancelled'
  const methods = order.order_payments?.map(p => p.method) || []
  const menuStr = order.order_items?.map(i =>
    `${(i.menu_items as unknown as { name: string })?.name || ''}x${i.quantity}`
  ).join(', ') || ''

  return (
    <div className={cn(
      'p-4 rounded-rodem-sm bg-rodem-card border border-rodem-border-light',
      isCancelled && 'opacity-50'
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[28px] font-bold text-rodem-text">#{order.order_number}</span>
          <span className="text-[28px] font-bold text-rodem-text">
            {(order.members as unknown as { name: string })?.name || '알수없음'}
          </span>
          {isCancelled && (
            <span className="text-lg font-bold text-rodem-red bg-red-50 px-2 py-0.5 rounded-full">반려</span>
          )}
        </div>
        <div className={cn('text-[28px] font-bold', isCancelled ? 'text-rodem-text-sub line-through' : 'text-rodem-text')}>
          {formatPrice(order.total_price)}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl text-rodem-text-sub">
          {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        {methods.map((m, i) => {
          const tag = METHOD_TAG[m]
          return tag ? (
            <span key={i} className={cn('text-lg font-bold px-3 py-0.5 rounded-full', tag.bg, tag.text)}>
              {tag.label}
            </span>
          ) : null
        })}
      </div>
      {menuStr && <div className="text-xl text-rodem-text-sub">{menuStr}</div>}
    </div>
  )
}
