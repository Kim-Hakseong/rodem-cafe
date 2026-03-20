import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
  try {
    const { paymentId, method, amount, transfer_status } = await request.json()

    if (!paymentId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    const updateData: Record<string, unknown> = {}
    if (method !== undefined) updateData.method = method
    if (amount !== undefined) updateData.amount = amount
    if (transfer_status !== undefined) updateData.transfer_status = transfer_status

    const { error } = await supabase
      .from('order_payments')
      .update(updateData)
      .eq('id', paymentId)

    if (error) {
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { paymentId } = await request.json()

    if (!paymentId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    const { error } = await supabase
      .from('order_payments')
      .delete()
      .eq('id', paymentId)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
