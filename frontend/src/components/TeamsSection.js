import React, { useState } from 'react';
import { IPL_TEAMS, TeamLogo } from '../utils/teams';

export default function TeamsSection() {
  const [hovered, setHovered] = useState(null);
  const teams = Object.values(IPL_TEAMS);

  return (
    <section className="section" style={{ background: 'var(--bg-dark)', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="badge badge-orange" style={{ marginBottom: 12 }}>IPL 2025</div>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            THE <span style={{ color: 'var(--ipl-orange)' }}>10 TEAMS</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Who's your team? Pick your side and book your seat.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16
        }}>
          {teams.map((team, i) => (
            <div
              key={team.shortName}
              onMouseEnter={() => setHovered(team.shortName)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === team.shortName ? `${team.color}18` : 'var(--bg-card)',
                border: `1px solid ${hovered === team.shortName ? team.color + '66' : 'var(--border)'}`,
                borderRadius: 12, padding: '20px 16px', textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.25s ease',
                transform: hovered === team.shortName ? 'translateY(-4px)' : 'none',
                boxShadow: hovered === team.shortName ? `0 12px 30px ${team.color}22` : 'none',
                animation: `fadeUp 0.4s ease ${i * 0.05}s both`
              }}
            >
              {/* Logo */}
              <div style={{
                display: 'flex', justifyContent: 'center', marginBottom: 12,
                filter: hovered === team.shortName ? `drop-shadow(0 0 8px ${team.color}88)` : 'none',
                transition: 'filter 0.25s'
              }}>
                <TeamLogo shortName={team.shortName} size={60} />
              </div>

              {/* Team name */}
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif', fontSize: 22,
                color: hovered === team.shortName ? team.color : 'var(--text-primary)',
                letterSpacing: '0.05em', lineHeight: 1, marginBottom: 4,
                transition: 'color 0.25s'
              }}>
                {team.shortName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 10 }}>
                {team.name}
              </div>

              {/* Tagline */}
              <div style={{
                fontSize: 10, color: team.color, fontFamily: 'Rajdhani, sans-serif',
                fontStyle: 'italic', opacity: hovered === team.shortName ? 1 : 0.6,
                transition: 'opacity 0.25s', marginBottom: 10
              }}>
                "{team.tagline}"
              </div>

              {/* Stats row */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: 12,
                paddingTop: 10, borderTop: `1px solid ${team.color}33`
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'var(--ipl-gold)', lineHeight: 1 }}>
                    {team.titles}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Titles
                  </div>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {team.captain}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Captain
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
