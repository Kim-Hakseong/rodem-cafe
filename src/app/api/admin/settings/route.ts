import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('admin_settings')
      .select('qr_enabled, open_time, close_time')
      .single()

    if (error) return NextResponse.json({ qr_enabled: true, open_time: '10:35', close_time: '12:30' })
    return NextResponse.json({
      qr_enabled: data.qr_enabled !== false,
      open_time: data.open_time || '10:35',
      close_time: data.close_time || '12:30',
    })
  } catch {
    return NextResponse.json({ qr_enabled: true, open_time: '10:35', close_time: '12:30' })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createSupabaseAdmin()

    const updates: Record<string, unknown> = {}
    if ('qr_enabled' in body) updates.qr_enabled = body.qr_enabled
    if ('open_time' in body) updates.open_time = body.open_time
    if ('close_time' in body) updates.close_time = body.close_time

    const { error } = await supabase
      .from('admin_settings')
      .update(updates)
      .not('id', 'is', null)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
