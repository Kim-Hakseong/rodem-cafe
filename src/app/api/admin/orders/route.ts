import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const memberName = searchParams.get('member')

    const supabase = createSupabaseAdmin()

    let query = supabase
      .from('orders')
      .select('id, order_number, status, total_price, created_at, completed_at, created_by, member_id, members(name), order_items(id, quantity, unit_price, menu_items(name)), order_payments(id, method, amount, transfer_status)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (date) {
      const dayStart = new Date(date)
      const dayEnd = new Date(date)
      dayEnd.setDate(dayEnd.getDate() + 1)
      query = query.gte('created_at', dayStart.toISOString()).lt('created_at', dayEnd.toISOString())
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    // Client-side filter by member name if provided
    let filtered = data || []
    if (memberName) {
      filtered = filtered.filter((o) => {
        const name = (o.members as unknown as { name: string })?.name || ''
        return name.includes(memberName)
      })
    }

    return NextResponse.json({ orders: filtered })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    const updateData: Record<string, unknown> = { status }
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    // Fetch order with payments for prepaid refund
    const { data: order } = await supabase
      .from('orders')
      .select('id, member_id, order_payments(id, method, amount)')
      .eq('id', orderId)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Refund prepaid payments
    const prepaidPayments = (order.order_payments || []).filter(
      (p: { method: string }) => p.method === 'prepaid'
    )

    if (prepaidPayments.length > 0) {
      const totalRefund = prepaidPayments.reduce(
        (sum: number, p: { amount: number }) => sum + p.amount, 0
      )
      const { data: member } = await supabase
        .from('members')
        .select('prepaid_balance')
        .eq('id', order.member_id)
        .single()

      if (member) {
        await supabase
          .from('members')
          .update({ prepaid_balance: (member.prepaid_balance || 0) + totalRefund })
          .eq('id', order.member_id)
      }
    }

    // Delete in order: payments → items → order
    await supabase.from('order_payments').delete().eq('order_id', orderId)
    await supabase.from('order_items').delete().eq('order_id', orderId)
    await supabase.from('orders').delete().eq('id', orderId)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
