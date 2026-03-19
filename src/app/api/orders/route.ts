import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { memberId, items, payments, totalPrice, createdBy } = await request.json()

    if (!memberId || !items?.length || !payments?.length || !totalPrice) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    // Get today's order count for order_number
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)

    const orderNumber = (count || 0) + 1

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        member_id: memberId,
        total_price: totalPrice,
        status: 'pending',
        order_number: orderNumber,
        created_by: createdBy || 'staff',
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Insert order items
    const orderItems = items.map((item: { menuItemId: string; quantity: number; unitPrice: number }) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
    }

    // Insert payments (set transfer_status for transfer payments)
    const orderPayments = payments.map((p: { method: string; amount: number }) => ({
      order_id: order.id,
      method: p.method,
      amount: p.amount,
      transfer_status: p.method === 'transfer' ? 'pending' : null,
    }))

    const { error: paymentsError } = await supabase.from('order_payments').insert(orderPayments)
    if (paymentsError) {
      return NextResponse.json({ error: 'Failed to create payments' }, { status: 500 })
    }

    // If prepaid payment, deduct balance
    const prepaidPayment = payments.find((p: { method: string }) => p.method === 'prepaid')
    if (prepaidPayment) {
      const { data: member } = await supabase
        .from('members')
        .select('prepaid_balance')
        .eq('id', memberId)
        .single()

      if (member) {
        await supabase
          .from('members')
          .update({ prepaid_balance: (member.prepaid_balance || 0) - prepaidPayment.amount })
          .eq('id', memberId)
      }
    }

    return NextResponse.json({ success: true, orderId: order.id, orderNumber })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
