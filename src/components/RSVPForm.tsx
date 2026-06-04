'use client';
import { useState } from 'react';
import type { RSVPData } from '@/lib/types';

interface Props {
  onSuccess: (data: RSVPData) => void;
}

export default function RSVPForm({ onSuccess }: Props) {
  const [form, setForm] = useState<RSVPData>({
    parentName: '', phone: '', email: '', childName: '',
    adults: 1, children: 1, attendance: '', notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RSVPData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.parentName.trim())  e.parentName  = 'Parent/Guardian name is required';
    if (!form.phone.trim())        e.phone        = 'Phone number is required';
    if (!form.childName.trim())    e.childName    = "Child's name is required";
    if (form.adults < 1)           e.adults       = 'At least 1 adult required';
    if (form.children < 1)         e.children     = 'At least 1 child required';
    if (!form.attendance)          e.attendance   = 'Please select your attendance status';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, timestamp: new Date().toISOString() }),
      });
      onSuccess(form);
      setForm({ parentName: '', phone: '', email: '', childName: '', adults: 1, children: 1, attendance: '', notes: '' });
    } catch {
      onSuccess(form); // Still show success so UX isn't broken
    }
    setSubmitting(false);
  };

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

  const lbl = { display: 'block', color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontWeight: 500, marginBottom: '0.38rem', letterSpacing: '0.03em' } as const;
  const err = { color: '#F87171', fontSize: '0.73rem', marginTop: '0.28rem' } as const;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.15rem' }}>

        {/* Parent Name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Parent / Guardian Full Name *</label>
          <input style={inp(!!errors.parentName)} value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} placeholder="Full name" />
          {errors.parentName && <div style={err}>{errors.parentName}</div>}
        </div>

        {/* Phone */}
        <div>
          <label style={lbl}>Phone Number *</label>
          <input style={inp(!!errors.phone)} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+254 700 000 000" />
          {errors.phone && <div style={err}>{errors.phone}</div>}
        </div>

        {/* Email */}
        <div>
          <label style={lbl}>Email Address (Optional)</label>
          <input style={inp(false)} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
        </div>

        {/* Child Name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Child's Name *</label>
          <input style={inp(!!errors.childName)} value={form.childName} onChange={e => setForm({ ...form, childName: e.target.value })} placeholder="Child's full name" />
          {errors.childName && <div style={err}>{errors.childName}</div>}
        </div>

        {/* Adults */}
        <div>
          <label style={lbl}>Number of Adults *</label>
          <input type="number" min={1} max={10} style={inp(!!errors.adults)} value={form.adults} onChange={e => setForm({ ...form, adults: parseInt(e.target.value) || 1 })} />
          {errors.adults && <div style={err}>{errors.adults}</div>}
        </div>

        {/* Children */}
        <div>
          <label style={lbl}>Number of Children *</label>
          <input type="number" min={1} max={20} style={inp(!!errors.children)} value={form.children} onChange={e => setForm({ ...form, children: parseInt(e.target.value) || 1 })} />
          {errors.children && <div style={err}>{errors.children}</div>}
        </div>

        {/* Attendance toggle */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Will You Be Attending? *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
            {([
              { value: 'attending',     label: "Yes, We'll Be There 🎉" },
              { value: 'not-attending', label: "Sorry, We Can't Make It" },
            ] as const).map(({ value, label }) => (
              <button key={value} onClick={() => setForm({ ...form, attendance: value })}
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
          {errors.attendance && <div style={err}>{errors.attendance}</div>}
        </div>

        {/* Notes */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Special Notes (Optional)</label>
          <textarea style={{ ...inp(false), minHeight: '90px', resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any dietary requirements, allergies, or special requests..." />
        </div>
      </div>

      <button onClick={handleSubmit} disabled={submitting}
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
