import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI, matchesAPI } from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORY_META = {
  'Platinum Pavilion': {
    icon: '👑',
    description: 'Best view · Premium hospitality lounge · Padded seats',
    perks: ['Complimentary snacks', 'Dedicated entry gate', 'Premium viewing angle'],
    gradient: 'linear-gradient(135deg, #E5C100 0%, #f5d84a 100%)',
    glow: '#E5C10055',
    textColor: '#1a1200',
  },
  'Gold Stand': {
    icon: '⭐',
    description: 'Excellent sightlines · Covered seating · Great atmosphere',
    perks: ['Covered from rain', 'Great crowd energy', 'Wide seat spacing'],
    gradient: 'linear-gradient(135deg, #FFD700 0%, #ffc200 100%)',
    glow: '#FFD70044',
    textColor: '#1a1200',
  },
  'Silver Stand': {
    icon: '🎟️',
    description: 'Good view · Open stand · Lively section',
    perks: ['Open-air experience', 'Central location', 'Budget-friendly'],
    gradient: 'linear-gradient(135deg, #9ca3af 0%, #d1d5db 100%)',
    glow: '#C0C0C033',
    textColor: '#111',
  },
  'General': {
    icon: '🏟️',
    description: 'Value seating · Open stand · Full match view',
    perks: ['Affordable pricing', 'Large capacity section', 'Full match access'],
    gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
    glow: '#CD7F3233',
    textColor: '#fff',
  },
};

const MAX_TICKETS = 6;

export default function SeatSelectionPage() {
  const { id: matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [proceeding, setProceeding] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await matchesAPI.getById(matchId);
        setMatch(res.data);
        // Auto-select first available category
        const firstAvail = res.data.ticketCategories?.find(c => c.availableSeats > 0);
        if (firstAvail) setSelectedCategory(firstAvail.name);
      } catch {
        toast.error('Failed to load match');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [matchId]);

  const handleProceed = async () => {
    if (!selectedCategory) { toast.error('Please select a category'); return; }
    setProceeding(true);
    try {
      const category = match.ticketCategories.find(c => c.name === selectedCategory);

      // Create booking directly without seat-level holding
      const booking = await bookingsAPI.create({
        matchId,
        categoryName: selectedCategory,
        quantity,
        attendees: Array.from({ length: quantity }, (_, i) => ({ name: `Attendee ${i + 1}` })),
      });

      navigate(`/checkout/${booking.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setProceeding(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="loader" />
    </div>
  );
  if (!match) return <div className="page"><div className="container">Match not found.</div></div>;

  const activeCat = match.ticketCategories?.find(c => c.name === selectedCategory);
  const meta = CATEGORY_META[selectedCategory] || {};
  const subtotal = (activeCat?.price || 0) * quantity;
  const convenience = Math.round(subtotal * 0.02);
  const grandTotal = subtotal + convenience;

  return (
    <div className="page" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 100, maxWidth: 960 }}>

        {/* Back + Title */}
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ← Back to Match
        </button>

        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 4 }}>
          BOOK <span style={{ color: 'var(--ipl-orange)' }}>TICKETS</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>
          {match.team1.shortName} vs {match.team2.shortName} &nbsp;·&nbsp; {match.venue.name}, {match.venue.city} &nbsp;·&nbsp; {match.time}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>

          {/* LEFT — Category Cards */}
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
              Select Ticket Category
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {match.ticketCategories?.map(cat => {
                const m = CATEGORY_META[cat.name] || {};
                const isSelected = selectedCategory === cat.name;
                const isSoldOut = cat.availableSeats === 0;
                const availPct = Math.round((cat.availableSeats / cat.totalSeats) * 100);
                const isLow = availPct < 20 && !isSoldOut;

                return (
                  <div
                    key={cat.name}
                    onClick={() => !isSoldOut && setSelectedCategory(cat.name)}
                    style={{
                      borderRadius: 12,
                      border: isSelected ? `2px solid ${cat.color || '#E5C100'}` : '2px solid var(--border)',
                      background: isSelected ? `${cat.color || '#E5C100'}0f` : 'var(--bg-card)',
                      cursor: isSoldOut ? 'not-allowed' : 'pointer',
                      opacity: isSoldOut ? 0.45 : 1,
                      transition: 'all 0.2s',
                      overflow: 'hidden',
                      boxShadow: isSelected ? `0 0 20px ${cat.color || '#E5C100'}22` : 'none',
                    }}
                  >
                    {/* Top bar */}
                    <div style={{
                      background: isSelected ? (m.gradient || cat.color) : 'var(--bg-surface)',
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 22 }}>{m.icon || '🎟️'}</span>
                        <div>
                          <div style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            fontWeight: 700,
                            fontSize: 17,
                            color: isSelected ? (m.textColor || '#000') : 'var(--text-primary)',
                            letterSpacing: '0.03em'
                          }}>
                            {cat.name}
                          </div>
                          <div style={{ fontSize: 12, color: isSelected ? (m.textColor || '#333') : 'var(--text-muted)', opacity: 0.85 }}>
                            {m.description}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          fontWeight: 800,
                          fontSize: 22,
                          color: isSelected ? (m.textColor || '#000') : 'var(--ipl-gold)',
                        }}>
                          ₹{cat.price.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: isSelected ? (m.textColor || '#333') : 'var(--text-muted)', opacity: 0.8 }}>
                          per ticket
                        </div>
                      </div>
                    </div>

                    {/* Bottom detail */}
                    <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 16 }}>
                        {(m.perks || []).slice(0, 2).map((p, i) => (
                          <span key={i} style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ color: cat.color || 'var(--ipl-orange)', fontSize: 10 }}>✓</span> {p}
                          </span>
                        ))}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {isSoldOut ? (
                          <span style={{ fontSize: 12, color: '#ef4444', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>SOLD OUT</span>
                        ) : isLow ? (
                          <span style={{ fontSize: 12, color: '#f97316', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>
                            ⚡ Only {cat.availableSeats.toLocaleString()} left
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {cat.availableSeats.toLocaleString()} available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stadium zone diagram */}
            <div style={{ marginTop: 28, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, textAlign: 'center' }}>
                Stadium Zone Map — {match.venue.name}
              </p>
              <StadiumDiagram categories={match.ticketCategories} selected={selectedCategory} onSelect={setSelectedCategory} />
            </div>
          </div>

          {/* RIGHT — Summary + Quantity */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                background: activeCat ? (meta.gradient || `${activeCat.color}22`) : 'var(--bg-surface)',
                padding: '18px 20px',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 18, color: activeCat ? (meta.textColor || 'var(--text-primary)') : 'var(--text-muted)' }}>
                  {selectedCategory || 'No category selected'}
                </div>
                {activeCat && (
                  <div style={{ fontSize: 13, color: activeCat ? (meta.textColor || 'var(--text-secondary)') : 'var(--text-muted)', opacity: 0.85, marginTop: 2 }}>
                    ₹{activeCat.price.toLocaleString()} per ticket
                  </div>
                )}
              </div>

              <div style={{ padding: '20px' }}>
                {/* Quantity selector */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    Number of Tickets
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: 20, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >−</button>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 28, minWidth: 32, textAlign: 'center', color: 'var(--ipl-orange)' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(MAX_TICKETS, activeCat ? Math.min(MAX_TICKETS, activeCat.availableSeats, q + 1) : q + 1))}
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: 20, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >+</button>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Max {MAX_TICKETS}</span>
                  </div>
                </div>

                {/* Quick quantity buttons */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button
                      key={n}
                      onClick={() => setQuantity(n)}
                      style={{
                        width: 36, height: 32, borderRadius: 6,
                        border: quantity === n ? '1.5px solid var(--ipl-orange)' : '1px solid var(--border)',
                        background: quantity === n ? 'var(--ipl-orange)' : 'var(--bg-surface)',
                        color: quantity === n ? '#fff' : 'var(--text-secondary)',
                        fontSize: 13, cursor: 'pointer',
                        fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
                        transition: 'all 0.15s',
                      }}
                    >{n}</button>
                  ))}
                </div>

                {/* Price breakdown */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    <span>{quantity} × ₹{activeCat?.price?.toLocaleString() || 0}</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                    <span>Convenience fee (2%)</span>
                    <span>₹{convenience.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 22 }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--ipl-gold)' }}>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px', opacity: (!selectedCategory || proceeding) ? 0.6 : 1 }}
                  onClick={handleProceed}
                  disabled={!selectedCategory || proceeding}
                >
                  {proceeding ? <span className="spinner" /> : 'Proceed to Checkout →'}
                </button>

                <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
                  Seats will be assigned automatically from the selected block
                </p>
              </div>
            </div>

            {/* Match info card */}
            <div style={{
              marginTop: 14,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '14px 18px',
              fontSize: 13,
              color: 'var(--text-muted)',
              lineHeight: 2,
            }}>
              <div>📅 {new Date(match.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div>🕐 {match.time}</div>
              <div>📍 {match.venue.name}</div>
              <div>🏏 Match #{match.matchNumber}{match.matchType ? ` · ${match.matchType.toUpperCase()}` : ''}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StadiumDiagram({ categories, selected, onSelect }) {
  const zones = [
    { key: 'General', label: 'GEN', rx: 170, ry: 120, fill: '#CD7F32' },
    { key: 'Silver Stand', label: 'SIL', rx: 130, ry: 90, fill: '#C0C0C0' },
    { key: 'Gold Stand', label: 'GLD', rx: 90, ry: 62, fill: '#FFD700' },
    { key: 'Platinum Pavilion', label: 'PLT', rx: 52, ry: 36, fill: '#E5C100' },
  ];

  return (
    <svg viewBox="0 0 380 260" style={{ width: '100%', maxWidth: 380, margin: '0 auto', display: 'block' }}>
      {zones.map(z => {
        const cat = categories?.find(c => c.name === z.key);
        const isSelected = selected === z.key;
        const isSoldOut = cat?.availableSeats === 0;
        return (
          <g key={z.key} onClick={() => !isSoldOut && onSelect(z.key)} style={{ cursor: isSoldOut ? 'not-allowed' : 'pointer' }}>
            <ellipse
              cx={190} cy={130}
              rx={z.rx} ry={z.ry}
              fill={`${z.fill}${isSelected ? '44' : '18'}`}
              stroke={isSelected ? z.fill : `${z.fill}77`}
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
            <text x={190} y={130 - z.ry + 16} textAnchor="middle"
              fill={isSelected ? z.fill : `${z.fill}cc`}
              fontSize={10}
              fontFamily="Rajdhani, sans-serif"
              fontWeight="700"
              letterSpacing="1"
            >{z.label}</text>
          </g>
        );
      })}
      {/* Pitch */}
      <ellipse cx={190} cy={130} rx={22} ry={14} fill="rgba(0,200,80,0.25)" stroke="rgba(0,200,80,0.5)" strokeWidth={1.5} />
      <text x={190} y={134} textAnchor="middle" fontSize={9} fill="rgba(0,200,80,0.9)" fontFamily="Rajdhani, sans-serif">PITCH</text>
    </svg>
  );
}