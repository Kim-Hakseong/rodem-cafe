import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, phone, note, department } = await request.json()
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('members')
      .insert({ name, phone: phone || null, note: note || null, department: department || null })
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
    const { id, name, phone, note, department } = await request.json()
    if (!id || !name) return NextResponse.json({ error: 'ID and name required' }, { status: 400 })

    const supabase = createSupabaseAdmin()
    const { error } = await supabase
      .from('members')
      .update({ name, phone: phone || null, note: note || null, department: department || null })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const supabase = createSupabaseAdmin()
    const { error } = await supabase.from('members').delete().eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
