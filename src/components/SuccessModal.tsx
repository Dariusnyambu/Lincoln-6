'use client';
import { useEffect } from 'react';

interface Props {
  onClose: () => void;
}

export default function SuccessModal({ onClose }: Props) {
  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
      {/* Confetti layer */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1000 }}>
        {Array.from({ length: 70 }).map((_, i) => (
          <div key={i} className="confetti-particle" style={{
            left: `${Math.random() * 100}%`,
            width:  `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
            backgroundColor: ['#F59E0B','#FCD34D','#fff','#FB923C','#FDE68A','#4ADE80'][i % 6],
            animationDuration: `${2.5 + Math.random() * 2.5}s`,
            animationDelay:    `${Math.random() * 1.5}s`,
            transform:         `rotate(${Math.random() * 360}deg)`,
          }} />
        ))}
      </div>

      <div style={{ background: '#0F1E33', border: '1.5px solid rgba(245,158,11,0.42)', borderRadius: '24px', padding: '2.5rem', maxWidth: '460px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1001 }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.9rem' }}>🎉</div>
        <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#FCD34D', fontFamily: "'Poppins', sans-serif", marginBottom: '0.7rem' }}>Thank You!</div>
        <div style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: '1.5rem', fontSize: '0.93rem' }}>
          Your RSVP has been successfully received.<br /><br />
          We look forward to celebrating <strong style={{ color: '#FCD34D' }}>Lincoln's 6th Birthday</strong> with you on{' '}
          <strong style={{ color: '#FCD34D' }}>Saturday, 20th June 2026 at 1:30 PM</strong>.<br /><br />
          <span style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.45)' }}>📍 The Nord Mall, 3rd Floor (Mini Boss Play Area)</span><br />
          <span style={{ fontSize: '0.85rem', color: '#F59E0B', marginTop: '0.4rem', display: 'block' }}>👟 Please remember to bring socks for both parent and child!</span>
        </div>
        <button onClick={onClose} style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', border: 'none', borderRadius: '12px', padding: '0.88rem 2.2rem', color: '#0F172A', fontWeight: 700, fontSize: '0.94rem', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
          See You There! 🎂
        </button>
      </div>
    </div>
  );
}
