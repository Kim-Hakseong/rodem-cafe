'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { formatPrice, cn } from '@/lib/utils'
import Modal from '@/components/ui/Modal'

interface TodaySummaryProps {
  onClose: () => void
}

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

const METHOD_TAG: Record<string, { label: string; bg: string; text: string }> = {
  cash: { label: '현금', bg: 'bg-rodem-green-light', text: 'text-rodem-green' },
  transfer: { label: '이체', bg: 'bg-rodem-blue-light', text: 'text-rodem-blue' },
  credit: { label: '미결제', bg: 'bg-rodem-orange-light', text: 'text-rodem-orange' },
  prepaid: { label: '선불', bg: 'bg-[#f0ebfa]', text: 'text-rodem-purple' },
}

export default function TodaySummary({ onClose }: TodaySummaryProps) {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createSupabaseBrowser()
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()

      const { data } = await supabase
        .from('orders')
        .select('id, order_number, total_price, status, created_at, members(name), order_payments(method, amount), order_items(quantity, unit_price, menu_items(name))')
        .gte('created_at', todayStart)
        .order('order_number', { ascending: true })

      if (data) setOrders(data as unknown as OrderRow[])
      setLoading(false)
    }
    fetchOrders()
  }, [])

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

  const methodLabels: Record<string, { label: string; color: string }> = {
    cash: { label: '💵 현금', color: 'text-rodem-green' },
    transfer: { label: '🏦 이체', color: 'text-rodem-blue' },
    credit: { label: '📋 미결제', color: 'text-rodem-orange' },
    prepaid: { label: '💰 선불', color: 'text-rodem-purple' },
  }

  const activeOrders = orders.filter(o => o.status !== 'cancelled')

  return (
    <Modal isOpen onClose={onClose} title="📊 오늘 정산" maxWidth="max-w-lg">
      {loading ? (
        <div className="text-center py-8 text-rodem-text-sub text-xl">불러오는 중...</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['cash', 'transfer', 'credit', 'prepaid'].map((method) => (
              <div key={method} className="p-4 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                <div className="text-lg text-rodem-text-sub mb-1">{methodLabels[method].label}</div>
                <div className={`text-2xl font-bold ${methodLabels[method].color}`}>
                  {formatPrice(totals[method] || 0)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-[#4a4541] to-[#3a3632] text-white p-5 rounded-rodem-sm mb-6">
            <div className="text-lg opacity-70 mb-1">오늘 실 매출 (선불 제외)</div>
            <div className="text-[32px] font-bold">{formatPrice(totals.total - (totals.prepaid || 0))}</div>
            <div className="text-lg opacity-70 mt-1">
              {activeOrders.length}건 · 총 주문 {formatPrice(totals.total)}
            </div>
          </div>

          {/* 오늘 전체 주문 */}
          <h4 className="font-bold text-2xl text-rodem-text mb-4">오늘 주문 전체 ({orders.length}건)</h4>
          <div className="max-h-[calc(100vh-520px)] overflow-y-auto space-y-3">
            {orders.map((order) => {
              const isCancelled = order.status === 'cancelled'
              const methods = order.order_payments?.map(p => p.method) || []
              const menuStr = order.order_items?.map(i =>
                `${(i.menu_items as unknown as { name: string })?.name || ''}x${i.quantity}`
              ).join(', ') || ''

              return (
                <div key={order.id} className={cn(
                  'p-4 rounded-rodem-sm bg-rodem-card border border-rodem-border-light',
                  isCancelled && 'opacity-50'
                )}>
                  {/* 상단: 번호 + 이름 + 금액 */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[28px] font-bold text-rodem-text">
                        #{order.order_number}
                      </span>
                      <span className="text-[28px] font-bold text-rodem-text">
                        {(order.members as unknown as { name: string })?.name || '알수없음'}
                      </span>
                      {isCancelled && (
                        <span className="text-lg font-bold text-rodem-red bg-red-50 px-2 py-0.5 rounded-full">반려</span>
                      )}
                    </div>
                    <div className={cn(
                      'text-[28px] font-bold',
                      isCancelled ? 'text-rodem-text-sub line-through' : 'text-rodem-text'
                    )}>
                      {formatPrice(order.total_price)}
                    </div>
                  </div>

                  {/* 중단: 시간 + 결제수단 태그 */}
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

                  {/* 하단: 메뉴 */}
                  {menuStr && (
                    <div className="text-xl text-rodem-text-sub">{menuStr}</div>
                  )}
                </div>
              )
            })}
            {orders.length === 0 && (
              <div className="text-center py-8 text-rodem-text-sub text-xl">오늘 주문이 없습니다</div>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}
