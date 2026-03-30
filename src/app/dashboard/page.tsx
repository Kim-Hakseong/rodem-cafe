'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { formatPrice, cn } from '@/lib/utils'
import Header from '@/components/ui/Header'
import PinInput from '@/components/ui/PinInput'
import Modal from '@/components/ui/Modal'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import ExcelJS from 'exceljs'

type OrderData = {
  id: string
  total_price: number
  status: string
  created_at: string
  member_id: string
  order_payments: { method: string; amount: number }[]
  order_items: { quantity: number; unit_price: number; menu_items: { name: string; category: string } | null }[]
  members: { name: string } | null
}

type ExpenseItem = {
  id: string
  name: string
  default_price: number
  unit_desc: string | null
  is_active: boolean
  sort_order: number
}

type Expense = {
  id: string
  expense_item_id: string | null
  name: string
  amount: number
  quantity: number
  memo: string | null
  recorded_at: string
}

type MemberBalance = {
  id: string
  name: string
  department: string | null
  credit_balance: number
  prepaid_balance: number
}

const TABS = ['전체', '오늘', '월간', '고객별', '지출', 'Export'] as const
const METHOD_LABELS: Record<string, string> = { cash: '현금', transfer: '이체', credit: '미결제', prepaid: '선불' }
const METHOD_COLORS: Record<string, string> = { cash: '#5a9a6e', transfer: '#4a7fd4', credit: '#d49a4a', prepaid: '#7c5fbf' }
const METHODS = ['cash', 'transfer', 'credit', 'prepaid'] as const

function getDateRange(tab: string): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (tab === '오늘') {
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    return { start: today, end: now, prevStart: yesterday, prevEnd: today }
  }
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return { start: monthStart, end: now, prevStart: prevMonthStart, prevEnd: monthStart }
}

function calcChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%'
  const pct = ((current - previous) / previous) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`
}

export default function DashboardPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [tab, setTab] = useState<typeof TABS[number]>('전체')
  const [orders, setOrders] = useState<OrderData[]>([])
  const [prevOrders, setPrevOrders] = useState<OrderData[]>([])
  const [allOrders, setAllOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<'전체' | '오전' | '오후'>('전체')

  // Expense states
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expItemModal, setExpItemModal] = useState(false)
  const [expRecordModal, setExpRecordModal] = useState(false)
  const [editExpItem, setEditExpItem] = useState<ExpenseItem | null>(null)
  const [expItemForm, setExpItemForm] = useState({ name: '', default_price: '', unit_desc: '' })
  const [expForm, setExpForm] = useState({ expense_item_id: '', name: '', amount: '', quantity: '1', memo: '', recorded_at: new Date().toISOString().split('T')[0] })
  const [submitting, setSubmitting] = useState(false)

  // Balance states (for export)
  const [memberBalances, setMemberBalances] = useState<MemberBalance[]>([])

  const handlePinComplete = useCallback(async (pin: string) => {
    const res = await fetch('/api/pin/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, type: 'admin' }),
    })
    if (res.ok) { setAuthenticated(true); setPinError(false) } else setPinError(true)
  }, [])

  const fetchOrders = useCallback(async (start: Date, end: Date): Promise<OrderData[]> => {
    const supabase = createSupabaseBrowser()
    const { data } = await supabase
      .from('orders')
      .select('id, total_price, status, created_at, member_id, order_payments(method, amount), order_items(quantity, unit_price, menu_items(name, category)), members(name)')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: false })
    return (data || []) as unknown as OrderData[]
  }, [])

  const fetchAllOrders = useCallback(async () => {
    const supabase = createSupabaseBrowser()
    const { data } = await supabase
      .from('orders')
      .select('id, total_price, status, created_at, member_id, order_payments(method, amount), order_items(quantity, unit_price, menu_items(name, category)), members(name)')
      .order('created_at', { ascending: false })
      .limit(5000)
    if (data) setAllOrders(data as unknown as OrderData[])
  }, [])

  const fetchExpenseItems = useCallback(async () => {
    const res = await fetch('/api/expenses/items')
    if (res.ok) setExpenseItems(await res.json())
  }, [])

  const fetchExpenses = useCallback(async () => {
    const res = await fetch('/api/expenses')
    if (res.ok) setExpenses(await res.json())
  }, [])

  const fetchBalances = useCallback(async () => {
    const supabase = createSupabaseBrowser()
    const { data } = await supabase
      .from('member_balances')
      .select('id, name, department, credit_balance, prepaid_balance')
      .order('name')
    if (data) setMemberBalances(data as MemberBalance[])
  }, [])

  useEffect(() => {
    if (!authenticated) return
    const load = async () => {
      setLoading(true)
      const { start, end, prevStart, prevEnd } = getDateRange(tab)
      const [current, prev] = await Promise.all([fetchOrders(start, end), fetchOrders(prevStart, prevEnd)])
      setOrders(current)
      setPrevOrders(prev)
      setLoading(false)
    }
    load()
    fetchAllOrders()
    fetchExpenseItems()
    fetchExpenses()
    fetchBalances()
  }, [authenticated, tab, fetchOrders, fetchAllOrders, fetchExpenseItems, fetchExpenses, fetchBalances])

  // Time filter
  const filterByTime = useCallback((list: OrderData[]) => {
    if (timeFilter === '전체') return list
    return list.filter((o) => {
      const hour = new Date(o.created_at).getHours()
      return timeFilter === '오전' ? hour < 12 : hour >= 12
    })
  }, [timeFilter])

  const filteredOrders = useMemo(() => filterByTime(orders), [orders, filterByTime])
  const filteredPrevOrders = useMemo(() => filterByTime(prevOrders), [prevOrders, filterByTime])

  // Summary
  const summary = useMemo(() => {
    const s = { cash: 0, transfer: 0, credit: 0, prepaid: 0, total: 0, count: 0 }
    filteredOrders.forEach((o) => {
      s.count++
      o.order_payments?.forEach((p) => {
        if (p.method in s) s[p.method as keyof Omit<typeof s, 'total' | 'count'>] += p.amount
        s.total += p.amount
      })
    })
    return s
  }, [filteredOrders])

  const prevSummary = useMemo(() => {
    const s = { cash: 0, transfer: 0, credit: 0, prepaid: 0, total: 0, count: 0 }
    filteredPrevOrders.forEach((o) => {
      s.count++
      o.order_payments?.forEach((p) => {
        if (p.method in s) s[p.method as keyof Omit<typeof s, 'total' | 'count'>] += p.amount
        s.total += p.amount
      })
    })
    return s
  }, [filteredPrevOrders])

  const pieData = useMemo(() =>
    METHODS.map((m) => ({ name: METHOD_LABELS[m], value: summary[m], color: METHOD_COLORS[m] })).filter((d) => d.value > 0)
  , [summary])

  const barData = useMemo(() =>
    METHODS.map((m) => ({ name: METHOD_LABELS[m], amount: summary[m], fill: METHOD_COLORS[m] }))
  , [summary])

  const lineData = useMemo(() => {
    const dayMap = new Map<string, number>()
    filteredOrders.forEach((o) => {
      const day = new Date(o.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      dayMap.set(day, (dayMap.get(day) || 0) + o.total_price)
    })
    return Array.from(dayMap.entries()).map(([date, total]) => ({ date, total }))
  }, [filteredOrders])

  const customerStats = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number; credit: number }>()
    allOrders.forEach((o) => {
      const name = (o.members as unknown as { name: string })?.name || '알수없음'
      const existing = map.get(o.member_id) || { name, total: 0, count: 0, credit: 0 }
      existing.total += o.total_price
      existing.count++
      o.order_payments?.forEach((p) => { if (p.method === 'credit') existing.credit += p.amount })
      map.set(o.member_id, existing)
    })
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.total - a.total)
  }, [allOrders])

  // --- Expense item handlers ---
  const openAddExpItem = () => {
    setEditExpItem(null)
    setExpItemForm({ name: '', default_price: '', unit_desc: '' })
    setExpItemModal(true)
  }
  const openEditExpItem = (item: ExpenseItem) => {
    setEditExpItem(item)
    setExpItemForm({ name: item.name, default_price: String(item.default_price), unit_desc: item.unit_desc || '' })
    setExpItemModal(true)
  }
  const handleExpItemSubmit = async () => {
    if (!expItemForm.name.trim() || !expItemForm.default_price) return
    setSubmitting(true)
    const payload = {
      name: expItemForm.name.trim(),
      default_price: Number(expItemForm.default_price),
      unit_desc: expItemForm.unit_desc.trim() || null,
      ...(editExpItem ? { id: editExpItem.id, is_active: editExpItem.is_active, sort_order: editExpItem.sort_order } : {}),
    }
    const res = await fetch('/api/expenses/items', {
      method: editExpItem ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) { setExpItemModal(false); fetchExpenseItems() }
    setSubmitting(false)
  }
  const toggleExpItem = async (item: ExpenseItem) => {
    await fetch('/api/expenses/items', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, is_active: !item.is_active }),
    })
    fetchExpenseItems()
  }

  // --- Expense record handlers ---
  const openAddExpense = () => {
    setExpForm({ expense_item_id: '', name: '', amount: '', quantity: '1', memo: '', recorded_at: new Date().toISOString().split('T')[0] })
    setExpRecordModal(true)
  }
  const handleExpItemSelect = (itemId: string) => {
    const item = expenseItems.find((e) => e.id === itemId)
    if (item) {
      setExpForm((p) => ({
        ...p,
        expense_item_id: itemId,
        name: item.name,
        amount: String(item.default_price * (Number(p.quantity) || 1)),
      }))
    }
  }
  const handleExpQtyChange = (qty: string) => {
    const item = expenseItems.find((e) => e.id === expForm.expense_item_id)
    setExpForm((p) => ({
      ...p,
      quantity: qty,
      amount: item ? String(item.default_price * (Number(qty) || 1)) : p.amount,
    }))
  }
  const handleExpenseSubmit = async () => {
    if (!expForm.name.trim() || !expForm.amount) return
    setSubmitting(true)
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expense_item_id: expForm.expense_item_id || null,
        name: expForm.name.trim(),
        amount: Number(expForm.amount),
        quantity: Number(expForm.quantity) || 1,
        memo: expForm.memo.trim() || null,
        recorded_at: expForm.recorded_at,
      }),
    })
    if (res.ok) { setExpRecordModal(false); fetchExpenses() }
    setSubmitting(false)
  }
  const handleDeleteExpense = async (id: string) => {
    if (!confirm('이 지출 내역을 삭제하시겠습니까?')) return
    await fetch('/api/expenses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchExpenses()
  }

  // --- Export (8 sheets with exceljs) ---
  const handleExport = async () => {
    const wb = new ExcelJS.Workbook()
    const grayFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDDDDD' } }
    const yellowFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
    const headerFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E3DA' } }
    const headerFont: Partial<ExcelJS.Font> = { bold: true }

    const styleHeaders = (ws: ExcelJS.Worksheet) => {
      const row = ws.getRow(1)
      row.eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont })
    }

    // Sheet 1: 전체주문 (with colors)
    const ws1 = wb.addWorksheet('전체주문')
    ws1.columns = [
      { header: '날짜', key: 'date', width: 12 },
      { header: '시간', key: 'time', width: 10 },
      { header: '성도', key: 'member', width: 12 },
      { header: '금액', key: 'amount', width: 12 },
      { header: '결제', key: 'payment', width: 14 },
      { header: '메뉴', key: 'menu', width: 30 },
    ]
    allOrders.forEach((o) => {
      const d = new Date(o.created_at)
      const isAfternoon = d.getHours() >= 12
      const paymentStr = o.order_payments?.map((p) => METHOD_LABELS[p.method]).join('+') || ''
      const hasTransfer = o.order_payments?.some((p) => p.method === 'transfer')
      const row = ws1.addRow({
        date: d.toLocaleDateString('ko-KR'),
        time: d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        member: (o.members as unknown as { name: string })?.name || '',
        amount: o.total_price,
        payment: paymentStr,
        menu: o.order_items?.map((i) => `${(i.menu_items as unknown as { name: string })?.name}x${i.quantity}`).join(', ') || '',
      })
      if (isAfternoon) row.eachCell((cell) => { cell.fill = grayFill })
      if (hasTransfer) row.getCell('payment').fill = yellowFill
    })
    styleHeaders(ws1)

    // Sheet 2: 월별
    const ws2 = wb.addWorksheet('월별')
    ws2.columns = [
      { header: '월', key: 'month', width: 16 },
      { header: '현금', key: 'cash', width: 12 },
      { header: '이체', key: 'transfer', width: 12 },
      { header: '미결제', key: 'credit', width: 12 },
      { header: '선불', key: 'prepaid', width: 12 },
      { header: '실매출', key: 'realTotal', width: 12 },
      { header: '주문수', key: 'count', width: 8 },
    ]
    const monthMap = new Map<string, { cash: number; transfer: number; credit: number; prepaid: number; total: number; count: number }>()
    allOrders.forEach((o) => {
      const key = new Date(o.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
      const existing = monthMap.get(key) || { cash: 0, transfer: 0, credit: 0, prepaid: 0, total: 0, count: 0 }
      existing.count++
      o.order_payments?.forEach((p) => {
        if (p.method in existing) (existing as Record<string, number>)[p.method] += p.amount
        existing.total += p.amount
      })
      monthMap.set(key, existing)
    })
    monthMap.forEach((v, month) => {
      const row = ws2.addRow({ month, cash: v.cash, transfer: v.transfer, credit: v.credit, prepaid: v.prepaid, realTotal: v.total - v.prepaid, count: v.count })
      row.getCell('transfer').fill = yellowFill
    })
    styleHeaders(ws2)

    // Sheet 3: 고객별
    const ws3 = wb.addWorksheet('고객별')
    ws3.columns = [
      { header: '이름', key: 'name', width: 12 },
      { header: '총액', key: 'total', width: 12 },
      { header: '주문수', key: 'count', width: 8 },
      { header: '미결제', key: 'credit', width: 12 },
    ]
    customerStats.forEach((c) => ws3.addRow({ name: c.name, total: c.total, count: c.count, credit: c.credit }))
    styleHeaders(ws3)

    // Sheet 4: 메뉴별
    const ws4 = wb.addWorksheet('메뉴별')
    ws4.columns = [
      { header: '메뉴', key: 'menu', width: 20 },
      { header: '판매수', key: 'count', width: 10 },
      { header: '매출', key: 'revenue', width: 12 },
    ]
    const menuMap = new Map<string, { count: number; revenue: number }>()
    allOrders.forEach((o) => o.order_items?.forEach((i) => {
      const name = (i.menu_items as unknown as { name: string })?.name || '알수없음'
      const existing = menuMap.get(name) || { count: 0, revenue: 0 }
      existing.count += i.quantity || 1
      existing.revenue += i.unit_price * (i.quantity || 1)
      menuMap.set(name, existing)
    }))
    Array.from(menuMap.entries())
      .map(([name, v]) => ({ menu: name, count: v.count, revenue: v.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .forEach((r) => ws4.addRow(r))
    styleHeaders(ws4)

    // Sheet 5: 회계보고
    const ws5 = wb.addWorksheet('회계보고')
    ws5.columns = [
      { header: '월', key: 'month', width: 8 },
      { header: '수입', key: 'income', width: 12 },
      { header: '지출합계', key: 'expense', width: 12 },
      { header: '차액', key: 'diff', width: 12 },
      { header: '지출내역', key: 'detail', width: 40 },
    ]
    const year = new Date().getFullYear()
    for (let m = 0; m < 12; m++) {
      const monthOrders = allOrders.filter((o) => { const d = new Date(o.created_at); return d.getFullYear() === year && d.getMonth() === m })
      const prepaidTotal = monthOrders.reduce((s, o) => s + (o.order_payments?.filter(p => p.method === 'prepaid').reduce((ps, p) => ps + p.amount, 0) || 0), 0)
      const income = monthOrders.reduce((s, o) => s + o.total_price, 0) - prepaidTotal
      const monthExpenses = expenses.filter((e) => { const d = new Date(e.recorded_at); return d.getFullYear() === year && d.getMonth() === m })
      const expenseTotal = monthExpenses.reduce((s, e) => s + e.amount, 0)
      const detail = monthExpenses.map((e) => `${e.name}${e.quantity > 1 ? ` ${e.quantity}개` : ''} ${formatPrice(e.amount)}`).join(', ')
      ws5.addRow({ month: `${m + 1}월`, income, expense: expenseTotal, diff: income - expenseTotal, detail })
    }
    styleHeaders(ws5)

    // Sheet 6: 주간수입상세
    const ws6 = wb.addWorksheet('주간수입상세')
    ws6.columns = [
      { header: '날짜', key: 'date', width: 14 },
      { header: '현금', key: 'cash', width: 12 },
      { header: '이체', key: 'transfer', width: 12 },
      { header: '미결제', key: 'credit', width: 12 },
      { header: '선불', key: 'prepaid', width: 12 },
      { header: '실매출', key: 'realTotal', width: 12 },
      { header: '주문수', key: 'count', width: 8 },
    ]
    const sundayMap = new Map<string, { cash: number; transfer: number; credit: number; prepaid: number; total: number; count: number }>()
    allOrders.forEach((o) => {
      const d = new Date(o.created_at)
      if (d.getDay() !== 0) return
      const key = d.toLocaleDateString('ko-KR')
      const existing = sundayMap.get(key) || { cash: 0, transfer: 0, credit: 0, prepaid: 0, total: 0, count: 0 }
      existing.count++
      o.order_payments?.forEach((p) => {
        if (p.method in existing) (existing as Record<string, number>)[p.method] += p.amount
        existing.total += p.amount
      })
      sundayMap.set(key, existing)
    })
    sundayMap.forEach((v, date) => {
      const row = ws6.addRow({ date, cash: v.cash, transfer: v.transfer, credit: v.credit, prepaid: v.prepaid, realTotal: v.total - v.prepaid, count: v.count })
      row.getCell('transfer').fill = yellowFill
    })
    styleHeaders(ws6)

    // Sheet 7: 미결제현황
    const ws7 = wb.addWorksheet('미결제현황')
    ws7.columns = [
      { header: '이름', key: 'name', width: 12 },
      { header: '부서', key: 'dept', width: 12 },
      { header: '미결제잔액', key: 'balance', width: 12 },
    ]
    memberBalances.filter((m) => m.credit_balance > 0).forEach((m) =>
      ws7.addRow({ name: m.name, dept: m.department || '', balance: m.credit_balance })
    )
    styleHeaders(ws7)

    // Sheet 8: 선불잔액현황
    const ws8 = wb.addWorksheet('선불잔액현황')
    ws8.columns = [
      { header: '이름', key: 'name', width: 12 },
      { header: '부서', key: 'dept', width: 12 },
      { header: '선불잔액', key: 'balance', width: 12 },
    ]
    memberBalances.filter((m) => m.prepaid_balance > 0).forEach((m) =>
      ws8.addRow({ name: m.name, dept: m.department || '', balance: m.prepaid_balance })
    )
    styleHeaders(ws8)

    // Download
    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `로뎀나무_정산_${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  // PIN screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] font-sans relative">
        <button onClick={() => router.push('/')} className="absolute top-4 left-4 bg-gradient-to-br from-[#f0ece4] to-[#e8e3da] border-none text-base text-rodem-text-sub cursor-pointer py-2 px-3.5 rounded-[10px]">← 뒤로</button>
        <div className="text-[42px] mb-4">📊</div>
        <h2 className="text-[24px] font-bold mb-2 text-rodem-text">정산 대시보드</h2>
        <p className="text-base text-rodem-text-sub mb-8">관리자 PIN을 입력하세요</p>
        {pinError && <p className="text-rodem-red text-base font-semibold mb-3">PIN이 틀렸습니다</p>}
        <PinInput onComplete={handlePinComplete} error={pinError} onReset={() => setPinError(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rodem-bg font-sans">
      <Header title="📊 정산 대시보드" onBack={() => router.push('/')} />

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 border-b border-rodem-border-light overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            'px-4 py-2 rounded-rodem-sm text-base font-semibold whitespace-nowrap cursor-pointer border',
            tab === t ? 'bg-rodem-gold text-white border-rodem-gold' : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light'
          )}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12 text-rodem-text-sub">불러오는 중...</div>

        ) : tab === '전체' ? (
          <>
            <div className="bg-gradient-to-br from-[#4a4541] to-[#3a3632] text-white p-4 rounded-rodem-sm mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm opacity-70 mb-1">전체 주문</div>
                  <div className="text-[26px] font-bold">{allOrders.length}건</div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-70 mb-1">총 매출</div>
                  <div className="text-[26px] font-bold">{formatPrice(allOrders.reduce((s, o) => s + o.total_price, 0))}</div>
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-sm">
                <span className="text-green-400">완료 {allOrders.filter(o => o.status === 'completed').length}건</span>
                <span className="text-yellow-400">대기 {allOrders.filter(o => o.status === 'pending').length}건</span>
                <span className="text-red-400">반려 {allOrders.filter(o => o.status === 'cancelled').length}건</span>
              </div>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
              {allOrders.map((o) => {
                const statusLabel = o.status === 'completed' ? '완료' : o.status === 'pending' ? '대기' : '반려'
                const statusColor = o.status === 'completed' ? 'bg-rodem-green-light text-rodem-green' : o.status === 'pending' ? 'bg-rodem-gold-light text-rodem-gold' : 'bg-red-50 text-rodem-red'
                const isCancelled = o.status === 'cancelled'
                return (
                  <div key={o.id} className={cn(
                    'flex items-center justify-between p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light',
                    isCancelled && 'opacity-50'
                  )}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-rodem-text">
                          {(o.members as unknown as { name: string })?.name || '알수없음'}
                        </span>
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', statusColor)}>{statusLabel}</span>
                      </div>
                      <div className="text-sm text-rodem-text-sub">
                        {new Date(o.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        {' '}
                        {new Date(o.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        {' · '}
                        {o.order_items?.map((i) => `${(i.menu_items as unknown as { name: string })?.name || ''}x${i.quantity}`).join(', ')}
                      </div>
                      <div className="text-xs text-rodem-text-sub mt-0.5">
                        {o.order_payments?.map(p => METHOD_LABELS[p.method]).join('+') || ''}
                        {isCancelled && <span className="ml-1 text-rodem-red font-bold">(반려)</span>}
                      </div>
                    </div>
                    <div className={cn('text-base font-bold', isCancelled ? 'text-rodem-text-sub line-through' : 'text-rodem-text')}>
                      {formatPrice(o.total_price)}
                    </div>
                  </div>
                )
              })}
              {allOrders.length === 0 && (
                <div className="text-center py-12 text-rodem-text-sub text-base">주문 내역이 없습니다</div>
              )}
            </div>
          </>

        ) : tab === 'Export' ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📥</div>
            <h3 className="text-xl font-bold text-rodem-text mb-2">종합 Export</h3>
            <p className="text-base text-rodem-text-sub mb-6">
              전체주문 · 월별 · 고객별 · 메뉴별<br />
              회계보고 · 주간수입상세 · 미결제현황 · 선불잔액현황
            </p>
            <button onClick={handleExport} className="px-8 py-4 rounded-rodem-sm bg-gradient-to-br from-[#f2d76a] via-[#dbb44a] to-[#c9a020] text-white font-bold text-lg cursor-pointer shadow-[0_6px_24px_rgba(201,162,39,0.2)]">
              📥 엑셀 다운로드 (8시트)
            </button>
          </div>

        ) : tab === '지출' ? (
          <>
            {/* 재료 품목 관리 */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-base text-rodem-text">📦 재료 품목 관리</h4>
              <button onClick={openAddExpItem} className="bg-rodem-gold border-none text-white py-1.5 px-3 rounded-[10px] text-sm font-bold cursor-pointer">+ 추가</button>
            </div>
            <div className="space-y-1.5 mb-6 max-h-60 overflow-y-auto">
              {expenseItems.map((item) => (
                <div key={item.id} className={cn(
                  'flex items-center gap-2 p-3 rounded-rodem-sm border',
                  item.is_active ? 'bg-rodem-card border-rodem-border-light' : 'bg-rodem-bg border-rodem-border-light opacity-50'
                )}>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base text-rodem-text truncate">{item.name}</div>
                    <div className="text-sm text-rodem-text-sub">
                      {formatPrice(item.default_price)}
                      {item.unit_desc && <span className="ml-1 opacity-60">({item.unit_desc})</span>}
                    </div>
                  </div>
                  <button onClick={() => toggleExpItem(item)} className={cn(
                    'w-10 h-5 rounded-full relative cursor-pointer border-none flex-shrink-0',
                    item.is_active ? 'bg-rodem-gold' : 'bg-rodem-border'
                  )}>
                    <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all', item.is_active ? 'left-[22px]' : 'left-0.5')} />
                  </button>
                  <button onClick={() => openEditExpItem(item)} className="w-8 h-8 rounded-[8px] bg-rodem-border-light text-sm flex items-center justify-center cursor-pointer border-none">✏️</button>
                </div>
              ))}
              {expenseItems.length === 0 && <div className="text-center py-4 text-rodem-text-sub text-sm">품목이 없습니다</div>}
            </div>

            {/* 지출 등록 버튼 */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-base text-rodem-text">📝 지출 내역</h4>
              <button onClick={openAddExpense} className="bg-rodem-blue border-none text-white py-1.5 px-3 rounded-[10px] text-sm font-bold cursor-pointer">+ 등록</button>
            </div>

            {/* 지출 내역 목록 */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {expenses.slice(0, 50).map((exp) => (
                <div key={exp.id} className="flex items-center gap-2 p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-rodem-text">{exp.name}</span>
                      {exp.quantity > 1 && <span className="text-sm text-rodem-text-sub">x{exp.quantity}</span>}
                    </div>
                    <div className="text-sm text-rodem-text-sub">
                      {new Date(exp.recorded_at + 'T00:00:00').toLocaleDateString('ko-KR')}
                      {exp.memo && <span className="ml-1.5">· {exp.memo}</span>}
                    </div>
                  </div>
                  <div className="text-base font-bold text-rodem-red">{formatPrice(exp.amount)}</div>
                  <button onClick={() => handleDeleteExpense(exp.id)} className="w-7 h-7 rounded-[6px] bg-red-50 text-rodem-red text-sm flex items-center justify-center cursor-pointer border-none">🗑️</button>
                </div>
              ))}
              {expenses.length === 0 && <div className="text-center py-8 text-rodem-text-sub text-base">지출 내역이 없습니다</div>}
            </div>

            {/* 월 합계 */}
            {expenses.length > 0 && (() => {
              const thisMonth = expenses.filter((e) => {
                const d = new Date(e.recorded_at)
                const now = new Date()
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
              })
              const thisMonthTotal = thisMonth.reduce((s, e) => s + e.amount, 0)
              const totalAll = expenses.reduce((s, e) => s + e.amount, 0)
              return (
                <div className="mt-4 p-3 rounded-rodem-sm bg-gradient-to-br from-[#4a4541] to-[#3a3632] text-white">
                  <div className="flex justify-between">
                    <span className="text-sm opacity-70">이번 달 지출</span>
                    <span className="font-bold">{formatPrice(thisMonthTotal)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm opacity-70">전체 지출</span>
                    <span className="font-bold">{formatPrice(totalAll)}</span>
                  </div>
                </div>
              )
            })()}
          </>

        ) : tab === '고객별' ? (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                <div className="text-sm text-rodem-text-sub mb-1">총 고객</div>
                <div className="text-[22px] font-bold text-rodem-text">{customerStats.length}명</div>
              </div>
              <div className="p-3 rounded-rodem-sm bg-rodem-orange-light border border-rodem-orange/20">
                <div className="text-sm text-rodem-orange mb-1">미결제 합계</div>
                <div className="text-xl font-bold text-rodem-orange">{formatPrice(customerStats.reduce((s, c) => s + c.credit, 0))}</div>
              </div>
              <div className="p-3 rounded-rodem-sm bg-rodem-gold-light border border-rodem-gold/20">
                <div className="text-sm text-rodem-gold mb-1">최다 이용</div>
                <div className="text-base font-bold text-rodem-text">{customerStats[0]?.name || '-'}</div>
              </div>
            </div>
            <h4 className="font-bold text-base text-rodem-text mb-3">TOP 10 고객</h4>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerStats.slice(0, 10)} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => v >= 10000 ? `${Math.round(v / 10000)}만원` : formatPrice(v)} />
                  <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatPrice(Number(v))} />
                  <Bar dataKey="total" fill="#c9a227" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {customerStats.slice(0, 30).map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                  <div>
                    <div className="text-base font-semibold text-rodem-text">{c.name}</div>
                    <div className="text-sm text-rodem-text-sub">{c.count}건</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-rodem-text">{formatPrice(c.total)}</div>
                    {c.credit > 0 && <div className="text-[13px] text-rodem-orange">미결제 {formatPrice(c.credit)}</div>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* 오전/오후 필터 */}
            <div className="flex gap-1.5 mb-4">
              {(['전체', '오전', '오후'] as const).map((t) => (
                <button key={t} onClick={() => setTimeFilter(t)} className={cn(
                  'px-4 py-2 rounded-rodem-sm text-sm font-bold cursor-pointer border',
                  timeFilter === t ? 'bg-[#4a4541] text-white border-[#4a4541]' : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light'
                )}>
                  {t === '전체' ? '전체' : t === '오전' ? '오전 (12시 전)' : '오후 (12시 후)'}
                </button>
              ))}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {METHODS.map((m) => {
                const current = summary[m]
                const prev = prevSummary[m]
                const change = calcChange(current, prev)
                const isUp = current >= prev
                return (
                  <div key={m} className="p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-rodem-text-sub">{METHOD_LABELS[m]}</span>
                      {(prev > 0 || current > 0) && (
                        <span className={cn('text-xs font-bold', isUp ? 'text-rodem-green' : 'text-rodem-red')}>{change}</span>
                      )}
                    </div>
                    <div className="text-xl font-bold" style={{ color: METHOD_COLORS[m] }}>{formatPrice(current)}</div>
                  </div>
                )
              })}
            </div>

            <div className="bg-gradient-to-br from-[#4a4541] to-[#3a3632] text-white p-4 rounded-rodem-sm mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm opacity-70 mb-1">실 매출 (선불 제외)</div>
                  <div className="text-[26px] font-bold">{formatPrice(summary.total - (summary.prepaid || 0))}</div>
                  {(prevSummary.total > 0 || summary.total > 0) && (
                    <div className={cn('text-sm font-semibold mt-1', (summary.total - summary.prepaid) >= (prevSummary.total - prevSummary.prepaid) ? 'text-green-400' : 'text-red-400')}>
                      {tab === '오늘' ? '어제' : '전월'} 대비 {calcChange(summary.total - summary.prepaid, prevSummary.total - prevSummary.prepaid)}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-70 mb-1">주문 수</div>
                  <div className="text-[26px] font-bold">{summary.count}건</div>
                  {summary.count > 0 && (
                    <div className="text-sm opacity-70 mt-1">총 주문 {formatPrice(summary.total)}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-rodem-card p-4 rounded-rodem-sm border border-rodem-border-light">
                <h4 className="text-sm font-bold text-rodem-text mb-2">결제방식별</h4>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={(props: PieLabelRenderProps) => `${props.name || ''} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`}>
                        {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatPrice(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-rodem-card p-4 rounded-rodem-sm border border-rodem-border-light">
                <h4 className="text-sm font-bold text-rodem-text mb-2">금액 비교</h4>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={(v) => v >= 10000 ? `${Math.round(v / 10000)}만원` : formatPrice(v)} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => formatPrice(Number(v))} />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                        {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {lineData.length > 1 && (
              <div className="bg-rodem-card p-4 rounded-rodem-sm border border-rodem-border-light mb-6">
                <h4 className="text-sm font-bold text-rodem-text mb-2">매출 추이</h4>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={(v) => v >= 10000 ? `${Math.round(v / 10000)}만원` : formatPrice(v)} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => formatPrice(Number(v))} />
                      <Line type="monotone" dataKey="total" stroke="#c9a227" strokeWidth={2} dot={{ fill: '#c9a227', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <h4 className="font-bold text-base text-rodem-text mb-3">최근 주문</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredOrders.slice(0, 20).map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                  <div>
                    <div className="text-base font-semibold text-rodem-text">{(o.members as unknown as { name: string })?.name}</div>
                    <div className="text-sm text-rodem-text-sub">
                      {new Date(o.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} · {o.order_payments?.map(p => METHOD_LABELS[p.method]).join('+')}
                    </div>
                  </div>
                  <div className="text-base font-bold text-rodem-text">{formatPrice(o.total_price)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 품목 추가/수정 모달 */}
      <Modal isOpen={expItemModal} onClose={() => setExpItemModal(false)} title={editExpItem ? '품목 수정' : '품목 추가'} maxWidth="max-w-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">품목 이름 *</label>
            <input type="text" value={expItemForm.name} onChange={(e) => setExpItemForm((p) => ({ ...p, name: e.target.value }))} placeholder="예) 원두"
              className="w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-bg text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
          </div>
          <div>
            <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">기본 단가 (원) *</label>
            <input type="number" value={expItemForm.default_price} onChange={(e) => setExpItemForm((p) => ({ ...p, default_price: e.target.value }))} placeholder="21000"
              className="w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-bg text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
          </div>
          <div>
            <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">단위 설명</label>
            <input type="text" value={expItemForm.unit_desc} onChange={(e) => setExpItemForm((p) => ({ ...p, unit_desc: e.target.value }))} placeholder="예) 1kg, 50개*20줄"
              className="w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-bg text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setExpItemModal(false)} className="flex-1 py-3 rounded-rodem-sm border border-rodem-border-light bg-rodem-card text-rodem-text-sub font-bold text-base cursor-pointer">취소</button>
            <button onClick={handleExpItemSubmit} disabled={!expItemForm.name.trim() || !expItemForm.default_price || submitting}
              className="flex-1 py-3 rounded-rodem-sm bg-rodem-gold text-white font-bold text-base cursor-pointer border-none disabled:opacity-50">
              {submitting ? '저장 중...' : editExpItem ? '수정' : '추가'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 지출 등록 모달 */}
      <Modal isOpen={expRecordModal} onClose={() => setExpRecordModal(false)} title="지출 등록" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">품목 선택</label>
            <select value={expForm.expense_item_id} onChange={(e) => handleExpItemSelect(e.target.value)}
              className="w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-bg text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold">
              <option value="">직접 입력</option>
              {expenseItems.filter((e) => e.is_active).map((item) => (
                <option key={item.id} value={item.id}>{item.name} — {formatPrice(item.default_price)}{item.unit_desc ? ` (${item.unit_desc})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">품목명 *</label>
            <input type="text" value={expForm.name} onChange={(e) => setExpForm((p) => ({ ...p, name: e.target.value }))} placeholder="품목명"
              className="w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-bg text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">수량</label>
              <input type="number" value={expForm.quantity} onChange={(e) => handleExpQtyChange(e.target.value)} min="1"
                className="w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-bg text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
            </div>
            <div>
              <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">금액 (원) *</label>
              <input type="number" value={expForm.amount} onChange={(e) => setExpForm((p) => ({ ...p, amount: e.target.value }))}
                className="w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-bg text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">날짜</label>
            <input type="date" value={expForm.recorded_at} onChange={(e) => setExpForm((p) => ({ ...p, recorded_at: e.target.value }))}
              className="w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-bg text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
          </div>
          <div>
            <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">비고</label>
            <input type="text" value={expForm.memo} onChange={(e) => setExpForm((p) => ({ ...p, memo: e.target.value }))} placeholder="메모 (선택)"
              className="w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-bg text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setExpRecordModal(false)} className="flex-1 py-3 rounded-rodem-sm border border-rodem-border-light bg-rodem-card text-rodem-text-sub font-bold text-base cursor-pointer">취소</button>
            <button onClick={handleExpenseSubmit} disabled={!expForm.name.trim() || !expForm.amount || submitting}
              className="flex-1 py-3 rounded-rodem-sm bg-rodem-blue text-white font-bold text-base cursor-pointer border-none disabled:opacity-50">
              {submitting ? '저장 중...' : '등록'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
