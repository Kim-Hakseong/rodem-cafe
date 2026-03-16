import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { memberId, pin } = await request.json()

    if (!memberId || !pin) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const { data: member } = await supabase
      .from('members')
      .select('personal_pin')
      .eq('id', memberId)
      .single()

    if (!member?.personal_pin) {
      return NextResponse.json({ error: 'No PIN set' }, { status: 404 })
    }

    const isValid = await bcrypt.compare(pin, member.personal_pin)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
