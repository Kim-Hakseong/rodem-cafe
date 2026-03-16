'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
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
        .select('id, order_number, total_price, status, created_at, members(name), order_payments(method, amount)')
        .gte('created_at', todayStart)
        .order('created_at', { ascending: false })

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
    credit: { label: '📋 외상', color: 'text-rodem-orange' },
    prepaid: { label: '💰 선불', color: 'text-rodem-purple' },
  }

  return (
    <Modal isOpen onClose={onClose} title="📊 오늘 정산" maxWidth="max-w-md">
      {loading ? (
        <div className="text-center py-8 text-rodem-text-sub">불러오는 중...</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['cash', 'transfer', 'credit', 'prepaid'].map((method) => (
              <div key={method} className="p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                <div className="text-xs text-rodem-text-sub mb-1">{methodLabels[method].label}</div>
                <div className={`text-lg font-bold ${methodLabels[method].color}`}>
                  {formatPrice(totals[method] || 0)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-[#4a4541] to-[#3a3632] text-white p-4 rounded-rodem-sm mb-6">
            <div className="text-xs opacity-70 mb-1">오늘 총 매출</div>
            <div className="text-2xl font-bold">{formatPrice(totals.total)}</div>
            <div className="text-xs opacity-70 mt-1">{orders.filter(o => o.status !== 'cancelled').length}건</div>
          </div>

          {/* Recent orders */}
          <h4 className="font-bold text-sm text-rodem-text mb-3">최근 주문</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                <div>
                  <div className="text-sm font-semibold text-rodem-text">
                    #{order.order_number} {(order.members as unknown as { name: string })?.name}
                  </div>
                  <div className="text-xs text-rodem-text-sub">
                    {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-sm font-bold text-rodem-text">{formatPrice(order.total_price)}</div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-4 text-rodem-text-sub text-sm">오늘 주문이 없습니다</div>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}
