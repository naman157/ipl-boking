import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../utils/api';
import { format } from 'date-fns';

export default function BookingConfirmPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.getById(bookingId)
      .then(res => setBooking(res.data))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;
  if (!booking) return <div className="page"><div className="container" style={{ paddingTop: 40 }}>Booking not found.</div></div>;

  const { match, seats, grandTotal, bookingId: ref, qrCode } = booking;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 700 }}>
        {/* Success Banner */}
        <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeUp 0.6s ease both' }}>
          <div style={{ fontSize: 72, marginBottom: 16, animation: 'pulse 2s ease 3' }}>🎉</div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'var(--success)', marginBottom: 8 }}>
            BOOKING CONFIRMED!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18 }}>
            Your tickets are ready. See you at the stadium!
          </p>
        </div>

        {/* E-Ticket Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(0,230,118,0.3)',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 0 40px rgba(0,230,118,0.1)',
          animation: 'fadeUp 0.6s ease 0.2s both'
        }}>
          {/* Ticket top gradient */}
          <div style={{
            height: 6,
            background: match ? `linear-gradient(90deg, ${match.team1.color || '#ff6b00'}, ${match.team2.color || '#ffd700'})` : 'linear-gradient(90deg, #ff6b00, #ffd700)'
          }} />

          <div style={{ padding: '32px 36px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              <div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 4 }}>
                  E-TICKET · IPL 2025
                </div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, lineHeight: 1 }}>
                  {match?.team1?.shortName} <span style={{ color: 'var(--ipl-orange)' }}>VS</span> {match?.team2?.shortName}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="badge badge-green" style={{ marginBottom: 6 }}>✓ CONFIRMED</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>{ref}</div>
              </div>
            </div>

            {/* Match details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
              {[
                { icon: '📅', label: 'Date', val: match?.date ? format(new Date(match.date), 'dd MMM yyyy') : '—' },
                { icon: '🕐', label: 'Time', val: match?.time || '—' },
                { icon: '🏟️', label: 'Venue', val: match?.venue?.name || '—' }
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{icon} {label}</div>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 14 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Seat details */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                YOUR SEATS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {seats?.map(s => (
                  <div key={s.seatNumber} style={{
                    padding: '10px 16px', background: 'rgba(0,230,118,0.08)',
                    border: '1px solid rgba(0,230,118,0.25)', borderRadius: 8
                  }}>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--success)', lineHeight: 1 }}>{s.seatNumber}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.category}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>₹{s.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashed divider (perforated ticket look) */}
            <div style={{ borderTop: '2px dashed rgba(255,255,255,0.1)', margin: '24px 0' }} />

            {/* QR + Total */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {/* Fake QR code visual */}
              <div style={{
                width: 100, height: 100, background: 'var(--bg-surface)',
                border: '2px solid var(--border)', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 48, flexShrink: 0
              }}>📲</div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Show this QR at the gate
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, wordBreak: 'break-all' }}>
                  {qrCode || `IPL-QR-${ref}`}
                </div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--ipl-gold)' }}>
                  Total Paid: ₹{grandTotal?.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 16, marginTop: 32, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.5s ease 0.4s both' }}>
          <Link to="/my-bookings" className="btn btn-primary">📋 View All Bookings</Link>
          <Link to="/matches" className="btn btn-secondary">🏏 Book More Tickets</Link>
          <button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Print Ticket</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 13 }}>
          A confirmation email will be sent to your registered email address.
        </div>
      </div>
    </div>
  );
}
