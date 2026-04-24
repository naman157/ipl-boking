import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI, paymentsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: user?.name || '' });
  const [timeLeft, setTimeLeft] = useState(600); // 10 min

  useEffect(() => {
    bookingsAPI.getById(bookingId)
      .then(res => setBooking(res.data))
      .catch(() => toast.error('Booking not found'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { clearInterval(t); toast.error('Session expired. Please re-select seats.'); navigate(-1); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [navigate]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handlePay = async () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      toast.error('Please fill all card details'); return;
    }
    setPaying(true);
    try {
      // In production: integrate Stripe Elements for real card processing
      // This simulates a successful payment for demo purposes
      await new Promise(r => setTimeout(r, 2000));

      const confirmed = await bookingsAPI.confirm(bookingId, `pi_demo_${Date.now()}`);
      toast.success('🎉 Payment successful!');
      navigate(`/booking/${bookingId}/confirm`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
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

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <div className="badge badge-orange" style={{ marginBottom: 10 }}>Step 3 of 3</div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>CHECKOUT</h1>
          </div>
          {/* Timer */}
          <div style={{
            padding: '10px 20px', background: timeLeft < 120 ? 'rgba(230,57,70,0.15)' : 'rgba(255,107,0,0.1)',
            border: `1px solid ${timeLeft < 120 ? 'rgba(230,57,70,0.4)' : 'rgba(255,107,0,0.3)'}`,
            borderRadius: 8, textAlign: 'center'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Seats held for</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: timeLeft < 120 ? 'var(--ipl-red)' : 'var(--ipl-orange)' }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
          {/* Payment Form */}
          <div>
            {/* Match summary */}
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, marginBottom: 16, color: 'var(--text-secondary)' }}>ORDER SUMMARY</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22 }}>
                    {match?.team1?.shortName} <span style={{ color: 'var(--ipl-orange)' }}>VS</span> {match?.team2?.shortName}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {match?.venue?.name} · {match?.date ? format(new Date(match.date), 'dd MMM yyyy') : ''}
                  </div>
                </div>
                <span className="badge badge-orange">Match {match?.matchNumber}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {seats?.map(s => (
                  <div key={s.seatNumber} style={{
                    padding: '4px 12px', background: 'var(--bg-surface)',
                    border: '1px solid var(--border)', borderRadius: 6,
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 14
                  }}>
                    {s.seatNumber} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({s.category})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card form */}
            <div className="card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ fontSize: 24 }}>💳</div>
                <h3 style={{ fontSize: 18 }}>PAYMENT DETAILS</h3>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  {['VISA', 'MC', 'AMEX', 'UPI'].map(p => (
                    <div key={p} style={{
                      padding: '2px 8px', background: 'var(--bg-surface)',
                      border: '1px solid var(--border)', borderRadius: 4,
                      fontSize: 10, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: 'var(--text-muted)'
                    }}>{p}</div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input className="form-input" placeholder="Name on card" value={cardDetails.name}
                  onChange={e => setCardDetails(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input className="form-input" placeholder="1234 5678 9012 3456" maxLength={19}
                  value={cardDetails.number}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                    const formatted = v.match(/.{1,4}/g)?.join(' ') || v;
                    setCardDetails(p => ({ ...p, number: formatted }));
                  }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input className="form-input" placeholder="MM/YY" maxLength={5}
                    value={cardDetails.expiry}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                      setCardDetails(p => ({ ...p, expiry: v }));
                    }} />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input className="form-input" placeholder="•••" maxLength={4} type="password"
                    value={cardDetails.cvv}
                    onChange={e => setCardDetails(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                </div>
              </div>

              <div style={{
                padding: '12px 16px', background: 'rgba(0,230,118,0.06)',
                border: '1px solid rgba(0,230,118,0.2)', borderRadius: 8,
                fontSize: 13, color: 'var(--success)', display: 'flex', gap: 8, marginBottom: 4
              }}>
                🔒 Your payment is secured with 256-bit SSL encryption
              </div>
            </div>
          </div>

          {/* Price breakdown */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20, fontSize: 18 }}>PRICE BREAKDOWN</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {seats?.map(s => (
                  <div key={s.seatNumber} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
                    <span>{s.seatNumber} ({s.category})</span>
                    <span>₹{s.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                <span>Subtotal</span><span>₹{totalAmount?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                <span>Convenience Fee</span><span>₹{convenienceFee?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 22 }}>
                <span>Grand Total</span>
                <span style={{ color: 'var(--ipl-gold)' }}>₹{grandTotal?.toLocaleString()}</span>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: 18 }}
                onClick={handlePay}
                disabled={paying}
              >
                {paying ? <><span className="spinner" /> Processing...</> : `Pay ₹${grandTotal?.toLocaleString()}`}
              </button>

              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                onClick={handleCancel}
              >
                Cancel Booking
              </button>

              <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                Booking ID: {booking.bookingId}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
