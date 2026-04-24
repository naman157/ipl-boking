import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { matchesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MatchDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    matchesAPI.getById(id)
      .then(res => { setMatch(res.data); setSelectedCategory(res.data.ticketCategories?.[0]); })
      .catch(() => toast.error('Match not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/matches/${id}/seats`, { state: { category: selectedCategory, quantity } });
  };

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;
  if (!match) return <div className="page"><div className="container" style={{ paddingTop: 40 }}>Match not found.</div></div>;

  const { team1, team2, venue, date, time, matchType, ticketCategories } = match;
  const isFinal = matchType === 'final';

  return (
    <div className="page">
      {/* Match Hero Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${team1.color}22 0%, var(--bg-surface) 40%, ${team2.color}22 100%)`,
        borderBottom: '1px solid var(--border)', padding: '60px 0 40px'
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Link to="/matches" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontFamily: 'Rajdhani, sans-serif', fontSize: 14 }}>
              ← Back to Matches
            </Link>
            <span className="badge badge-orange">Match {match.matchNumber}</span>
            {isFinal && <span className="badge badge-gold">⭐ FINAL</span>}
          </div>

          {/* Teams VS Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 32, flexWrap: 'wrap' }}>
            <TeamHero team={team1} />
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 56, color: 'var(--ipl-orange)', lineHeight: 1 }}>VS</div>
            </div>
            <TeamHero team={team2} />
          </div>

          {/* Match Info */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              { icon: '📅', label: 'Date', val: date ? format(new Date(date), 'EEEE, dd MMMM yyyy') : '—' },
              { icon: '🕐', label: 'Time', val: time },
              { icon: '🏟️', label: 'Venue', val: venue.name },
              { icon: '📍', label: 'City', val: venue.city },
              { icon: '👥', label: 'Capacity', val: `${(venue.capacity / 1000).toFixed(0)}K seats` }
            ].map(({ icon, label, val }) => (
              <div key={label}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{icon} {label}</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 15 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket Selection */}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'start' }}>

          {/* Category Cards */}
          <div>
            <h2 style={{ marginBottom: 24, fontSize: '2rem' }}>SELECT CATEGORY</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ticketCategories?.map(cat => (
                <CategoryCard
                  key={cat.name}
                  category={cat}
                  selected={selectedCategory?.name === cat.name}
                  onSelect={() => setSelectedCategory(cat)}
                />
              ))}
            </div>
          </div>

          {/* Summary Box */}
          <div style={{ minWidth: 300, position: 'sticky', top: 100 }}>
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ marginBottom: 20, fontSize: 20 }}>BOOKING SUMMARY</h3>

              {selectedCategory && (
                <>
                  <div style={{ marginBottom: 20, padding: 16, background: 'var(--bg-surface)', borderRadius: 8 }}>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 18, color: selectedCategory.color || 'var(--ipl-orange)', marginBottom: 4 }}>
                      {selectedCategory.name}
                    </div>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--ipl-gold)' }}>
                      ₹{selectedCategory.price.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>per ticket</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Number of Tickets</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 36, padding: '8px 0' }}>−</button>
                      <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, minWidth: 32, textAlign: 'center' }}>{quantity}</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => setQuantity(Math.min(6, quantity + 1))} style={{ width: 36, padding: '8px 0' }}>+</button>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Max 6 per booking</div>
                  </div>

                  <div className="divider" />

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{quantity} × ₹{selectedCategory.price.toLocaleString()}</span>
                    <span>₹{(selectedCategory.price * quantity).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>Convenience fee (2%)</span>
                    <span>₹{Math.round(selectedCategory.price * quantity * 0.02).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 18 }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--ipl-gold)' }}>
                      ₹{(selectedCategory.price * quantity + Math.round(selectedCategory.price * quantity * 0.02)).toLocaleString()}
                    </span>
                  </div>
                </>
              )}

              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleBook}>
                🎟️ Select Seats
              </button>
              {!user && (
                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
                  You'll need to <Link to="/login" style={{ color: 'var(--ipl-orange)' }}>log in</Link> to book
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamHero({ team }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: `${team.color}22`, border: `3px solid ${team.color}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36
      }}>🏏</div>
      <div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, color: team.color || '#fff', lineHeight: 1 }}>
          {team.shortName}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{team.name}</div>
      </div>
    </div>
  );
}

function CategoryCard({ category, selected, onSelect }) {
  const pct = Math.round((category.availableSeats / category.totalSeats) * 100);
  const low = pct < 20;

  return (
    <div
      className="card"
      onClick={onSelect}
      style={{
        padding: '20px 24px', cursor: 'pointer',
        border: selected ? `2px solid ${category.color || 'var(--ipl-orange)'}` : '1px solid var(--border)',
        background: selected ? `${category.color}11` : 'var(--bg-card)',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
            border: `3px solid ${selected ? (category.color || 'var(--ipl-orange)') : 'var(--text-muted)'}`,
            background: selected ? (category.color || 'var(--ipl-orange)') : 'transparent'
          }} />
          <div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 18, color: selected ? (category.color || 'var(--ipl-orange)') : 'var(--text-primary)' }}>
              {category.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 16 }}>
              <span>{category.availableSeats.toLocaleString()} available</span>
              {low && <span style={{ color: '#ff6b00' }}>⚡ Filling fast</span>}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--ipl-gold)' }}>
            ₹{category.price.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>per ticket</div>
        </div>
      </div>

      {/* Availability bar */}
      <div style={{ marginTop: 12, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: low ? '#ff6b00' : category.color || 'var(--ipl-gold)', borderRadius: 2, transition: 'width 0.5s' }} />
      </div>
    </div>
  );
}
