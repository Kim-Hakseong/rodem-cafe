import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { memberId, amount, method } = await request.json()

    if (!memberId || !amount || !method) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    // Insert topup record
    const { error: topupError } = await supabase.from('prepaid_topups').insert({
      member_id: memberId,
      amount,
      method,
      created_by: 'staff',
    })

    if (topupError) {
      return NextResponse.json({ error: 'Failed to record topup' }, { status: 500 })
    }

    // Update member balance
    const { data: member } = await supabase
      .from('members')
      .select('prepaid_balance')
      .eq('id', memberId)
      .single()

    if (member) {
      const { error: updateError } = await supabase
        .from('members')
        .update({ prepaid_balance: (member.prepaid_balance || 0) + amount })
        .eq('id', memberId)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
