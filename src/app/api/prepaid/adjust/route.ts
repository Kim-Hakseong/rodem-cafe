import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { memberId, amount, reason } = await request.json()

    if (!memberId || amount === undefined || amount === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    // Fetch current balance
    const { data: member, error: fetchError } = await supabase
      .from('members')
      .select('prepaid_balance')
      .eq('id', memberId)
      .single()

    if (fetchError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const currentBalance = member.prepaid_balance || 0
    const newBalance = currentBalance + amount

    if (newBalance < 0) {
      return NextResponse.json({ error: 'Balance cannot go below 0' }, { status: 400 })
    }

    // Record the adjustment in prepaid_topups
    const { error: topupError } = await supabase.from('prepaid_topups').insert({
      member_id: memberId,
      amount,
      method: 'adjustment',
      created_by: reason || 'adjustment',
    })

    if (topupError) {
      return NextResponse.json({ error: 'Failed to record adjustment' }, { status: 500 })
    }

    // Update member balance
    const { error: updateError } = await supabase
      .from('members')
      .update({ prepaid_balance: newBalance })
      .eq('id', memberId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
    }

    return NextResponse.json({ success: true, newBalance })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
