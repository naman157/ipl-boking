import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchesAPI } from '../utils/api';
import MatchCard from '../components/MatchCard';
import TeamsSection from '../components/TeamsSection';
import { TeamLogo, IPL_TEAMS } from '../utils/teams';

export default function HomePage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    matchesAPI.getAll({ status: 'upcoming' })
      .then(res => setMatches(res.data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Cricket field background effect */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `
            radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,107,0,0.08) 0%, transparent 70%),
            radial-gradient(ellipse at 80% 20%, rgba(255,215,0,0.05) 0%, transparent 50%),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 40px,
              rgba(255,255,255,0.01) 40px,
              rgba(255,255,255,0.01) 41px
            )
          `
        }} />

        {/* Floating team logos */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '45%',
          display: 'flex', flexWrap: 'wrap', alignContent: 'center',
          justifyContent: 'center', gap: 16, opacity: 0.15, pointerEvents: 'none'
        }}>
          {Object.values(IPL_TEAMS).map((team, i) => (
            <div key={team.shortName} style={{
              animation: `fadeIn 0.5s ease ${i * 0.1}s both`,
              transform: `rotate(${(i % 3 - 1) * 8}deg)`
            }}>
              <TeamLogo shortName={team.shortName} size={70} />
            </div>
          ))}
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 720, animation: 'fadeUp 0.7s ease both' }}>
            <div className="badge badge-orange" style={{ marginBottom: 24, fontSize: 13 }}>
              🏏 IPL 2025 — Season Tickets Open
            </div>
            <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(4rem, 10vw, 8rem)', lineHeight: 0.9, marginBottom: 28 }}>
              BOOK YOUR<br />
              <span style={{
                background: 'linear-gradient(90deg, #ff6b00, #ffd700)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>SEAT AT THE</span><br />
              STADIUM
            </h1>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 500, lineHeight: 1.6 }}>
              Live the energy. Feel the roar. Book official IPL 2025 tickets for your favourite team — from Platinum pavilions to general stands.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/matches" className="btn btn-primary btn-lg">
                🎟️ Book Tickets
              </Link>
              <Link to="/matches" className="btn btn-secondary btn-lg">
                View Schedule
              </Link>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 40, marginTop: 60, paddingTop: 40, borderTop: '1px solid rgba(255,107,0,0.15)' }}>
              {[['10', 'Teams'], ['74', 'Matches'], ['4', 'Venues'], ['50K+', 'Seats']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: 'var(--ipl-orange)', lineHeight: 1 }}>{num}</div>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED MATCHES */}
      <section className="section" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
            <div>
              <div className="badge badge-gold" style={{ marginBottom: 10 }}>Featured</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>UPCOMING MATCHES</h2>
            </div>
            <Link to="/matches" className="btn btn-secondary btn-sm">View All →</Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><div className="loader" style={{ margin: '0 auto' }} /></div>
          ) : matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No matches loaded yet.</p>
              <button className="btn btn-primary" onClick={() => matchesAPI.seed().then(() => window.location.reload())}>
                Seed Sample Matches
              </button>
            </div>
          ) : (
            <div className="grid grid-3">
              {matches.map((m, i) => (
                <div key={m._id} style={{ animation: `fadeUp 0.5s ease ${i * 0.1}s both` }}>
                  <MatchCard match={m} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>HOW IT WORKS</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>4 simple steps to your seat</p>
          </div>
          <div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {[
              { n: '01', icon: '🏟️', title: 'Choose Match', desc: 'Browse the full IPL 2025 schedule and pick your match.' },
              { n: '02', icon: '💺', title: 'Select Seats', desc: 'Pick your preferred stand and seats from the live stadium map.' },
              { n: '03', icon: '💳', title: 'Pay Securely', desc: 'Complete payment via UPI, card, or net banking — powered by Stripe.' },
              { n: '04', icon: '🎟️', title: 'Get E-Ticket', desc: 'Receive your QR-coded ticket instantly. Show at the gate.' }
            ].map((step, i) => (
              <div key={step.n} className="card" style={{ padding: '32px 24px', textAlign: 'center', animation: `fadeUp 0.5s ease ${i * 0.12}s both` }}>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, color: 'rgba(255,107,0,0.2)', lineHeight: 1, marginBottom: 8 }}>{step.n}</div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{step.icon}</div>
                <h4 style={{ fontSize: 18, marginBottom: 8 }}>{step.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAMS SECTION */}
      <TeamsSection />

      {/* FOOTER CTA */}
      <section style={{ padding: '80px 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', marginBottom: 16 }}>
            READY TO <span style={{ color: 'var(--ipl-orange)' }}>ROAR</span>?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 36 }}>
            Seats are filling up fast. Don't miss your team's biggest games.
          </p>
          <Link to="/matches" className="btn btn-primary btn-lg">🏏 Book Now</Link>
        </div>
      </section>
    </div>
  );
}
