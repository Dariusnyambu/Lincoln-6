'use client';
import { useState, useEffect, useCallback } from 'react';
import type { RSVPData } from '@/lib/types';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'lincoln2026';

type FilterStatus = 'all' | 'attending' | 'not-attending';
type SortKey = 'timestamp' | 'parentName' | 'childName' | 'attendance';
type SortDir = 'asc' | 'desc';

const fmt = (ts?: string) => {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return ts; }
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatBox({ icon, val, label, color = '#FCD34D' }: { icon: string; val: number | string; label: string; color?: string }) {
  return (
    <div style={{ background: '#0F1E33', border: '1.5px solid rgba(245,158,11,0.2)', borderRadius: '16px', padding: '1.2rem 1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{icon}</div>
      <div style={{ fontSize: '1.9rem', fontWeight: 800, color, fontFamily: "'Poppins',sans-serif", lineHeight: 1 }}>{val}</div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', marginTop: '0.3rem' }}>{label}</div>
    </div>
  );
}

function Badge({ attending }: { attending: boolean }) {
  return (
    <span style={{
      display: 'inline-block', padding: '0.25rem 0.65rem', borderRadius: '20px',
      fontSize: '0.7rem', fontWeight: 700,
      background: attending ? 'rgba(34,197,94,0.14)' : 'rgba(239,68,68,0.1)',
      color: attending ? '#4ADE80' : '#F87171',
    }}>
      {attending ? '✓ Attending' : '✗ Declined'}
    </span>
  );
}

// ─── Detail + Delete confirm modal ───────────────────────────────────────────
function DetailDrawer({ rsvp, onClose, onDelete }: { rsvp: RSVPData; onClose: () => void; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#0F1E33', border: '1.5px solid rgba(245,158,11,0.35)', borderRadius: '20px', padding: '2rem', maxWidth: '460px', width: '100%', fontFamily: "'Inter',sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ color: '#FCD34D', fontWeight: 700, fontSize: '1rem', fontFamily: "'Poppins',sans-serif" }}>RSVP Details</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        {([
          ['👤 Parent / Guardian', rsvp.parentName],
          ['👦 Child', rsvp.childName],
          ['📞 Phone', rsvp.phone],
          ['📧 Email', rsvp.email || '—'],
          ['👨‍👩 Adults', String(rsvp.adults)],
          ['🧒 Children', String(rsvp.children)],
          ['✅ Status', rsvp.attendance === 'attending' ? 'Attending' : 'Not Attending'],
          ['📝 Notes', rsvp.notes || '—'],
          ['🕐 Submitted', fmt(rsvp.timestamp)],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: '1rem', padding: '0.55rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'flex-start' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', minWidth: '150px', flexShrink: 0 }}>{label}</div>
            <div style={{ color: '#fff', fontSize: '0.88rem', flex: 1, wordBreak: 'break-word' }}>{value}</div>
          </div>
        ))}

        {/* Delete confirmation */}
        {confirmDelete ? (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px' }}>
            <div style={{ color: '#F87171', fontSize: '0.88rem', marginBottom: '0.75rem', fontWeight: 600 }}>⚠️ Delete this RSVP?</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '1rem' }}>This will permanently remove <strong style={{ color: '#fff' }}>{rsvp.parentName}</strong>'s entry from Google Sheets. This cannot be undone.</div>
            <div style={{ display: 'flex', gap: '0.7rem' }}>
              <button onClick={onDelete} style={{ flex: 1, padding: '0.7rem', background: '#EF4444', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                Yes, Delete
              </button>
              <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '0.7rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.7rem' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg,#F59E0B,#FCD34D)', border: 'none', borderRadius: '10px', color: '#0F172A', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", fontSize: '0.88rem' }}>
              Close
            </button>
            <button onClick={() => setConfirmDelete(true)} style={{ padding: '0.75rem 1.1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#F87171', cursor: 'pointer', fontSize: '0.85rem' }}>
              🗑 Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [password, setPassword]   = useState('');
  const [authed, setAuthed]       = useState(false);
  const [authErr, setAuthErr]     = useState('');
  const [rsvps, setRsvps]         = useState<RSVPData[]>([]);
  const [loading, setLoading]     = useState(false);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<FilterStatus>('all');
  const [sortKey, setSortKey]     = useState<SortKey>('timestamp');
  const [sortDir, setSortDir]     = useState<SortDir>('desc');
  const [selected, setSelected]   = useState<{ rsvp: RSVPData; index: number } | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  const login = () => {
    if (password === ADMIN_PASSWORD) { setAuthed(true); setAuthErr(''); }
    else setAuthErr('Incorrect password. Try again.');
  };

  const fetchRSVPs = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/rsvp', { cache: 'no-store' });
      const data = await res.json();
      if (data.rsvps && Array.isArray(data.rsvps)) {
        setRsvps(data.rsvps);
        setLastFetch(new Date().toLocaleTimeString('en-KE'));
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) fetchRSVPs(); }, [authed, fetchRSVPs]);

  // ── Delete handler ──────────────────────────────────────────────────────────
  const handleDelete = async (rowIndex: number) => {
    setDeleting(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex, adminPassword: ADMIN_PASSWORD }),
      });
      const data = await res.json();
      if (data.success) {
        setRsvps(prev => prev.filter((_, i) => i !== rowIndex));
        setDeleteMsg('Entry deleted successfully.');
        setTimeout(() => setDeleteMsg(''), 3000);
      }
    } catch { setDeleteMsg('Failed to delete. Please try again.'); }
    setDeleting(false);
    setSelected(null);
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const attending     = rsvps.filter(r => r.attendance === 'attending');
  const notAttending  = rsvps.filter(r => r.attendance === 'not-attending');
  const totalAdults   = attending.reduce((s, r) => s + Number(r.adults), 0);
  const totalChildren = attending.reduce((s, r) => s + Number(r.children), 0);
  const attendRate    = rsvps.length ? Math.round((attending.length / rsvps.length) * 100) : 0;

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const filtered = rsvps
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => {
      const q = search.toLowerCase();
      const matchQ = !q ||
        r.parentName.toLowerCase().includes(q) ||
        r.childName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        (r.email || '').toLowerCase().includes(q);
      return matchQ && (filter === 'all' || r.attendance === filter);
    })
    .sort((a, b) => {
      let av: string | number = (a.r as any)[sortKey] || '';
      let bv: string | number = (b.r as any)[sortKey] || '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };
  const sortIcon = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ⇅';

  // ── Export ──────────────────────────────────────────────────────────────────
  const doExportCSV = (subset: 'all' | 'attending' | 'not-attending' | 'filtered') => {
    const data =
      subset === 'filtered'      ? filtered.map(f => f.r) :
      subset === 'attending'     ? attending :
      subset === 'not-attending' ? notAttending :
      rsvps;
    const headers = ['Timestamp','Parent Name','Phone','Email','Child Name','Adults','Children','Attendance','Notes'];
    const rows    = data.map(r => [fmt(r.timestamp), r.parentName, r.phone, r.email||'—', r.childName, r.adults, r.children, r.attendance==='attending'?'Attending':'Not Attending', r.notes||'—']);
    const csv = [headers,...rows].map(row => row.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    Object.assign(document.createElement('a'), {
      href: 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv),
      download: `lincoln-rsvps-${subset}-${new Date().toISOString().slice(0,10)}.csv`,
    }).click();
    setExportOpen(false);
  };

  const doExportJSON = () => {
    const blob = new Blob([JSON.stringify(rsvps, null, 2)], { type: 'application/json' });
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `lincoln-rsvps-${new Date().toISOString().slice(0,10)}.json` }).click();
    setExportOpen(false);
  };

  // ── Shared styles ───────────────────────────────────────────────────────────
  const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(245,158,11,0.22)', borderRadius: '10px', padding: '0.65rem 0.9rem', color: '#fff' as const, fontSize: '0.87rem', outline: 'none', fontFamily: "'Inter',sans-serif" };
  const btnGhost   = { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.28)', borderRadius: '9px', color: '#F59E0B' as const, cursor: 'pointer' as const, fontSize: '0.8rem', padding: '0.55rem 1rem', fontFamily: "'Inter',sans-serif" };
  const thStyle    = { padding: '0.7rem 1rem', textAlign: 'left' as const, color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500, whiteSpace: 'nowrap' as const, cursor: 'pointer' as const, userSelect: 'none' as const };

  // ═══════════════ LOGIN ══════════════════════════════════════════════════════
  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#060F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", padding: '1rem' }}>
      <div style={{ background: '#0F1E33', border: '1.5px solid rgba(245,158,11,0.3)', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>🔐</div>
          <div style={{ color: '#FCD34D', fontSize: '1.25rem', fontWeight: 700, fontFamily: "'Poppins',sans-serif" }}>Admin Dashboard</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Lincoln's 6th Birthday · RSVP Management</div>
        </div>
        <label style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="Enter admin password"
          style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' as const, marginBottom: '0.85rem' }} />
        {authErr && <div style={{ color: '#F87171', fontSize: '0.75rem', marginBottom: '0.7rem', textAlign: 'center' }}>{authErr}</div>}
        <button onClick={login} style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg,#F59E0B,#FCD34D)', border: 'none', borderRadius: '12px', color: '#0F172A', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", fontSize: '0.95rem' }}>Login →</button>
        <a href="/" style={{ display: 'block', marginTop: '0.75rem', padding: '0.72rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'rgba(255,255,255,0.45)', textAlign: 'center', textDecoration: 'none', fontSize: '0.82rem' }}>← Back to Invitation</a>
      </div>
    </div>
  );

  // ═══════════════ DASHBOARD ══════════════════════════════════════════════════
  return (
    <div style={{ minHeight: '100vh', background: '#060F1A', fontFamily: "'Inter',sans-serif", padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ color: '#FCD34D', fontSize: '1.4rem', fontWeight: 800, fontFamily: "'Poppins',sans-serif" }}>🎂 RSVP Dashboard</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginTop: '0.15rem' }}>
              Lincoln's 6th Birthday · {rsvps.length} response{rsvps.length !== 1 ? 's' : ''}
              {lastFetch && <span style={{ marginLeft: '0.75rem', color: 'rgba(255,255,255,0.22)' }}>Updated {lastFetch}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={fetchRSVPs} disabled={loading} style={{ ...btnGhost, opacity: loading ? 0.5 : 1 }}>
              {loading ? '⟳ Loading...' : '↻ Refresh'}
            </button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setExportOpen(o => !o)} style={{ ...btnGhost, background: 'rgba(245,158,11,0.14)', fontWeight: 600 }}>↓ Export ▾</button>
              {exportOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#0F1E33', border: '1.5px solid rgba(245,158,11,0.28)', borderRadius: '12px', padding: '0.5rem', zIndex: 100, minWidth: '230px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                  {[
                    { label: '📋 Export All (CSV)',          fn: () => doExportCSV('all') },
                    { label: '✅ Export Attending (CSV)',     fn: () => doExportCSV('attending') },
                    { label: '❌ Export Declined (CSV)',      fn: () => doExportCSV('not-attending') },
                    { label: '🔍 Export Current View (CSV)', fn: () => doExportCSV('filtered') },
                    { label: '{ } Export All (JSON)',        fn: doExportJSON },
                  ].map(({ label, fn }) => (
                    <button key={label} onClick={fn}
                      style={{ display: 'block', width: '100%', padding: '0.6rem 0.85rem', background: 'transparent', border: 'none', borderRadius: '8px', color: 'rgba(255,255,255,0.72)', cursor: 'pointer', fontSize: '0.82rem', textAlign: 'left', fontFamily: "'Inter',sans-serif" }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.1)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >{label}</button>
                  ))}
                </div>
              )}
            </div>
            <a href="/" style={{ padding: '0.55rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem', textDecoration: 'none' }}>← Exit</a>
          </div>
        </div>

        {/* Delete toast */}
        {deleteMsg && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '10px', color: '#4ADE80', fontSize: '0.85rem' }}>
            ✓ {deleteMsg}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0.9rem', marginBottom: '2rem' }}>
          <StatBox icon="📬" val={rsvps.length}       label="Total RSVPs" />
          <StatBox icon="✅" val={attending.length}    label="Attending"   color="#4ADE80" />
          <StatBox icon="❌" val={notAttending.length} label="Declined"    color="#F87171" />
          <StatBox icon="👨‍👩" val={totalAdults}         label="Total Adults" />
          <StatBox icon="👦" val={totalChildren}       label="Total Children" />
          <StatBox icon="📊" val={`${attendRate}%`}   label="Attendance Rate" color="#60A5FA" />
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: '0.7rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search name, phone, email..."
            style={{ ...inputStyle, flex: 1, minWidth: '220px' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['all', 'attending', 'not-attending'] as FilterStatus[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '0.6rem 1rem', borderRadius: '9px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: "'Inter',sans-serif", border: `1.5px solid ${filter === f ? '#F59E0B' : 'rgba(245,158,11,0.2)'}`, background: filter === f ? 'rgba(245,158,11,0.15)' : 'transparent', color: filter === f ? '#FCD34D' : 'rgba(255,255,255,0.45)', fontWeight: filter === f ? 600 : 400 }}>
                {f === 'all' ? `All (${rsvps.length})` : f === 'attending' ? `✅ (${attending.length})` : `❌ (${notAttending.length})`}
              </button>
            ))}
          </div>
          {(search || filter !== 'all') && (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</div>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)', background: '#080E18' }}>
          {loading && rsvps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⟳</div>Loading from Google Sheets...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(245,158,11,0.03)' }}>
                  <th style={thStyle} onClick={() => toggleSort('parentName')}>Parent{sortIcon('parentName')}</th>
                  <th style={thStyle} onClick={() => toggleSort('childName')}>Child{sortIcon('childName')}</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Email</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Adults</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Kids</th>
                  <th style={thStyle} onClick={() => toggleSort('attendance')}>Status{sortIcon('attendance')}</th>
                  <th style={thStyle}>Notes</th>
                  <th style={thStyle} onClick={() => toggleSort('timestamp')}>Submitted{sortIcon('timestamp')}</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '3.5rem', color: 'rgba(255,255,255,0.25)' }}>
                      {rsvps.length === 0 ? 'No RSVPs yet — submissions will appear here.' : 'No results match your search.'}
                    </td>
                  </tr>
                ) : filtered.map(({ r, i }) => (
                  <tr key={i}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  >
                    <td style={{ padding: '0.85rem 1rem', color: '#fff', fontWeight: 500 }}>{r.parentName}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.65)' }}>{r.childName}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{r.phone}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>{r.adults}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>{r.children}</td>
                    <td style={{ padding: '0.85rem 1rem' }}><Badge attending={r.attendance === 'attending'} /></td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.38)', fontSize: '0.77rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{fmt(r.timestamp)}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => setSelected({ rsvp: r, index: i })}
                          style={{ background: 'transparent', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '7px', color: '#F59E0B', cursor: 'pointer', fontSize: '0.72rem', padding: '0.28rem 0.6rem' }}>
                          View
                        </button>
                        <button onClick={() => setSelected({ rsvp: r, index: i })}
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '7px', color: '#F87171', cursor: 'pointer', fontSize: '0.72rem', padding: '0.28rem 0.6rem' }}
                          title="Delete entry">
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {rsvps.length > 0 && (
          <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', marginTop: '0.75rem' }}>
            Showing {filtered.length} of {rsvps.length} submissions · Google Sheets
          </div>
        )}
      </div>

      {/* Detail / Delete modal */}
      {selected && (
        <DetailDrawer
          rsvp={selected.rsvp}
          onClose={() => setSelected(null)}
          onDelete={() => handleDelete(selected.index)}
        />
      )}

      {/* Export click-away */}
      {exportOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setExportOpen(false)} />}
    </div>
  );
}
