import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { paymentId, action } = await request.json()

    if (!paymentId || !['confirmed', 'unpaid'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    if (action === 'confirmed') {
      const { error } = await supabase
        .from('order_payments')
        .update({ transfer_status: 'confirmed' })
        .eq('id', paymentId)

      if (error) {
        return NextResponse.json({ error: 'Failed to confirm' }, { status: 500 })
      }
    } else if (action === 'unpaid') {
      // Mark as unpaid and convert to credit (외상)
      const { error } = await supabase
        .from('order_payments')
        .update({ transfer_status: 'unpaid', method: 'credit' })
        .eq('id', paymentId)

      if (error) {
        return NextResponse.json({ error: 'Failed to mark unpaid' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
