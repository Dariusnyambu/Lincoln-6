'use client';
import { useState, useEffect } from 'react';

export default function Countdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, started: false });

  useEffect(() => {
    const target = new Date('2026-06-20T13:30:00');
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0, started: true });
        return;
      }
      setTime({
        days:    Math.floor(diff / 86_400_000),
        hours:   Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
        started: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (time.started) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
        <div style={{ color: '#FCD34D', fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
          The Party Has Started!
        </div>
      </div>
    );
  }

  const units = [
    { label: 'Days',    value: time.days },
    { label: 'Hours',   value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ];

  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', margin: '2rem 0' }}>
      {units.map(({ label, value }) => (
        <div
          key={label}
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(245,158,11,0.5)',
            borderRadius: '16px',
            padding: '1rem 1.4rem',
            minWidth: '78px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FCD34D', fontFamily: "'Poppins', sans-serif", lineHeight: 1 }}>
            {String(value).padStart(2, '0')}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem', marginTop: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
