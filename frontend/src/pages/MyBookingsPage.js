import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    bookingsAPI.getMyBookings()
      .then(res => setBookings(res.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id);
    try {
      await bookingsAPI.cancel(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cancellation failed');
    } finally {
      setCancelling(null);
    }
  };

  const STATUS_CONFIG = {
    confirmed: { label: 'Confirmed', badge: 'badge-green', icon: '✓' },
    pending:   { label: 'Pending',   badge: 'badge-orange', icon: '⏳' },
    cancelled: { label: 'Cancelled', badge: 'badge-red',    icon: '✕' },
    refunded:  { label: 'Refunded',  badge: 'badge-gray',   icon: '↩' }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div className="badge badge-orange" style={{ marginBottom: 12 }}>My Account</div>
          <h1>MY <span style={{ color: 'var(--ipl-orange)' }}>TICKETS</span></h1>
          <p>Your booking history and upcoming matches</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div className="loader" style={{ margin: '0 auto' }} /></div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎟️</div>
            <h2 style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No bookings yet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Book your first IPL ticket and join the action!</p>
            <Link to="/matches" className="btn btn-primary">Browse Matches</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 60 }}>
            {bookings.map((b, i) => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              const match = b.match;
              const isConfirmed = b.status === 'confirmed';
              const isPast = match?.date ? new Date(match.date) < new Date() : false;

              return (
                <div key={b._id} className="card" style={{ padding: 0, overflow: 'hidden', animation: `fadeUp 0.4s ease ${i * 0.08}s both` }}>
                  {/* Top strip */}
                  <div style={{
                    height: 4,
                    background: match ? `linear-gradient(90deg, ${match.team1?.color || '#ff6b00'}, ${match.team2?.color || '#ffd700'})` : 'var(--border)'
                  }} />

                  <div style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <h3 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28 }}>
                            {match?.team1?.shortName || '—'} <span style={{ color: 'var(--ipl-orange)' }}>VS</span> {match?.team2?.shortName || '—'}
                          </h3>
                          <span className={`badge ${cfg.badge}`}>{cfg.icon} {cfg.label}</span>
                          {isPast && isConfirmed && <span className="badge badge-gray">Past Match</span>}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 14, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                          <span>📅 {match?.date ? format(new Date(match.date), 'dd MMM yyyy') : '—'} · {match?.time}</span>
                          <span>🏟️ {match?.venue?.name}, {match?.venue?.city}</span>
                          <span>🎫 Match {match?.matchNumber}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--ipl-gold)' }}>
                          ₹{b.grandTotal?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.bookingId}</div>
                      </div>
                    </div>

                    {/* Seats */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      {b.seats?.map(s => (
                        <div key={s.seatNumber} style={{
                          padding: '4px 12px',
                          background: isConfirmed ? 'rgba(0,230,118,0.08)' : 'var(--bg-surface)',
                          border: `1px solid ${isConfirmed ? 'rgba(0,230,118,0.2)' : 'var(--border)'}`,
                          borderRadius: 6, fontSize: 14, fontFamily: 'Rajdhani, sans-serif', fontWeight: 600
                        }}>
                          {s.seatNumber}
                          <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}> {s.category}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {isConfirmed && (
                        <Link to={`/booking/${b._id}/confirm`} className="btn btn-ghost btn-sm">
                          🎟️ View Ticket
                        </Link>
                      )}
                      {(b.status === 'confirmed' || b.status === 'pending') && !isPast && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--ipl-red)', borderColor: 'var(--ipl-red)' }}
                          onClick={() => handleCancel(b._id)}
                          disabled={cancelling === b._id}
                        >
                          {cancelling === b._id ? <span className="spinner" /> : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
