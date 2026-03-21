import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        name: body.name,
        price: body.price,
        category: body.category,
        temp_type: body.temp_type || null,
        sort_order: body.sort_order || 0,
        image_url: body.image_url || null,
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
      .from('menu_items')
      .update({
        name: body.name,
        price: body.price,
        category: body.category,
        temp_type: body.temp_type || null,
        sort_order: body.sort_order || 0,
        is_active: body.is_active,
        image_url: body.image_url || null,
      })
      .eq('id', body.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
