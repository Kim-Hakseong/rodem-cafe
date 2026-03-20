import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    // Fetch order with payments
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, member_id, order_payments(id, method, amount)')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 })
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

    // Mark order as cancelled
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
