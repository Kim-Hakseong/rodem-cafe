import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('admin_settings')
      .select('qr_enabled')
      .single()

    if (error) return NextResponse.json({ qr_enabled: true })
    return NextResponse.json({ qr_enabled: data.qr_enabled !== false })
  } catch {
    return NextResponse.json({ qr_enabled: true })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createSupabaseAdmin()

    const { error } = await supabase
      .from('admin_settings')
      .update({ qr_enabled: body.qr_enabled })
      .not('id', 'is', null)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
