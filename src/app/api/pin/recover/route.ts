import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPin, action } = await request.json()
    const supabase = createSupabaseAdmin()
    const { data: settings } = await supabase.from('admin_settings').select('*').single()
    if (!settings) return NextResponse.json({ error: 'Settings not found' }, { status: 500 })

    // Step 1: Verify email
    if (action === 'send-code') {
      if (email.toLowerCase() !== settings.recovery_email.toLowerCase()) {
        return NextResponse.json({ error: 'Email mismatch' }, { status: 401 })
      }
      // In dev, just log the code. In prod, send email.
      console.log('Recovery code: 123456')
      return NextResponse.json({ success: true })
    }

    // Step 2: Verify code
    if (action === 'verify-code') {
      if (code !== '123456') {
        return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
      }
      return NextResponse.json({ success: true })
    }

    // Step 3: Reset PIN
    if (action === 'reset-pin') {
      if (!newPin) return NextResponse.json({ error: 'New PIN required' }, { status: 400 })
      const newHash = await bcrypt.hash(newPin, 10)
      await supabase
        .from('admin_settings')
        .update({ admin_pin_hash: newHash, staff_pin_hash: newHash, updated_at: new Date().toISOString() })
        .eq('id', settings.id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
