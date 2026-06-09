'use client';
import { useState, useEffect } from 'react';
import type { RSVPData } from '@/lib/types';

interface Props {
  onSuccess: (data: RSVPData) => void;
}

// ─── Stepper Button component (fixes stuck number bug) ────────────────────────
function Stepper({
  label, value, min, max, onChange, hasErr,
}: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; hasErr: boolean;
}) {
  return (
    <div>
      <label style={lbl}>{label} *</label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0',
        background: hasErr ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${hasErr ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.22)'}`,
        borderRadius: '12px', overflow: 'hidden',
      }}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          style={{ width: 44, height: 48, background: 'rgba(245,158,11,0.08)', border: 'none', color: '#FCD34D', fontSize: '1.25rem', cursor: value <= min ? 'not-allowed' : 'pointer', opacity: value <= min ? 0.35 : 1, flexShrink: 0 }}>
          −
        </button>
        <div style={{ flex: 1, textAlign: 'center', color: '#fff', fontSize: '1rem', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
          {value}
        </div>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          style={{ width: 44, height: 48, background: 'rgba(245,158,11,0.08)', border: 'none', color: '#FCD34D', fontSize: '1.25rem', cursor: value >= max ? 'not-allowed' : 'pointer', opacity: value >= max ? 0.35 : 1, flexShrink: 0 }}>
          +
        </button>
      </div>
    </div>
  );
}

const lbl = {
  display: 'block', color: 'rgba(255,255,255,0.65)',
  fontSize: '0.78rem', fontWeight: 500,
  marginBottom: '0.38rem', letterSpacing: '0.03em',
} as const;

const errStyle = { color: '#F87171', fontSize: '0.73rem', marginTop: '0.28rem' } as const;

const inp = (hasErr: boolean) => ({
  width: '100%',
  background: hasErr ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.04)',
  border: `1.5px solid ${hasErr ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.22)'}`,
  borderRadius: '12px',
  padding: '0.82rem 1rem',
  color: '#fff',
  fontSize: '0.93rem',
  fontFamily: "'Inter', sans-serif",
  transition: 'border-color 0.2s',
  boxSizing: 'border-box' as const,
});

// ─── Duplicate check helpers ───────────────────────────────────────────────────
const LS_KEY = 'lincoln_rsvp_submitted';

function normalisePhone(p: string) {
  return p.replace(/[\s\-().+]/g, '').slice(-9); // last 9 digits
}

function alreadySubmittedLocally(phone: string): boolean {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_KEY) || '[]') as string[];
    return stored.includes(normalisePhone(phone));
  } catch { return false; }
}

function markSubmittedLocally(phone: string) {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_KEY) || '[]') as string[];
    stored.push(normalisePhone(phone));
    localStorage.setItem(LS_KEY, JSON.stringify(stored));
  } catch {}
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function RSVPForm({ onSuccess }: Props) {
  const [form, setForm] = useState<RSVPData>({
    parentName: '', phone: '', email: '', childName: '',
    adults: 1, children: 1, attendance: '', notes: '',
  });
  const [errors, setErrors]     = useState<Partial<Record<keyof RSVPData | 'duplicate', string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  // Check on phone blur — instant feedback
  const handlePhoneBlur = async () => {
    if (!form.phone.trim()) return;
    if (alreadySubmittedLocally(form.phone)) {
      setAlreadyDone(true);
      return;
    }
    // Also check server-side (non-blocking)
    try {
      const res = await fetch(`/api/rsvp/check?phone=${encodeURIComponent(form.phone)}`);
      const data = await res.json();
      if (data.exists) setAlreadyDone(true);
    } catch {}
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.parentName.trim()) e.parentName = 'Parent/Guardian name is required';
    if (!form.phone.trim())       e.phone      = 'Phone number is required';
    if (!form.childName.trim())   e.childName  = "Child's name is required";
    if (form.adults < 1)          e.adults     = 'At least 1 adult required';
    if (form.children < 1)        e.children   = 'At least 1 child required';
    if (!form.attendance)         e.attendance = 'Please select your attendance status';
    return e;
  };

  const handleSubmit = async () => {
    // Re-check duplicate at submit time
    if (alreadySubmittedLocally(form.phone)) {
      setAlreadyDone(true);
      return;
    }

    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, timestamp: new Date().toISOString() }),
      });
      const data = await res.json();

      if (data.duplicate) {
        setAlreadyDone(true);
        setSubmitting(false);
        return;
      }

      markSubmittedLocally(form.phone);
      onSuccess(form);
      setForm({ parentName: '', phone: '', email: '', childName: '', adults: 1, children: 1, attendance: '', notes: '' });
    } catch {
      // Still mark success locally to avoid UX breakage
      markSubmittedLocally(form.phone);
      onSuccess(form);
    }
    setSubmitting(false);
  };

  // ── Already submitted banner ────────────────────────────────────────────────
  if (alreadyDone) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
        <div style={{ color: '#FCD34D', fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          You're Already Registered!
        </div>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          We already have your RSVP on file for this number.<br />
          We look forward to seeing you on <strong style={{ color: '#FCD34D' }}>20 June 2026</strong>!
        </div>
        <div style={{ marginTop: '1.25rem', padding: '0.85rem 1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
          If you need to make changes, please contact us directly.
        </div>
        <button
          onClick={() => setAlreadyDone(false)}
          style={{ marginTop: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.6rem 1.2rem', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          Use a different number
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.15rem' }}>

        {/* Parent Name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Parent / Guardian Full Name *</label>
          <input style={inp(!!errors.parentName)} value={form.parentName}
            onChange={e => setForm({ ...form, parentName: e.target.value })} placeholder="Full name" />
          {errors.parentName && <div style={errStyle}>{errors.parentName}</div>}
        </div>

        {/* Phone */}
        <div>
          <label style={lbl}>Phone Number *</label>
          <input style={inp(!!errors.phone)} value={form.phone}
            onChange={e => { setForm({ ...form, phone: e.target.value }); setAlreadyDone(false); }}
            onBlur={handlePhoneBlur}
            placeholder="+254 700 000 000" />
          {errors.phone && <div style={errStyle}>{errors.phone}</div>}
        </div>

        {/* Email */}
        <div>
          <label style={lbl}>Email Address (Optional)</label>
          <input style={inp(false)} value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
        </div>

        {/* Child Name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Child's Name *</label>
          <input style={inp(!!errors.childName)} value={form.childName}
            onChange={e => setForm({ ...form, childName: e.target.value })} placeholder="Child's full name" />
          {errors.childName && <div style={errStyle}>{errors.childName}</div>}
        </div>

        {/* Adults stepper */}
        <Stepper label="Number of Adults" value={form.adults} min={1} max={10}
          onChange={v => setForm({ ...form, adults: v })} hasErr={!!errors.adults} />

        {/* Children stepper */}
        <Stepper label="Number of Children" value={form.children} min={1} max={20}
          onChange={v => setForm({ ...form, children: v })} hasErr={!!errors.children} />

        {errors.adults   && <div style={{ ...errStyle, gridColumn: '1/2', marginTop: '-0.75rem' }}>{errors.adults}</div>}
        {errors.children && <div style={{ ...errStyle, gridColumn: '2/3', marginTop: '-0.75rem' }}>{errors.children}</div>}

        {/* Attendance toggle */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Will You Be Attending? *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
            {([
              { value: 'attending',     label: "Yes, We'll Be There 🎉" },
              { value: 'not-attending', label: "Sorry, We Can't Make It" },
            ] as const).map(({ value, label }) => (
              <button key={value} type="button" onClick={() => setForm({ ...form, attendance: value })}
                style={{
                  padding: '0.82rem', borderRadius: '12px', cursor: 'pointer',
                  border: `1.5px solid ${form.attendance === value ? '#F59E0B' : 'rgba(245,158,11,0.22)'}`,
                  background: form.attendance === value ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                  color: form.attendance === value ? '#FCD34D' : 'rgba(255,255,255,0.6)',
                  fontWeight: form.attendance === value ? 600 : 400,
                  fontSize: '0.88rem', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                }}>
                {label}
              </button>
            ))}
          </div>
          {errors.attendance && <div style={errStyle}>{errors.attendance}</div>}
        </div>

        {/* Notes */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Special Notes (Optional)</label>
          <textarea style={{ ...inp(false), minHeight: '90px', resize: 'vertical' }}
            value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Any dietary requirements, allergies, or special requests..." />
        </div>
      </div>

      <button type="button" onClick={handleSubmit} disabled={submitting}
        style={{
          width: '100%', marginTop: '1.4rem', padding: '1rem',
          background: submitting ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #F59E0B, #FCD34D)',
          border: 'none', borderRadius: '14px', color: '#0F172A',
          fontSize: '0.98rem', fontWeight: 700, fontFamily: "'Poppins', sans-serif",
          cursor: submitting ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', transition: 'opacity 0.2s',
        }}>
        {submitting ? 'Submitting...' : '🎉 Confirm Attendance'}
      </button>
    </div>
  );
}
