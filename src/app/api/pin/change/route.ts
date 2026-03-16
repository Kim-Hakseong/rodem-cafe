import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { currentPin, newPin, type } = await request.json()
    if (!currentPin || !newPin || !type) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const { data: settings } = await supabase.from('admin_settings').select('*').single()
    if (!settings) return NextResponse.json({ error: 'Settings not found' }, { status: 500 })

    const hash = type === 'admin' ? settings.admin_pin_hash : settings.staff_pin_hash
    const isValid = await bcrypt.compare(currentPin, hash)
    if (!isValid) return NextResponse.json({ error: 'Current PIN is incorrect' }, { status: 401 })

    const newHash = await bcrypt.hash(newPin, 10)
    const updateField = type === 'admin' ? 'admin_pin_hash' : 'staff_pin_hash'

    const { error } = await supabase
      .from('admin_settings')
      .update({ [updateField]: newHash, updated_at: new Date().toISOString() })
      .eq('id', settings.id)

    if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
