import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const memberId = request.nextUrl.searchParams.get('memberId')
    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const { data: member } = await supabase
      .from('members')
      .select('qr_token')
      .eq('id', memberId)
      .single()

    if (!member?.qr_token) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rodem-cafe.vercel.app'
    const url = `${baseUrl}/my/${member.qr_token}`
    const qrBuffer = await QRCode.toBuffer(url, { width: 300, margin: 2 })
    const uint8 = new Uint8Array(qrBuffer)

    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qr-${memberId}.png"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
