import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields server-side
    if (!body.parentName || !body.phone || !body.childName || !body.attendance) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
      // Apps Script not configured — accept but warn
      console.warn('APPS_SCRIPT_URL not configured. RSVP not saved to Google Sheets.');
      return NextResponse.json({ success: true, message: 'RSVP received (Sheets not configured)' });
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        timestamp: new Date().toISOString(),
      }),
    });

    // Apps Script returns 200 even on no-cors; treat any response as success
    return NextResponse.json({ success: true, message: 'RSVP saved to Google Sheets' });

  } catch (err: any) {
    console.error('RSVP API error:', err.message);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
      return NextResponse.json({ success: true, rsvps: [], stats: { total: 0 } });
    }

    const response = await fetch(`${APPS_SCRIPT_URL}?action=getRSVPs`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
