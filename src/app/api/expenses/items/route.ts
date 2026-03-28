import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('expense_items')
    .select('*')
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('expense_items')
      .insert({
        name: body.name,
        default_price: body.default_price || 0,
        unit_desc: body.unit_desc || null,
        sort_order: body.sort_order || 0,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createSupabaseAdmin()
    const { error } = await supabase
      .from('expense_items')
      .update({
        name: body.name,
        default_price: body.default_price || 0,
        unit_desc: body.unit_desc || null,
        is_active: body.is_active,
        sort_order: body.sort_order || 0,
      })
      .eq('id', body.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
