'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { cn, formatPrice } from '@/lib/utils'

interface OrderQueueProps {
  isOpen: boolean
  onToggle: () => void
  refreshTrigger: number
  mode: 'staff' | 'customer'
}

type QueuePayment = {
  id: string
  method: string
  amount: number
  transfer_status: string | null
}

type QueueOrder = {
  id: string
  order_number: number
  status: string
  total_price: number
  created_at: string
  completed_at: string | null
  members: { name: string } | null
  order_items: { quantity: number; menu_items: { name: string } | null }[]
  order_payments: QueuePayment[]
}

export default function OrderQueue({ isOpen, onToggle, refreshTrigger, mode }: OrderQueueProps) {
  const [orders, setOrders] = useState<QueueOrder[]>([])
  const [showCompleted, setShowCompleted] = useState(true)
  const isStaff = mode === 'staff'

  const fetchOrders = useCallback(async () => {
    const supabase = createSupabaseBrowser()
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()

    const { data } = await supabase
      .from('orders')
      .select('id, order_number, status, total_price, created_at, completed_at, members(name), order_items(quantity, menu_items(name)), order_payments(id, method, amount, transfer_status)')
      .gte('created_at', todayStart)
      .order('created_at', { ascending: false })
      .limit(30)

    if (data) setOrders(data as unknown as QueueOrder[])
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders, refreshTrigger])

  useEffect(() => {
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const handleComplete = async (orderId: string) => {
    try {
      const res = await fetch('/api/orders/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      if (res.ok) fetchOrders()
    } catch { /* silent */ }
  }

  const handleTransferAction = async (paymentId: string, action: 'confirmed' | 'unpaid') => {
    try {
      const res = await fetch('/api/orders/transfer-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action }),
      })
      if (res.ok) fetchOrders()
    } catch { /* silent */ }
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const completedOrders = orders.filter((o) => o.status === 'completed')
  const pendingCount = pendingOrders.length

  // Collapsed tab
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="w-10 flex-shrink-0 bg-gradient-to-b from-[#4a4541] to-[#3a3632] text-white flex flex-col items-center justify-center gap-1.5 cursor-pointer border-none border-r border-rodem-border"
      >
        <span className="text-base">📋</span>
        {pendingCount > 0 && (
          <span className="w-6 h-6 rounded-full bg-rodem-gold text-white text-sm font-bold flex items-center justify-center">
            {pendingCount}
          </span>
        )}
        <span className="text-sm font-bold" style={{ writingMode: 'vertical-rl' }}>
          대기
        </span>
      </button>
    )
  }

  return (
    <div className="w-[340px] flex-shrink-0 bg-rodem-card border-r border-rodem-border-light flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 bg-gradient-to-br from-[#4a4541] to-[#3a3632] text-white">
        <div>
          <div className="text-base font-bold">📋 주문 대기열</div>
          <div className="text-sm opacity-70">
            대기 {pendingCount}건 · 완료 {completedOrders.length}건
          </div>
        </div>
        <button onClick={onToggle} className="bg-white/10 border-none text-white w-8 h-8 rounded-lg text-base cursor-pointer">
          ✕
        </button>
      </div>

      {/* Orders list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {/* Pending orders */}
        {pendingOrders.map((order) => {
          const transferPayment = order.order_payments?.find(
            (p) => p.method === 'transfer' && p.transfer_status === 'pending'
          )

          return (
            <div key={order.id} className="bg-white rounded-rodem-sm p-3.5 border-l-4 border-l-rodem-gold border border-rodem-border-light">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base font-bold text-rodem-text">#{order.order_number}</span>
                <span className="text-base px-2.5 py-0.5 rounded-full bg-rodem-gold-light text-rodem-gold font-bold">대기</span>
              </div>
              <div className="text-base text-rodem-text mb-1">
                {(order.members as unknown as { name: string })?.name}
                <span className="text-base text-rodem-text-sub ml-2">
                  {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-base text-rodem-text-sub mb-1.5">
                {order.order_items?.map((item, i) => (
                  <span key={i}>
                    {(item.menu_items as unknown as { name: string })?.name} ×{item.quantity}
                    {i < order.order_items.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
              <div className="text-base font-bold text-rodem-text mb-2">
                {formatPrice(order.total_price)}
              </div>

              {/* Transfer status indicator */}
              {transferPayment && (
                <div className="text-base text-rodem-blue font-semibold mb-2 px-2 py-1 bg-rodem-blue-light rounded-[8px]">
                  🏦 이체 {formatPrice(transferPayment.amount)} — 확인 대기
                </div>
              )}

              {/* Action buttons (staff only) */}
              {isStaff && (
                <div className="flex flex-col gap-1.5">
                  {transferPayment && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleTransferAction(transferPayment.id, 'confirmed')}
                        className="flex-1 py-2 rounded-[8px] bg-rodem-blue-light border border-rodem-blue text-rodem-blue text-base font-bold cursor-pointer"
                      >
                        입금 확인
                      </button>
                      <button
                        onClick={() => handleTransferAction(transferPayment.id, 'unpaid')}
                        className="flex-1 py-2 rounded-[8px] bg-rodem-orange-light border border-rodem-orange text-rodem-orange text-base font-bold cursor-pointer"
                      >
                        미납 (외상)
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleComplete(order.id)}
                    className="w-full py-2 rounded-[8px] bg-rodem-green-light border border-rodem-green text-rodem-green text-base font-bold cursor-pointer"
                  >
                    완료 처리
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Toggle completed */}
        {completedOrders.length > 0 && (
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full py-2 text-base text-rodem-text-sub bg-transparent border-none cursor-pointer"
          >
            {showCompleted ? '▼ 완료 주문 숨기기' : `▶ 완료 주문 보기 (${completedOrders.length}건)`}
          </button>
        )}

        {/* Completed orders */}
        {showCompleted && completedOrders.slice(0, 5).map((order) => (
          <div key={order.id} className={cn(
            'bg-white rounded-rodem-sm p-3.5 border-l-4 border-l-rodem-green border border-rodem-border-light opacity-50'
          )}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-base font-bold text-rodem-text">#{order.order_number}</span>
              <span className="text-base px-2.5 py-0.5 rounded-full bg-rodem-green-light text-rodem-green font-bold">완료</span>
            </div>
            <div className="text-base text-rodem-text-sub">
              {(order.members as unknown as { name: string })?.name} · {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-8 text-rodem-text-sub text-base">주문이 없습니다</div>
        )}
      </div>
    </div>
  )
}
