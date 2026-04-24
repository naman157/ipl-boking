import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// ✅ YOUR WHATSAPP NUMBER — include country code, no + or spaces
const WHATSAPP_NUMBER = '919XXXXXXXXX'; // e.g. 919876543210 for +91 98765 43210

function buildWhatsAppMessage(booking, user) {
  const { match, seats, totalAmount, convenienceFee, grandTotal, bookingId } = booking;

  const matchDate = match?.date
    ? format(new Date(match.date), 'dd MMM yyyy')
    : '';

  // Group seats by category
  const categoryGroups = seats?.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  const seatSummary = Object.entries(categoryGroups || {})
    .map(([cat, qty]) => `  • ${qty}x ${cat}`)
    .join('\n');

  const message = `
🏏 *IPL TICKET BOOKING REQUEST*
━━━━━━━━━━━━━━━━━━━━━
📋 *Booking ID:* ${bookingId}
👤 *Name:* ${user?.name || 'Guest'}
📧 *Email:* ${user?.email || 'N/A'}

🆚 *Match:* ${match?.team1?.shortName} vs ${match?.team2?.shortName}
🔢 *Match No:* #${match?.matchNumber}${match?.matchType ? ` (${match.matchType.toUpperCase()})` : ''}
📅 *Date:* ${matchDate}
🕐 *Time:* ${match?.time}
📍 *Venue:* ${match?.venue?.name}, ${match?.venue?.city}

🎟️ *Tickets:*
${seatSummary}

💰 *Price Breakdown:*
  Subtotal: ₹${totalAmount?.toLocaleString()}
  Convenience Fee: ₹${convenienceFee?.toLocaleString()}
  *Grand Total: ₹${grandTotal?.toLocaleString()}*
━━━━━━━━━━━━━━━━━━━━━
Please confirm this booking. Thank you! 🙏
`.trim();

  return encodeURIComponent(message);
}

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    bookingsAPI.getById(bookingId)
      .then(res => setBooking(res.data))
      .catch(() => toast.error('Booking not found'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) {
        clearInterval(t);
        toast.error('Session expired. Please re-select.');
        navigate(-1);
        return 0;
      }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [navigate]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleConfirmAndWhatsApp = async () => {
    setConfirming(true);
    try {
      // Confirm booking in backend
      await bookingsAPI.confirm(bookingId, `whatsapp_${Date.now()}`);

      // Build and open WhatsApp
      const msg = buildWhatsAppMessage(booking, user);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
      window.open(url, '_blank');

      toast.success('Booking confirmed! Redirecting to WhatsApp...');
      navigate(`/booking/${bookingId}/confirm`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    await bookingsAPI.cancel(bookingId).catch(() => {});
    navigate('/matches');
  };

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;
  if (!booking) return <div className="page"><div className="container" style={{ paddingTop: 40 }}>Booking not found.</div></div>;

  const { match, seats, totalAmount, convenienceFee, grandTotal } = booking;

  // Group seats by category for display
  const categoryGroups = seats?.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = { count: 0, price: s.price };
    acc[s.category].count += 1;
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 900 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <div className="badge badge-orange" style={{ marginBottom: 10 }}>Step 3 of 3</div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>CHECKOUT</h1>
          </div>
          {/* Countdown */}
          <div style={{
            padding: '10px 20px',
            background: timeLeft < 120 ? 'rgba(230,57,70,0.15)' : 'rgba(255,107,0,0.1)',
            border: `1px solid ${timeLeft < 120 ? 'rgba(230,57,70,0.4)' : 'rgba(255,107,0,0.3)'}`,
            borderRadius: 8, textAlign: 'center'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Expires in
            </div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: timeLeft < 120 ? 'var(--ipl-red)' : 'var(--ipl-orange)' }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            {/* Match summary */}
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-secondary)', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.08em' }}>
                ORDER SUMMARY
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24 }}>
                    {match?.team1?.shortName} <span style={{ color: 'var(--ipl-orange)' }}>VS</span> {match?.team2?.shortName}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                    {match?.venue?.name} · {match?.date ? format(new Date(match.date), 'dd MMM yyyy') : ''} · {match?.time}
                  </div>
                </div>
                <span className="badge badge-orange">Match #{match?.matchNumber}</span>
              </div>

              {/* Category breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(categoryGroups || {}).map(([cat, { count, price }]) => (
                  <div key={cat} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}>
                    <div>
                      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 15 }}>{cat}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 8 }}>× {count}</span>
                    </div>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 15 }}>
                      ₹{(price * count).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Booker info */}
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-secondary)', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.08em' }}>
                ATTENDEE DETAILS
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</div>
                  <div style={{ fontSize: 15, color: 'var(--text-primary)' }}>{user?.name || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</div>
                  <div style={{ fontSize: 15, color: 'var(--text-primary)' }}>{user?.email || '—'}</div>
                </div>
              </div>
            </div>

            {/* WhatsApp info box */}
            <div style={{
              padding: '18px 20px',
              background: 'rgba(37,211,102,0.07)',
              border: '1px solid rgba(37,211,102,0.3)',
              borderRadius: 12,
              display: 'flex', gap: 16, alignItems: 'flex-start'
            }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>💬</div>
              <div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 16, color: '#25d366', marginBottom: 4 }}>
                  WhatsApp Booking Confirmation
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  After clicking <strong>Confirm Booking</strong>, you'll be redirected to WhatsApp with your full booking details pre-filled. Simply send the message to complete your reservation.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Price & CTA */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20, fontSize: 18 }}>PRICE BREAKDOWN</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {Object.entries(categoryGroups || {}).map(([cat, { count, price }]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
                    <span>{count}× {cat}</span>
                    <span>₹{(price * count).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                <span>Subtotal</span><span>₹{totalAmount?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                <span>Convenience Fee (2%)</span><span>₹{convenienceFee?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 22 }}>
                <span>Grand Total</span>
                <span style={{ color: 'var(--ipl-gold)' }}>₹{grandTotal?.toLocaleString()}</span>
              </div>

              {/* WhatsApp confirm button */}
              <button
                onClick={handleConfirmAndWhatsApp}
                disabled={confirming}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 10,
                  border: 'none',
                  background: confirming ? '#1a9e4a' : 'linear-gradient(135deg, #25d366, #128c7e)',
                  color: '#fff',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 800,
                  fontSize: 17,
                  cursor: confirming ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 4px 20px rgba(37,211,102,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {confirming ? (
                  <><span className="spinner" /> Confirming...</>
                ) : (
                  <> <span style={{ fontSize: 20 }}>💬</span> Confirm &amp; Send on WhatsApp</>
                )}
              </button>

              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                onClick={handleCancel}
              >
                Cancel Booking
              </button>

              <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                Booking ID: <span style={{ color: 'var(--text-secondary)' }}>{booking.bookingId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}