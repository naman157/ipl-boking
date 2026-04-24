import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { seatsAPI, bookingsAPI, matchesAPI } from '../utils/api';
import toast from 'react-hot-toast';

const SECTION_LAYOUT = {
  'Platinum Pavilion': { rows: ['A','B','C','D'], seatsPerRow: 20, prefix: 'P', color: '#E5C100' },
  'Gold Stand':        { rows: ['E','F','G','H','I','J','K','L'], seatsPerRow: 25, prefix: 'G', color: '#FFD700' },
  'Silver Stand':      { rows: ['M','N','O','P','Q','R','S','T'], seatsPerRow: 30, prefix: 'S', color: '#C0C0C0' },
  'General':           { rows: ['U','V','W','X','Y','Z'], seatsPerRow: 40, prefix: 'N', color: '#CD7F32' }
};

export default function SeatSelectionPage() {
  const { id: matchId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [seats, setSeats] = useState([]);
  const [seatMap, setSeatMap] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activeCategory, setActiveCategory] = useState(state?.category?.name || '');
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const maxQty = state?.quantity || 1;

  useEffect(() => {
    const init = async () => {
      try {
        const [matchRes, seatsRes] = await Promise.all([
          matchesAPI.getById(matchId),
          seatsAPI.getByMatch(matchId).catch(() => ({ data: [] }))
        ]);
        setMatch(matchRes.data);
        if (!activeCategory && matchRes.data.ticketCategories?.[0]) {
          setActiveCategory(matchRes.data.ticketCategories[0].name);
        }

        const map = {};
        seatsRes.data.forEach(s => { map[s.seatNumber] = s; });
        setSeatMap(map);
        setSeats(seatsRes.data);
      } catch (e) {
        toast.error('Failed to load seats');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [matchId]);

  const toggleSeat = useCallback((seatNum, status) => {
    if (status === 'booked') return;
    if (status === 'held') return; // held by others

    setSelectedSeats(prev => {
      if (prev.includes(seatNum)) return prev.filter(s => s !== seatNum);
      if (prev.length >= maxQty) {
        toast.error(`Max ${maxQty} seat${maxQty > 1 ? 's' : ''} allowed`);
        return prev;
      }
      return [...prev, seatNum];
    });
  }, [maxQty]);

  const handleProceed = async () => {
    if (selectedSeats.length === 0) { toast.error('Please select at least one seat'); return; }
    setHolding(true);
    try {
      const seatObjects = selectedSeats.map(sn => seatMap[sn]).filter(Boolean);
      const seatIds = seatObjects.map(s => s._id);

      await seatsAPI.holdSeats(matchId, seatIds);

      const category = match.ticketCategories.find(c => c.name === activeCategory);
      const booking = await bookingsAPI.create({
        matchId,
        seatIds,
        attendees: [{ name: 'Attendee' }]
      });

      navigate(`/checkout/${booking.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to hold seats. Try again.');
    } finally {
      setHolding(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;
  if (!match) return <div className="page"><div className="container">Match not found.</div></div>;

  const config = SECTION_LAYOUT[activeCategory] || Object.values(SECTION_LAYOUT)[0];
  const categoryInfo = match.ticketCategories?.find(c => c.name === activeCategory);
  const totalPrice = selectedSeats.length * (categoryInfo?.price || 0);

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontSize: 14, marginBottom: 16 }}>
            ← Back
          </button>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            SELECT <span style={{ color: 'var(--ipl-orange)' }}>SEATS</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {match.team1.shortName} vs {match.team2.shortName} · {match.venue.name}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
          {/* Stadium Map */}
          <div>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {match.ticketCategories?.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => { setActiveCategory(cat.name); setSelectedSeats([]); }}
                  style={{
                    padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 14,
                    background: activeCategory === cat.name ? (cat.color || 'var(--ipl-orange)') : 'var(--bg-card)',
                    color: activeCategory === cat.name ? '#000' : 'var(--text-secondary)',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat.name}
                  <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.8 }}>₹{cat.price.toLocaleString()}</span>
                </button>
              ))}
            </div>

            {/* Stadium visual */}
            <StadiumVisual match={match} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

            {/* Seat Grid */}
            <div className="card" style={{ padding: '24px', marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 20 }}>{activeCategory}</h3>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                  <LegendItem color="var(--bg-surface)" border="rgba(255,255,255,0.2)" label="Available" />
                  <LegendItem color={config.color} label="Selected" />
                  <LegendItem color="rgba(255,255,255,0.08)" label="Booked" />
                </div>
              </div>

              {/* Screen/Pitch */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  display: 'inline-block', padding: '6px 40px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.15), transparent)',
                  border: '1px solid rgba(255,215,0,0.3)', borderRadius: 4,
                  fontFamily: 'Rajdhani, sans-serif', fontSize: 12, letterSpacing: '0.15em',
                  color: 'var(--ipl-gold)', textTransform: 'uppercase'
                }}>🏏 PITCH</div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                {config.rows.map(row => (
                  <div key={row} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <span style={{ width: 20, textAlign: 'center', fontFamily: 'Rajdhani, sans-serif', fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{row}</span>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'nowrap' }}>
                      {Array.from({ length: config.seatsPerRow }, (_, i) => {
                        const seatNum = `${config.prefix}${row}${i + 1}`;
                        const seatData = seatMap[seatNum];
                        const status = seatData?.status || 'available';
                        const isSelected = selectedSeats.includes(seatNum);

                        let bg = 'rgba(255,255,255,0.06)';
                        let border = '1px solid rgba(255,255,255,0.12)';
                        if (isSelected) { bg = config.color; border = `1px solid ${config.color}`; }
                        else if (status === 'booked') { bg = 'rgba(255,255,255,0.03)'; border = '1px solid rgba(255,255,255,0.05)'; }
                        else if (status === 'held') { bg = 'rgba(255,107,0,0.2)'; border = '1px solid rgba(255,107,0,0.3)'; }

                        return (
                          <div
                            key={seatNum}
                            title={`${seatNum} - ${status}`}
                            onClick={() => toggleSeat(seatNum, status)}
                            style={{
                              width: 14, height: 14, borderRadius: 2,
                              background: bg, border,
                              cursor: status === 'booked' ? 'not-allowed' : 'pointer',
                              transition: 'all 0.15s',
                              flexShrink: 0
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20, fontSize: 20 }}>YOUR SELECTION</h3>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Selected Seats ({selectedSeats.length}/{maxQty})
                </div>
                {selectedSeats.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic', padding: '12px 0' }}>No seats selected</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {selectedSeats.map(sn => (
                      <span key={sn} style={{
                        background: `${config.color}22`, border: `1px solid ${config.color}66`,
                        color: config.color, padding: '3px 10px', borderRadius: 4,
                        fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 14
                      }}>{sn}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="divider" />

              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 14 }}>
                <span>Category</span><span style={{ color: config.color }}>{activeCategory}</span>
              </div>
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 14 }}>
                <span>{selectedSeats.length} × ₹{categoryInfo?.price?.toLocaleString()}</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 13 }}>
                <span>Convenience (2%)</span>
                <span>₹{Math.round(totalPrice * 0.02).toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 20 }}>
                <span>Total</span>
                <span style={{ color: 'var(--ipl-gold)' }}>₹{(totalPrice + Math.round(totalPrice * 0.02)).toLocaleString()}</span>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleProceed}
                disabled={selectedSeats.length === 0 || holding}
              >
                {holding ? <span className="spinner" /> : `Proceed to Checkout →`}
              </button>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                Seats held for 10 minutes after selection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StadiumVisual({ match, activeCategory, onSelectCategory }) {
  const cats = match.ticketCategories || [];
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 24, textAlign: 'center'
    }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
        Stadium Overview — {match.venue.name}
      </div>
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '0 auto', aspectRatio: '4/3' }}>
        {/* Outer ring (General) */}
        <StadiumRing size={100} color={cats[3]?.color || '#CD7F32'} label="General" cat={cats[3]} active={activeCategory === 'General'} onClick={() => onSelectCategory('General')} />
        <StadiumRing size={75} color={cats[2]?.color || '#C0C0C0'} label="Silver" cat={cats[2]} active={activeCategory === 'Silver Stand'} onClick={() => onSelectCategory('Silver Stand')} />
        <StadiumRing size={52} color={cats[1]?.color || '#FFD700'} label="Gold" cat={cats[1]} active={activeCategory === 'Gold Stand'} onClick={() => onSelectCategory('Gold Stand')} />
        <StadiumRing size={30} color={cats[0]?.color || '#E5C100'} label="Platinum" cat={cats[0]} active={activeCategory === 'Platinum Pavilion'} onClick={() => onSelectCategory('Platinum Pavilion')} />
        {/* Pitch center */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '12%', height: '12%', borderRadius: '50%',
          background: 'rgba(0,200,100,0.3)', border: '2px solid rgba(0,200,100,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10
        }}>🏏</div>
      </div>
    </div>
  );
}

function StadiumRing({ size, color, label, cat, active, onClick }) {
  return (
    <div
      onClick={onClick}
      title={`${label} — ₹${cat?.price?.toLocaleString()}`}
      style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${size}%`, aspectRatio: '1',
        borderRadius: '50%',
        border: `${active ? 4 : 2}px solid ${color}`,
        background: active ? `${color}22` : `${color}08`,
        cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: active ? `0 0 20px ${color}44` : 'none'
      }}
    />
  );
}

function LegendItem({ color, border, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 12, height: 12, borderRadius: 2, background: color, border: border || 'none' }} />
      <span>{label}</span>
    </div>
  );
}
