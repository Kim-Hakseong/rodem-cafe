import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { pin, type } = await request.json()

    if (!pin || !type || !['admin', 'staff'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('admin_settings')
      .select('admin_pin_hash, staff_pin_hash')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 500 })
    }

    const hash = type === 'admin' ? data.admin_pin_hash : data.staff_pin_hash
    const isValid = await bcrypt.compare(pin, hash)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    return NextResponse.json({ success: true, type })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
