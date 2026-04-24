import React, { useState, useEffect } from 'react';
import { matchesAPI } from '../utils/api';
import MatchCard from '../components/MatchCard';

const TEAMS = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'PBKS', 'RR', 'SRH', 'GT', 'LSG'];
const CITIES = ['All Cities', 'Chennai', 'Mumbai', 'Kolkata', 'Delhi', 'Hyderabad', 'Bengaluru', 'Ahmedabad', 'Mohali', 'Jaipur', 'Lucknow'];

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    matchesAPI.getAll()
      .then(res => { setMatches(res.data); setFiltered(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = matches;
    if (selectedTeam) {
      result = result.filter(m => m.team1.shortName === selectedTeam || m.team2.shortName === selectedTeam);
    }
    if (selectedCity && selectedCity !== 'All Cities') {
      result = result.filter(m => m.venue.city.toLowerCase().includes(selectedCity.toLowerCase()));
    }
    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(m =>
        m.team1.name.toLowerCase().includes(q) ||
        m.team2.name.toLowerCase().includes(q) ||
        m.venue.city.toLowerCase().includes(q) ||
        m.team1.shortName.toLowerCase().includes(q) ||
        m.team2.shortName.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [selectedTeam, selectedCity, searchText, matches]);

  const clearFilters = () => { setSelectedTeam(''); setSelectedCity('All Cities'); setSearchText(''); };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div className="badge badge-orange" style={{ marginBottom: 12 }}>IPL 2025</div>
          <h1>MATCH <span style={{ color: 'var(--ipl-orange)' }}>SCHEDULE</span></h1>
          <p>Browse all matches and book your tickets</p>
        </div>

        {/* Filters */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 32
        }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label">Search</label>
              <input
                className="form-input" placeholder="Team name or city..."
                value={searchText} onChange={e => setSearchText(e.target.value)}
              />
            </div>
            <div style={{ flex: '0 1 160px' }}>
              <label className="form-label">Team</label>
              <select className="form-input" value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
                <option value="">All Teams</option>
                {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: '0 1 180px' }}>
              <label className="form-label">City</label>
              <select className="form-input" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {(selectedTeam || selectedCity !== 'All Cities' || searchText) && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ alignSelf: 'flex-end' }}>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div style={{ marginBottom: 24, color: 'var(--text-secondary)', fontFamily: 'Rajdhani, sans-serif' }}>
          {!loading && <span>{filtered.length} match{filtered.length !== 1 ? 'es' : ''} found</span>}
        </div>

        {/* Match Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div className="loader" style={{ margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏏</div>
            <h3 style={{ color: 'var(--text-secondary)' }}>No matches found</h3>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-2" style={{ paddingBottom: 60 }}>
            {filtered.map((m, i) => (
              <div key={m._id} style={{ animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}>
                <MatchCard match={m} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
