import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { TeamLogo, IPL_TEAMS } from '../utils/teams';

export default function MatchCard({ match }) {
  const { team1, team2, venue, date, time, matchType, ticketCategories, status } = match;
  const minPrice = ticketCategories ? Math.min(...ticketCategories.map(c => c.price)) : 0;
  const totalAvailable = ticketCategories ? ticketCategories.reduce((s, c) => s + c.availableSeats, 0) : 0;
  const isFinal = matchType === 'final';
  const isPlayoff = ['qualifier', 'eliminator', 'final'].includes(matchType);
  const t1 = IPL_TEAMS[team1.shortName] || {};
  const t2 = IPL_TEAMS[team2.shortName] || {};

  const isCompleted = status === 'completed';
  const isLive = status === 'live';

  // Status badge config
  const statusConfig = {
    upcoming: { label: '🟢 Upcoming', bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' },
    live:     { label: '🔴 LIVE',     bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' },
    completed:{ label: '✅ Finished', bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.3)' },
    cancelled:{ label: '❌ Cancelled', bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' },
  };
  const badge = statusConfig[status] || statusConfig.upcoming;

  return (
    <div className="card card-glow" style={{
      position: 'relative', overflow: 'hidden',
      opacity: isCompleted ? 0.75 : 1,
      transition: 'opacity 0.2s'
    }}>
      {/* Team color gradient background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${team1.color || '#ff6b00'}18 0%, transparent 50%, ${team2.color || '#ffd700'}18 100%)`,
        pointerEvents: 'none'
      }} />

      {/* Top color bar — greyed out if completed */}
      <div style={{
        height: 4,
        background: isCompleted
          ? '#444'
          : `linear-gradient(90deg, ${team1.color || '#ff6b00'}, ${team2.color || '#ffd700'})`
      }} />

      {/* Playoff badge */}
      {isPlayoff && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: isFinal ? 'linear-gradient(135deg, #ffd700, #ff9500)' : 'rgba(255,107,0,0.2)',
          color: isFinal ? '#000' : '#ff6b00',
          border: isFinal ? 'none' : '1px solid rgba(255,107,0,0.4)',
          padding: '3px 10px', borderRadius: 4,
          fontFamily: 'Bebas Neue, sans-serif', fontSize: 12, letterSpacing: '0.1em'
        }}>{isFinal ? '⭐ FINAL' : matchType.toUpperCase()}</div>
      )}

      <div style={{ padding: '18px 22px', position: 'relative' }}>

        {/* Match number + venue + date row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <span className="badge badge-orange" style={{ marginBottom: 5, display: 'inline-block', fontSize: 11 }}>MATCH {match.matchNumber}</span>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {venue.name}, {venue.city}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)' }}>
              {date ? format(new Date(date), 'dd MMM yyyy') : '—'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{time}</div>
          </div>
        </div>

        {/* Teams */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
            <div style={{ padding: 5, borderRadius: '50%', background: `${team1.color}22`, border: `2px solid ${team1.color}55` }}>
              <TeamLogo shortName={team1.shortName} size={50} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: isCompleted ? '#888' : (team1.color || '#fff'), lineHeight: 1 }}>{team1.shortName}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', maxWidth: 90 }}>{team1.name}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '0 10px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: isCompleted ? '#666' : 'var(--ipl-orange)', textShadow: isCompleted ? 'none' : '0 0 20px rgba(255,107,0,0.4)' }}>VS</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif' }}>T20</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
            <div style={{ padding: 5, borderRadius: '50%', background: `${team2.color}22`, border: `2px solid ${team2.color}55` }}>
              <TeamLogo shortName={team2.shortName} size={50} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: isCompleted ? '#888' : (team2.color || '#fff'), lineHeight: 1 }}>{team2.shortName}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', maxWidth: 90 }}>{team2.name}</div>
            </div>
          </div>
        </div>

        {/* Taglines */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: team1.color, fontFamily: 'Rajdhani, sans-serif', fontStyle: 'italic', opacity: 0.8 }}>"{t1.tagline}"</div>
          <div style={{ fontSize: 10, color: team2.color, fontFamily: 'Rajdhani, sans-serif', fontStyle: 'italic', opacity: 0.8, textAlign: 'right' }}>"{t2.tagline}"</div>
        </div>

        <div className="divider" style={{ margin: '12px 0' }} />

        {/* Bottom row — price + status badge + button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {!isCompleted && (
              <>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tickets from</div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: 'var(--ipl-gold)' }}>₹{minPrice.toLocaleString('en-IN')}</div>
              </>
            )}
            {isCompleted && (
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>This match has ended</div>
            )}
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>

            {/* Status badge */}
            <div style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'Rajdhani, sans-serif',
              letterSpacing: '0.05em',
              background: badge.bg,
              color: badge.color,
              border: badge.border,
              animation: isLive ? 'pulse 1.5s infinite' : 'none'
            }}>
              {badge.label}
            </div>

            {/* Seats left — only for upcoming/live */}
            {!isCompleted && (
              <div style={{ fontSize: 11, color: totalAvailable < 5000 ? '#ff6b00' : 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif' }}>
                {totalAvailable > 0 ? `${totalAvailable.toLocaleString()} seats left` : '⚡ Almost full!'}
              </div>
            )}

            {/* Button */}
            {isCompleted ? (
              <button disabled style={{
                padding: '6px 16px', borderRadius: 6, fontSize: 13,
                background: '#2a2a2a', color: '#555', border: '1px solid #333',
                cursor: 'not-allowed', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600
              }}>
                Booking Closed
              </button>
            ) : (
              <Link to={`/matches/${match._id}`} className="btn btn-primary btn-sm">
                {isLive ? '🔴 Book Now' : '🎟️ Book Now'}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* CSS for live pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}