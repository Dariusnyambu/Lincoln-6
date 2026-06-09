import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || '';

function normalisePhone(p: string) {
  return p.replace(/[\s\-().+]/g, '').slice(-9);
}

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone') || '';
  if (!phone) return NextResponse.json({ exists: false });

  try {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
      return NextResponse.json({ exists: false });
    }
    const res  = await fetch(`${APPS_SCRIPT_URL}?action=getRSVPs`, {
      redirect: 'follow',
      cache: 'no-store',
    });
    const text = await res.text();
    const data = JSON.parse(text);
    const norm = normalisePhone(phone);
    const exists = (data.rsvps || []).some(
      (r: any) => normalisePhone(String(r.phone || '')) === norm
    );
    return NextResponse.json({ exists }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
