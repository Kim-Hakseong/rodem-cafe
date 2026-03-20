'use client'

import { useState, useCallback, useMemo } from 'react'
import { cn, formatPrice } from '@/lib/utils'

type PaymentRecord = {
  id: string
  method: string
  amount: number
  transfer_status: string | null
}

type OrderRecord = {
  id: string
  order_number: number
  status: string
  total_price: number
  created_at: string
  members: { name: string } | null
  order_items: { id: string; quantity: number; unit_price: number; menu_items: { name: string } | null }[]
  order_payments: PaymentRecord[]
}

type DateMode = 'single' | 'range' | 'all'

const METHOD_LABELS: Record<string, string> = {
  cash: '현금', transfer: '이체', credit: '외상', prepaid: '선불'
}
const METHOD_COLORS: Record<string, string> = {
  cash: 'text-rodem-green', transfer: 'text-rodem-blue', credit: 'text-rodem-orange', prepaid: 'text-rodem-purple'
}
const STATUS_LABELS: Record<string, string> = {
  pending: '대기', completed: '완료', cancelled: '반려'
}
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-rodem-gold-light text-rodem-gold',
  completed: 'bg-rodem-green-light text-rodem-green',
  cancelled: 'bg-red-50 text-rodem-red'
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}.${d.getDate()} (${['일','월','화','수','목','금','토'][d.getDay()]})`
}

function getDateKey(created_at: string): string {
  return new Date(created_at).toISOString().slice(0, 10)
}

export default function OrderManager() {
  const today = new Date().toISOString().slice(0, 10)
  const [dateMode, setDateMode] = useState<DateMode>('single')
  const [date, setDate] = useState(today)
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const showDateGroups = dateMode !== 'single'

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateMode === 'single') {
        params.set('date', date)
      } else if (dateMode === 'range') {
        params.set('dateFrom', dateFrom)
        params.set('dateTo', dateTo)
      }
      if (search) params.set('member', search)
      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [dateMode, date, dateFrom, dateTo, search])

  // Group orders by date
  const groupedOrders = useMemo(() => {
    if (!showDateGroups) return null
    const groups: Record<string, OrderRecord[]> = {}
    orders.forEach((o) => {
      const key = getDateKey(o.created_at)
      if (!groups[key]) groups[key] = []
      groups[key].push(o)
    })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [orders, showDateGroups])

  const handleCancel = async (orderId: string) => {
    if (!confirm('이 주문을 반려하시겠습니까?')) return
    const res = await fetch('/api/orders/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
    if (res.ok) fetchOrders()
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('이 주문을 완전히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return
    const res = await fetch('/api/admin/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
    if (res.ok) fetchOrders()
  }

  const handleStatusChange = async (orderId: string, status: string) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    })
    if (res.ok) fetchOrders()
  }

  const renderOrder = (order: OrderRecord) => {
    const memberName = (order.members as unknown as { name: string })?.name || '알 수 없음'
    const isExpanded = expanded === order.id

    return (
      <div key={order.id} className="bg-white rounded-rodem-sm border border-rodem-border-light overflow-hidden">
        <button
          onClick={() => setExpanded(isExpanded ? null : order.id)}
          className="w-full p-3 flex items-center justify-between text-left cursor-pointer bg-transparent border-none"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-bold text-base text-rodem-text shrink-0">#{order.order_number}</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-bold shrink-0', STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-500')}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
            <span className="text-base text-rodem-text truncate">{memberName}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-base text-rodem-text">{formatPrice(order.total_price)}</span>
            <span className="text-xs text-rodem-text-sub">
              {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-rodem-text-sub">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-rodem-border-light p-3 space-y-3">
            <div>
              <div className="text-sm font-bold text-rodem-text-sub mb-1">메뉴</div>
              {order.order_items?.map((item, i) => (
                <div key={i} className="flex justify-between text-base">
                  <span>{(item.menu_items as unknown as { name: string })?.name} x{item.quantity}</span>
                  <span className="text-rodem-text-sub">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-sm font-bold text-rodem-text-sub mb-1">결제</div>
              {order.order_payments?.map((p) => (
                <div key={p.id} className="flex justify-between text-base">
                  <span className={METHOD_COLORS[p.method] || ''}>
                    {METHOD_LABELS[p.method] || p.method}
                    {p.transfer_status && ` (${p.transfer_status})`}
                  </span>
                  <span>{formatPrice(p.amount)}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              {order.status === 'pending' && (
                <>
                  <button onClick={() => handleStatusChange(order.id, 'completed')} className="flex-1 py-2 rounded-lg bg-rodem-green-light border border-rodem-green text-rodem-green text-sm font-bold cursor-pointer">
                    완료 처리
                  </button>
                  <button onClick={() => handleCancel(order.id)} className="flex-1 py-2 rounded-lg bg-red-50 border border-rodem-red text-rodem-red text-sm font-bold cursor-pointer">
                    반려
                  </button>
                </>
              )}
              {order.status === 'cancelled' && (
                <button onClick={() => handleStatusChange(order.id, 'pending')} className="flex-1 py-2 rounded-lg bg-rodem-gold-light border border-rodem-gold text-rodem-gold text-sm font-bold cursor-pointer">
                  대기로 복원
                </button>
              )}
              <button onClick={() => handleDelete(order.id)} className="py-2 px-4 rounded-lg bg-red-50 border border-rodem-red text-rodem-red text-sm font-bold cursor-pointer">
                삭제
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Date mode tabs */}
      <div className="flex rounded-rodem-sm overflow-hidden border border-rodem-border-light">
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

      {/* Filters */}
      <div className="flex gap-2 items-end flex-wrap">
        {dateMode === 'single' && (
          <div>
            <label className="text-sm text-rodem-text-sub block mb-1">날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 rounded-lg border border-rodem-border-light text-base" />
          </div>
        )}
        {dateMode === 'range' && (
          <>
            <div>
              <label className="text-sm text-rodem-text-sub block mb-1">시작일</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="p-2 rounded-lg border border-rodem-border-light text-base" />
            </div>
            <div>
              <label className="text-sm text-rodem-text-sub block mb-1">종료일</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="p-2 rounded-lg border border-rodem-border-light text-base" />
            </div>
          </>
        )}
        <div className="flex-1 min-w-[100px]">
          <label className="text-sm text-rodem-text-sub block mb-1">성도명</label>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름 검색" className="w-full p-2 rounded-lg border border-rodem-border-light text-base" />
        </div>
        <button onClick={fetchOrders} className="py-2 px-4 rounded-lg bg-rodem-gold text-white font-bold border-none cursor-pointer text-base">
          조회
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-8 text-rodem-text-sub">불러오는 중...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-rodem-text-sub">조회 버튼을 눌러주세요</div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-rodem-text-sub text-right">총 {orders.length}건</div>

          {showDateGroups && groupedOrders ? (
            groupedOrders.map(([dateKey, dateOrders]) => (
              <div key={dateKey}>
                <div className="sticky top-0 z-10 bg-rodem-bg py-2 px-1 flex items-center gap-2">
                  <div className="h-px flex-1 bg-rodem-border-light" />
                  <span className="text-base font-bold text-rodem-gold shrink-0">
                    {formatDateLabel(dateKey)}
                  </span>
                  <span className="text-sm text-rodem-text-sub shrink-0">{dateOrders.length}건</span>
                  <div className="h-px flex-1 bg-rodem-border-light" />
                </div>
                <div className="space-y-2">
                  {dateOrders.map(renderOrder)}
                </div>
              </div>
            ))
          ) : (
            orders.map(renderOrder)
          )}
        </div>
      )}
    </div>
  )
}
