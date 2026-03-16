import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { memberId, amount, method } = await request.json()

    if (!memberId || !amount || !method) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    const { error } = await supabase.from('credit_payments').insert({
      member_id: memberId,
      amount,
      method,
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to settle' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
