import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'
import { CREDIT_ORDER_ENABLED } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const { paymentId, action } = await request.json()

    if (!paymentId || !['confirmed', 'unpaid'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // 미결제 중단 — 이체 미확인 건을 미결제로 전환할 수 없음 (확인 대기로 유지)
    if (!CREDIT_ORDER_ENABLED && action === 'unpaid') {
      return NextResponse.json({ error: '미결제 전환은 더 이상 사용할 수 없습니다' }, { status: 400 })
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
      // Mark as unpaid and convert to credit (미결제)
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
