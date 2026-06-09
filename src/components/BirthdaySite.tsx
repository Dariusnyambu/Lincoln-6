'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { RSVPData } from '@/lib/types';

const Countdown    = dynamic(() => import('./Countdown'),    { ssr: false });
const RSVPForm     = dynamic(() => import('./RSVPForm'),     { ssr: false });
const SuccessModal = dynamic(() => import('./SuccessModal'), { ssr: false });

// ─── Detail Card ─────────────────────────────────────────────────────────────
function DetailCard({ icon, title, value }: { icon: string; title: string; value: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? '#1E293B' : '#0F1E33', border: `1.5px solid ${hov ? '#F59E0B' : 'rgba(245,158,11,0.22)'}`, borderRadius: '20px', padding: '1.75rem', transition: 'all 0.3s', transform: hov ? 'translateY(-5px)' : 'none', boxShadow: hov ? '0 14px 34px rgba(245,158,11,0.13)' : 'none', cursor: 'default' }}>
      <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(252,211,77,0.1))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>{icon}</div>
      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>{title}</div>
      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem', lineHeight: 1.5, fontFamily: "'Poppins', sans-serif" }}>{value}</div>
    </div>
  );
}

// ─── Main Site ────────────────────────────────────────────────────────────────
export default function BirthdaySite() {
  const [success, setSuccess] = useState<RSVPData | null>(null);

  // Floating balloons
  const balloons = ['🎈','🎀','🎁','🎊','🎈','🎊','🎀','🎈','🎁','🎊','🎈','🎊'];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#060F1A', color: '#fff', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '6rem 1.5rem 4rem', background: 'radial-gradient(ellipse at 50% 0%,rgba(245,158,11,.11) 0%,transparent 60%),linear-gradient(180deg,#060F1A 0%,#0C1929 100%)' }}>

        {/* Balloons */}
        {balloons.map((b, i) => (
          <div key={i} className="balloon" style={{ left: `${(i * 8.3) % 100}%`, fontSize: `${24 + (i % 3) * 7}px`, animationDuration: `${5 + (i % 3)}s`, animationDelay: `${i * 0.6}s` }}>{b}</div>
        ))}

        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 520, height: 280, background: 'radial-gradient(ellipse,rgba(245,158,11,.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px' }} className="fade-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.4)', borderRadius: '100px', padding: '.45rem 1.2rem', fontSize: '.82rem', color: '#FCD34D', fontWeight: 600, marginBottom: '1.4rem', letterSpacing: '.05em' }}>
            🎉 Birthday Celebration
          </div>

          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(2.4rem,8vw,4.5rem)', fontWeight: 900, lineHeight: 1.08, marginBottom: '.6rem', background: 'linear-gradient(135deg,#fff 0%,#FCD34D 50%,#F59E0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Lincoln is Turning 6!
          </h1>

          <p style={{ color: 'rgba(255,255,255,.58)', fontSize: 'clamp(.95rem,2.5vw,1.15rem)', lineHeight: 1.7 }}>
            We are delighted to invite you to celebrate this special day with us.
          </p>

          <Countdown />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.8rem', justifyContent: 'center', marginBottom: '2.4rem' }}>
            {[['📅','Saturday, 20th June 2026'],['🕒','1:30 PM'],['📍','The Nord Mall, 3rd Floor']].map(([icon,text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '.45rem', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '100px', padding: '.45rem .95rem', fontSize: '.82rem', color: 'rgba(255,255,255,.72)' }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#rsvp" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#F59E0B,#FCD34D)', color: '#0F172A', fontWeight: 700, padding: '.9rem 2.4rem', borderRadius: '14px', fontSize: '.98rem', textDecoration: 'none', fontFamily: "'Poppins', sans-serif", letterSpacing: '.03em' }}>
              🎊 RSVP Now
            </a>
            <a href="#details" style={{ display: 'inline-block', background: 'transparent', color: '#FCD34D', fontWeight: 600, padding: '.9rem 2.4rem', borderRadius: '14px', fontSize: '.95rem', textDecoration: 'none', border: '1.5px solid rgba(245,158,11,.4)', letterSpacing: '.03em' }}>
              View Details
            </a>
          </div>
        </div>
      </section>

      {/* ── Event Details ── */}
      <section id="details" style={{ padding: '4.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.8rem' }}>
            <div style={{ color: '#F59E0B', fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '.4rem' }}>Event Details</div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: '#fff' }}>Everything You Need to Know</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1.2rem' }}>
            <DetailCard icon="📅" title="Date"          value="Saturday, 20th June 2026" />
            <DetailCard icon="🕒" title="Time"          value="1:30 PM" />
            <DetailCard icon="📍" title="Venue"         value="The Nord Mall, 3rd Floor — Mini Boss Play Area" />
            <DetailCard icon="🧦" title="Reminder"      value="Bring socks for both parent and child" />
            <DetailCard icon="🎁" title="Gift Reminder" value="Please come along with a gift" />
          </div>
        </div>
      </section>

      {/* ── RSVP Form ── */}
      <section id="rsvp" style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.4rem' }}>
            <div style={{ color: '#F59E0B', fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '.4rem' }}>RSVP</div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(1.75rem,4vw,2.4rem)', fontWeight: 800, color: '#fff', marginBottom: '.7rem' }}>Confirm Your Attendance</div>
            <p style={{ color: 'rgba(255,255,255,.5)', lineHeight: 1.7 }}>Please let us know if you'll be joining us for Lincoln's special day.</p>
          </div>
          <div style={{ background: '#0F1E33', border: '1.5px solid rgba(245,158,11,.22)', borderRadius: '24px', padding: '2.4rem' }}>
            <RSVPForm onSuccess={setSuccess} />
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section style={{ padding: '0 1.5rem 4.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ color: '#F59E0B', fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '.4rem' }}>Location</div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800, color: '#fff' }}>Find Us</div>
        </div>
        <div style={{ background: '#0F1E33', border: '1.5px solid rgba(245,158,11,.2)', borderRadius: '24px', overflow: 'hidden' }}>
          <iframe
            title="The Nord Mall"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8175!2d36.8074!3d-1.2856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f172ef5427c27%3A0x4e5da6e4e1b2d40!2sThe%20Nord%20Mall%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
            width="100%" height="320" style={{ display: 'block', border: 0 }} loading="lazy" allowFullScreen
          />
          <div style={{ padding: '1.4rem 2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>The Nord Mall</div>
              <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '.82rem' }}>3rd Floor, Mini Boss Play Area · Nairobi</div>
            </div>
            <div style={{ display: 'flex', gap: '.7rem' }}>
              <a href="https://maps.google.com/?q=The+Nord+Mall+Nairobi" target="_blank" rel="noreferrer" style={{ padding: '.58rem 1.2rem', background: 'linear-gradient(135deg,#F59E0B,#FCD34D)', borderRadius: '10px', color: '#0F172A', fontWeight: 700, fontSize: '.83rem', textDecoration: 'none' }}>Get Directions</a>
              <a href="https://maps.google.com/?q=The+Nord+Mall+Nairobi" target="_blank" rel="noreferrer" style={{ padding: '.58rem 1.2rem', background: 'transparent', border: '1px solid rgba(245,158,11,.3)', borderRadius: '10px', color: '#FCD34D', fontWeight: 600, fontSize: '.83rem', textDecoration: 'none' }}>Open in Maps</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(245,158,11,.1)', padding: '3rem 1.5rem', textAlign: 'center', background: 'rgba(0,0,0,.18)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '.7rem' }}>🎂</div>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#FCD34D', marginBottom: '.4rem' }}>Lincoln's 6th Birthday Celebration</div>
        <div style={{ color: 'rgba(255,255,255,.38)', fontSize: '.83rem', marginBottom: '.22rem' }}>Thank you for celebrating this special day with us.</div>
        <div style={{ color: 'rgba(255,255,255,.28)', fontSize: '.78rem' }}>Saturday, 20th June 2026 · The Nord Mall, 3rd Floor (Mini Boss Play Area)</div>
        <div style={{ color: 'rgba(245,158,11,.35)', fontSize: '.72rem', marginTop: '.9rem' }}>Made with ❤️ for Lincoln</div>
        <a href="/admin" style={{ display: 'block', marginTop: '1.2rem', color: 'rgba(255,255,255,.08)', fontSize: '.68rem', textDecoration: 'none' }}>Admin</a>
      </footer>

      {/* ── Success Modal ── */}
      {success && <SuccessModal onClose={() => setSuccess(null)} />}
    </div>
  );
}
