'use client'

import { useState, useCallback } from 'react'
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
  order_payments: PaymentRecord[]
}

const METHODS = ['cash', 'transfer', 'credit', 'prepaid'] as const
const METHOD_LABELS: Record<string, string> = {
  cash: '현금', transfer: '이체', credit: '외상', prepaid: '선불'
}
const METHOD_COLORS: Record<string, string> = {
  cash: 'text-rodem-green', transfer: 'text-rodem-blue', credit: 'text-rodem-orange', prepaid: 'text-rodem-purple'
}

export default function PaymentEditor() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null)
  const [editMethod, setEditMethod] = useState('')
  const [editAmount, setEditAmount] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ date })
      if (search) params.set('member', search)
      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [date, search])

  const startEdit = (payment: PaymentRecord) => {
    setEditingPayment(payment)
    setEditMethod(payment.method)
    setEditAmount(String(payment.amount))
  }

  const saveEdit = async () => {
    if (!editingPayment) return
    const res = await fetch('/api/admin/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: editingPayment.id,
        method: editMethod,
        amount: parseInt(editAmount),
      }),
    })
    if (res.ok) {
      setEditingPayment(null)
      fetchOrders()
    }
  }

  const deletePayment = async (paymentId: string) => {
    if (!confirm('이 결제 기록을 삭제하시겠습니까?')) return
    const res = await fetch('/api/admin/payments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId }),
    })
    if (res.ok) fetchOrders()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 items-end flex-wrap">
        <div>
          <label className="text-sm text-rodem-text-sub block mb-1">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 rounded-lg border border-rodem-border-light text-base"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="text-sm text-rodem-text-sub block mb-1">성도명</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 검색"
            className="w-full p-2 rounded-lg border border-rodem-border-light text-base"
          />
        </div>
        <button
          onClick={fetchOrders}
          className="py-2 px-4 rounded-lg bg-rodem-gold text-white font-bold border-none cursor-pointer text-base"
        >
          조회
        </button>
      </div>

      {/* Orders with payments */}
      {loading ? (
        <div className="text-center py-8 text-rodem-text-sub">불러오는 중...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-rodem-text-sub">조회 버튼을 눌러주세요</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const memberName = (order.members as unknown as { name: string })?.name || '알 수 없음'
            return (
              <div key={order.id} className="bg-white rounded-rodem-sm border border-rodem-border-light p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-base text-rodem-text">
                    #{order.order_number} · {memberName}
                  </span>
                  <span className="text-sm text-rodem-text-sub">
                    {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Payment list */}
                <div className="space-y-1.5">
                  {order.order_payments?.map((p) => {
                    const isEditing = editingPayment?.id === p.id
                    return (
                      <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                        {isEditing ? (
                          <>
                            <select
                              value={editMethod}
                              onChange={(e) => setEditMethod(e.target.value)}
                              className="p-1.5 rounded border border-rodem-border-light text-sm flex-1"
                            >
                              {METHODS.map((m) => (
                                <option key={m} value={m}>{METHOD_LABELS[m]}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="p-1.5 rounded border border-rodem-border-light text-sm w-24"
                            />
                            <button onClick={saveEdit} className="text-sm text-rodem-green font-bold bg-transparent border-none cursor-pointer">
                              저장
                            </button>
                            <button onClick={() => setEditingPayment(null)} className="text-sm text-rodem-text-sub bg-transparent border-none cursor-pointer">
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <span className={cn('font-semibold text-base flex-1', METHOD_COLORS[p.method] || '')}>
                              {METHOD_LABELS[p.method] || p.method}
                            </span>
                            <span className="text-base font-bold">{formatPrice(p.amount)}</span>
                            <button onClick={() => startEdit(p)} className="text-sm text-rodem-blue bg-transparent border-none cursor-pointer font-semibold">
                              수정
                            </button>
                            <button onClick={() => deletePayment(p.id)} className="text-sm text-rodem-red bg-transparent border-none cursor-pointer font-semibold">
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
