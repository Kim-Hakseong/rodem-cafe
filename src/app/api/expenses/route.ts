import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('recorded_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        expense_item_id: body.expense_item_id || null,
        name: body.name,
        amount: body.amount,
        quantity: body.quantity || 1,
        memo: body.memo || null,
        recorded_at: body.recorded_at || new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const supabase = createSupabaseAdmin()
    const { error } = await supabase.from('expenses').delete().eq('id', body.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
