import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || '';

function normalisePhone(p: string) {
  return p.replace(/[\s\-().+]/g, '').slice(-9);
}

// ── GET — fetch all RSVPs from Google Sheets ──────────────────────────────────
export async function GET() {
  try {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
      return NextResponse.json({ success: true, rsvps: [], stats: { total: 0 } });
    }

    // Apps Script issues a 302 redirect — MUST use redirect:'follow'
    // Never cache — admin needs live data every time
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getRSVPs`, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      headers: { Accept: 'application/json, text/plain, */*' },
    });

    // Read as text first — Apps Script error pages return HTML not JSON
    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Apps Script non-JSON response:', text.slice(0, 400));
      return NextResponse.json(
        { success: false, error: 'Apps Script returned non-JSON', raw: text.slice(0, 400) },
        { status: 502 }
      );
    }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (err: any) {
    console.error('GET /api/rsvp error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── POST — submit new RSVP (with server-side duplicate check) ─────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.parentName || !body.phone || !body.childName || !body.attendance) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
      console.warn('APPS_SCRIPT_URL not configured.');
      return NextResponse.json({ success: true, message: 'RSVP received (Sheets not configured)' });
    }

    // Server-side duplicate check
    try {
      const existing = await fetch(`${APPS_SCRIPT_URL}?action=getRSVPs`, {
        redirect: 'follow',
        cache: 'no-store',
      });
      const text = await existing.text();
      const data = JSON.parse(text);
      const rsvps: any[] = data.rsvps || [];
      const incomingNorm = normalisePhone(body.phone);
      const isDuplicate = rsvps.some(
        (r: any) => normalisePhone(String(r.phone || '')) === incomingNorm
      );
      if (isDuplicate) {
        return NextResponse.json({
          success: false,
          duplicate: true,
          message: 'This phone number has already been registered.',
        });
      }
    } catch {
      // Duplicate check failed — proceed with submission anyway
    }

    // Submit to Apps Script — also follows redirects
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, timestamp: new Date().toISOString() }),
    });

    return NextResponse.json({ success: true, message: 'RSVP saved to Google Sheets' });
  } catch (err: any) {
    console.error('POST /api/rsvp error:', err.message);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// ── DELETE — remove a row by index (admin only) ───────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { rowIndex, adminPassword } = body;

    if (adminPassword !== (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'lincoln2026')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (typeof rowIndex !== 'number') {
      return NextResponse.json({ success: false, error: 'rowIndex required' }, { status: 400 });
    }
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
      return NextResponse.json({ success: true, message: 'Delete acknowledged (Sheets not configured)' });
    }

    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteRow', rowIndex }),
    });

    return NextResponse.json({ success: true, message: 'Entry deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
